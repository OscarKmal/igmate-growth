import { Fetcher } from "~utils/Fetcher";
import { InsRequestUtils } from "~utils/InsRequestUtils";
import { loadNormalizedSafetySettings } from "~utils/safetySettingsUtils";
import {
  getGrowthTaskSnapshot,
  patchActiveGrowthTask,
  pauseGrowthTask,
  patchStoppedGrowthTask,
  type GrowthTask,
  type StoppedGrowthTask
} from "~utils/growthTaskCenter";
import { getOrCreateInsUserInfo } from "~utils/functions";

/**
 * 清理未回关用户（取关）。
 *
 * 用途：
 * - 从指定任务的 `followedUsers` 中解析出“未回关”的用户列表。
 * - 按安全规则（同自动关注：间隔+随机、失败退避、连续失败自动暂停）逐个执行取关。
 * - 实时回写任务的 `cleanedCount`，供 ActionCenter 展示。
 *
 * 判定口径：
 * - 先取本任务 `followedUsers[].userId` 去重集合。
 * - 再调用后端接口 `Fetcher.distinctFollowerUserIdsLast30Days(operatorUserId)` 得到近 30 天关注过我的用户集合（回关集合）。
 * - 差集 = 未回关用户集合。
 *
 * 参数：
 * - taskId：string；任务 id。
 * - taskScope："active" | "stopped"；任务所在列表。
 *   - active：从 Active Actions 找任务，并通过 patchActiveGrowthTask 回写进度。
 *   - stopped：从 Stopped Actions 找任务，并通过 patchStoppedGrowthTask 回写进度。
 *
 * 返回值：
 * - Promise<{ cleaned: number; totalTargets: number }>
 *
 * 异常：
 * - 本流程不向上抛出异常（吞掉网络异常），避免影响 UI 主流程。
 */
export async function cleanNonFollowers(params: {
  taskId: string;
  taskScope: "active" | "stopped";
}): Promise<{ cleaned: number; totalTargets: number }> {
  try {
    const { taskId, taskScope } = params;
    if (!taskId) return { cleaned: 0, totalTargets: 0 };

    const snapshot = await getGrowthTaskSnapshot();
    const task = (taskScope === "active"
      ? snapshot.activeTasks.find((t) => t?.id === taskId)
      : snapshot.stoppedTasks.find((t) => t?.id === taskId)) as GrowthTask | StoppedGrowthTask | undefined;

    if (!task) return { cleaned: 0, totalTargets: 0 };

    const followedUsers = Array.isArray(task.followedUsers) ? task.followedUsers : [];
    if (followedUsers.length === 0) {
      await patchCleanProgress(taskScope, taskId, new Set());
      return { cleaned: 0, totalTargets: 0 };
    }

    // 1) 读取安全配置（同自动关注的规则）
    const safety = await loadNormalizedSafetySettings();

    // 2) 获取“回关集合”（近 30 天关注过我的用户集合）
    const operatorUserId = await resolveOperatorUserId();
    if (!operatorUserId) return { cleaned: 0, totalTargets: 0 };

    const followerSet = await fetchFollowerSet(operatorUserId);

    // 3) 计算未回关集合（差集）
    const distinctFollowed = new Set<string>();
    for (const u of followedUsers) {
      const uid = (u as any)?.userId;
      if (!uid) continue;
      distinctFollowed.add(String(uid));
    }

    const targets: string[] = [];
    for (const uid of distinctFollowed) {
      if (!followerSet.has(uid)) targets.push(uid);
    }

    // 4) 幂等控制：读取并恢复已清理集合（避免重复点击 Clean 导致 cleanedCount 重复累加）
    const cleanedArr = Array.isArray((task as any).cleanedUserIds) ? ((task as any).cleanedUserIds as string[]) : [];
    const cleanedSet = new Set<string>();
    for (const uid of cleanedArr) {
      if (!uid) continue;
      cleanedSet.add(String(uid));
    }

    // 待清理列表：排除已清理的 userId，保证“最后一次成功不等待”的判断准确
    const todoTargets = targets.filter((uid) => uid && !cleanedSet.has(uid));

    // 5) 逐个执行取关（安全间隔 + 失败退避 + 连续失败自动暂停）
    // cleanedCount 以 cleanedUserIds 的去重数量为准，避免重复累加
    let cleaned = cleanedSet.size;
    await patchCleanProgress(taskScope, taskId, cleanedSet);

    let consecutiveFailures = 0;
    const failurePauseThreshold = 3;

    for (let i = 0; i < todoTargets.length; i += 1) {
      const targetUserId = todoTargets[i];

      // 若任务在执行期间被用户删除/暂停，则提前结束
      const shouldContinue = await checkTaskStillRunnable(taskScope, taskId);
      if (!shouldContinue) break;

      const unfollowRtn = await InsRequestUtils.unfollowUser(targetUserId);
      if (unfollowRtn?.success) {
        consecutiveFailures = 0;
        cleanedSet.add(targetUserId);
        cleaned = cleanedSet.size;
        await patchCleanProgress(taskScope, taskId, cleanedSet);

        // 若本次是最后一个成功，则不再等待，直接结束
        const isLast = i >= todoTargets.length - 1;
        if (!isLast) {
          await waitRequestIntervalSeconds(
            safety.requestIntervalSeconds,
            safety.requestRandomRangeSeconds,
            taskScope,
            taskId
          );
        }
      } else {
        consecutiveFailures += 1;
        await waitFailurePauseSeconds(safety.failedPauseIntervalSeconds, safety.requestRandomRangeSeconds, taskScope, taskId);

        if (consecutiveFailures >= failurePauseThreshold) {
          // 与自动关注一致：连续失败达到阈值则暂停任务（仅 Active 有“暂停”概念；Stopped 直接结束）
          if (taskScope === "active") {
            await pauseGrowthTask(taskId);
          }
          break;
        }
      }
    }

    return { cleaned, totalTargets: todoTargets.length };
  } catch {
    return { cleaned: 0, totalTargets: 0 };
  }
}

