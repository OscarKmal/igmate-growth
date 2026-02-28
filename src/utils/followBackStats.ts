import { Fetcher } from "~utils/Fetcher";
import { getOrCreateInsUserInfo } from "~utils/functions";
import { patchActiveGrowthTask, type GrowthTask } from "~utils/growthTaskCenter";

/**
 * 刷新 Active Tasks 的“回关人数”（Follow Back）。
 *
 * 用途：
 * - 给 `ActionCenter` 展示的 `task.followedBackCount` 提供真实数据。
 * - 统计口径：
 *   - 以任务维度统计。
 *   - 调用后端接口 `Fetcher.distinctFollowerUserIdsLast30Days(followeeUserId)` 获取“近 30 天关注过我”的用户 id 集合。
 *   - 将该集合与任务的 `followedUsers[].userId` 做集合匹配，得到 `followedBackCount`。
 *
 * 参数：
 * - activeTasks：GrowthTask[]；当前 Active Actions 任务列表。
 *
 * 返回值：
 * - Promise<void>
 *
 * 异常：
 * - 网络/接口异常时吞掉错误，避免影响 UI 主流程。
 */
export async function refreshActiveTasksFollowBackCounts(activeTasks: GrowthTask[]): Promise<void> {
  try {
    if (!Array.isArray(activeTasks) || activeTasks.length === 0) return;

    const ins = await getOrCreateInsUserInfo();
    const operatorUserId = ins?.userId || "";
    if (!operatorUserId) return;

    const rtn = await Fetcher.distinctFollowerUserIdsLast30Days(operatorUserId);
    const raw = (rtn as any)?.data ?? rtn;
    const ids = Array.isArray(raw) ? raw : (Array.isArray(raw?.userIds) ? raw.userIds : []);

    const followerSet = new Set<string>();
    for (const id of ids) {
      if (!id) continue;
      followerSet.add(String(id));
    }

    for (const task of activeTasks) {
      if (!task?.id) continue;

      const followedUsers = Array.isArray(task.followedUsers) ? task.followedUsers : [];
      if (followedUsers.length === 0) continue;

      const distinctFollowed = new Set<string>();
      for (const u of followedUsers) {
        const uid = (u as any)?.userId;
        if (!uid) continue;
        distinctFollowed.add(String(uid));
      }

      let count = 0;
      for (const uid of distinctFollowed) {
        if (followerSet.has(uid)) count += 1;
      }

      const prev = typeof task.followedBackCount === "number" ? task.followedBackCount : 0;
      if (prev === count) continue;

      await patchActiveGrowthTask(task.id, {
        followedBackCount: count
      });
    }
  } catch {
    // swallow
  }
}