/**
 * 获取当前操作者（Instagram 登录用户）的 userId。
 *
 * 用途：
 * - distinctFollowerUserIdsLast30Days 需要 followeeUserId（我自己的 ins userId）。
 *
 * 返回值：
 * - Promise<string>：userId；获取不到则返回空字符串。
 */
async function resolveOperatorUserId(): Promise<string> {
  try {
    const ins = await getOrCreateInsUserInfo();
    const id = (ins as any)?.userId;
    return id ? String(id) : "";
  } catch {
    return "";
  }
}

/**
 * 拉取近 30 天回关用户 id 集合。
 *
 * 参数：
 * - operatorUserId：string；当前操作者（我）的 userId。
 *
 * 返回值：
 * - Promise<Set<string>>：回关集合。
 */
async function fetchFollowerSet(operatorUserId: string): Promise<Set<string>> {
  const followerSet = new Set<string>();

  try {
    const rtn = await Fetcher.distinctFollowerUserIdsLast30Days(operatorUserId);
    const raw = (rtn as any)?.data ?? rtn;
    const ids = Array.isArray(raw) ? raw : (Array.isArray(raw?.userIds) ? raw.userIds : []);

    for (const id of ids) {
      if (!id) continue;
      followerSet.add(String(id));
    }
  } catch {
    // swallow
  }

  return followerSet;
}

/**
 * 回写清理进度（cleanedCount + cleanedUserIds）。
 *
 * 用途：
 * - 让 Clean 操作具备幂等性：重复执行时不会重复累加。
 * - cleanedCount 统一以 cleanedUserIds 的去重数量为准。
 *
 * 参数：
 * - scope："active" | "stopped"；任务所在列表。
 * - taskId：string；任务 id。
 * - cleanedSet：Set<string>；已清理用户集合。
 */
async function patchCleanProgress(scope: "active" | "stopped", taskId: string, cleanedSet: Set<string>): Promise<void> {
  const ids = Array.from(cleanedSet);

  // 防止 storage 过度膨胀：理论上 followedUsers 已裁剪为 200，这里也做上限保护
  const maxLen = 2000;
  const trimmed = ids.length > maxLen ? ids.slice(ids.length - maxLen) : ids;

  const patch = {
    cleanedCount: trimmed.length,
    cleanedUserIds: trimmed
  } as Partial<GrowthTask>;

  if (scope === "active") {
    await patchActiveGrowthTask(taskId, patch);
    return;
  }

  await patchStoppedGrowthTask(taskId, patch);
}

/**
 * 检查任务是否仍可继续执行。
 *
 * 用途：
 * - 避免在用户删除/暂停任务后仍继续发请求。
 * - Active：任务必须存在且 status=running。
 * - Stopped：任务必须仍存在（允许执行，因为本身就是历史记录）。
 *
 * 返回值：
 * - Promise<boolean>
 */
async function checkTaskStillRunnable(scope: "active" | "stopped", taskId: string): Promise<boolean> {
  try {
    const snapshot = await getGrowthTaskSnapshot();

    if (scope === "active") {
      const latest = snapshot.activeTasks.find((t) => t?.id === taskId);
      return !!latest && latest.status === "running";
    }

    return snapshot.stoppedTasks.some((t) => t?.id === taskId);
  } catch {
    return false;
  }
}

/**
 * 等待请求间隔（含随机范围），并支持在等待期间检查任务可运行状态。
 *
 * 参数：
 * - baseSeconds：number；基础间隔秒数。
 * - randomRangeSeconds：number；随机范围秒数。
 * - scope："active" | "stopped"；任务所在列表。
 * - taskId：string；任务 id。
 */
async function waitRequestIntervalSeconds(
  baseSeconds: number,
  randomRangeSeconds: number,
  scope: "active" | "stopped",
  taskId: string
): Promise<void> {
  const base = Number.isFinite(baseSeconds) ? Math.max(0, baseSeconds) : 0;
  const range = Number.isFinite(randomRangeSeconds) ? Math.max(0, randomRangeSeconds) : 0;
  const randomOffset = Math.random() * range;
  const totalMs = Math.floor((base + randomOffset) * 1000);
  await cancellableWait(scope, taskId, totalMs);
}

/**
 * 等待失败退避间隔（含随机范围），并支持在等待期间检查任务可运行状态。
 */
async function waitFailurePauseSeconds(
  baseSeconds: number,
  randomRangeSeconds: number,
  scope: "active" | "stopped",
  taskId: string
): Promise<void> {
  const base = Number.isFinite(baseSeconds) ? Math.max(0, baseSeconds) : 0;
  const range = Number.isFinite(randomRangeSeconds) ? Math.max(0, randomRangeSeconds) : 0;
  const randomOffset = Math.random() * range;
  const totalMs = Math.floor((base + randomOffset) * 1000);
  await cancellableWait(scope, taskId, totalMs);
}

/**
 * 可中断等待。
 *
 * 用途：
 * - 与 GrowthTaskRunner 的 cancellableWait 对齐：等待过程中会周期性检查任务是否仍可运行。
 * - 一旦任务不可运行，则提前结束等待。
 *
 * 参数：
 * - scope："active" | "stopped"；任务所在列表。
 * - taskId：string；任务 id。
 * - totalMs：number；期望等待总毫秒数。
 * - stepMs：number；检查间隔毫秒数。
 *
 * 返回值：
 * - Promise<boolean>
 */
async function cancellableWait(
  scope: "active" | "stopped",
  taskId: string,
  totalMs: number,
  stepMs: number = 500
): Promise<boolean> {
  const safeTotalMs = Number.isFinite(totalMs) ? Math.max(0, Math.floor(totalMs)) : 0;
  const safeStepMs = Number.isFinite(stepMs) ? Math.max(50, Math.floor(stepMs)) : 500;

  let elapsed = 0;
  while (elapsed < safeTotalMs) {
    const ok = await checkTaskStillRunnable(scope, taskId);
    if (!ok) return false;

    const remain = safeTotalMs - elapsed;
    const ms = Math.min(safeStepMs, remain);
    await new Promise((resolve) => setTimeout(resolve, ms));
    elapsed += ms;
  }

  return true;
}
