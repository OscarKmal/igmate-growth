import { InsRequestUtils } from "~utils/InsRequestUtils";
import {
  getMediaIdFromPostUrl,
  parseInstagramUrl,
  queryHash
} from "~utils/commonFunction";
import {
  getGrowthTaskSnapshot,
  patchActiveGrowthTask,
  pauseGrowthTask,
  stopGrowthTask,
  type GrowthTask
} from "~utils/growthTaskCenter";
import { parseInsUserFromSeed } from "~utils/insUserSeedParser";
import {
  incrementAutoFollowSuccessDailyCounter,
  recordAutoFollowSuccess
} from "~utils/autoFollowStats";
import { buildTaskEstimatedDaysText } from "~utils/estimateTimeUtils";
import { getStorage, sleep } from './functions';
import { storageName } from './consts';
import type { FollowedUserRecord } from "~utils/growthTaskCenter";
import { Fetcher } from "~utils/Fetcher";

/**
 * GrowthTaskRunner
 *
 * 用途：
 * - growth 页面任务执行器（前台版）。
 * - 监听页面内 Active Tasks，当存在 running 任务时，按任务类型拉取候选用户并执行自动关注。
 *
 * 说明：
 * - 当前实现先支持 competitor-follow（账号来源）。
 * - 后续可扩展：post-follow、csv-follow。
 *
 * 注意：
 * - 该 Runner 运行在 tab 页面上下文中；若关闭 growth tab，则 Runner 会停止。
 */
class GrowthTaskRunner {
  private started: boolean = false;
  private stopped: boolean = false;
  private runningLoop: boolean = false;
  private operatorUserId: string = "";

  /**
   * 用途：固定请求耗时（秒）。
   *
   * 说明：
   * - 用于预计完成时间估算。
   * - 该值由产品策略决定，当前取 1.5s。
   */
  private readonly fixedRequestDurationSeconds: number = 1.5;

  /**
   * 用途：安全间隔配置。
   */
  private safetySettings = {
    requestInterval: 6,
    failedPauseInterval: 600,
    requestRandomRange: 4
  };

  /**
   * 可中断等待。
   *
   * 用途：
   * - 解决“用户手动暂停/删除任务后，Runner 仍卡在 sleep 中无法立刻切换”的问题。
   * - 等待期间每隔一小段时间检查任务是否仍存在且仍为 running。
   * - 一旦任务被删除或不再 running，则提前结束等待。
   *
   * 参数：
   * - taskId：string；任务 id。
   * - totalMs：number；期望等待总毫秒数。
   * - stepMs：number；检查间隔毫秒数。
   *
   * 返回值：
   * - Promise<boolean>
   *   - true：完成了全部等待。
   *   - false：等待期间被中断（任务被删除/暂停/Runner 停止）。
   */
  private async cancellableWait(taskId: string, totalMs: number, stepMs: number = 500): Promise<boolean> {
    const safeTotalMs = Number.isFinite(totalMs) ? Math.max(0, Math.floor(totalMs)) : 0;
    const safeStepMs = Number.isFinite(stepMs) ? Math.max(50, Math.floor(stepMs)) : 500;

    if (!taskId) {
      await sleep(safeTotalMs);
      return true;
    }

    let elapsed = 0;
    while (!this.stopped && elapsed < safeTotalMs) {
      const snapshot = await getGrowthTaskSnapshot();
      const latest = snapshot.activeTasks.find((t) => t?.id === taskId);
      if (!latest || latest.status !== "running") {
        return false;
      }

      const remain = safeTotalMs - elapsed;
      const ms = Math.min(safeStepMs, remain);
      await sleep(ms);
      elapsed += ms;
    }

    return elapsed >= safeTotalMs;
  }

  /**
   * 计算任务预计完成时间文案。
   *
   * 用途：
   * - 将 task.total/task.progress 与安全设置组合，计算并返回用于 UI 展示的 estimatedDays。
   * - 统一出口，避免在多个 patch 点位重复拼装逻辑。
   *
   * 参数：
   * - total：number；任务总量。
   * - progress：number；任务进度。
   *
   * 返回值：
   * - string：预计完成时间文案；当 total<=0 时返回空字符串。
   */
  private buildEstimatedDaysText(total: number, progress: number): string {
    return buildTaskEstimatedDaysText({
      total,
      progress,
      requestIntervalSeconds: this.safetySettings.requestInterval,
      requestRandomRangeSeconds: this.safetySettings.requestRandomRange,
      fixedRequestDurationSeconds: this.fixedRequestDurationSeconds
    });
  }

  /**
   * 刷新安全配置。
   */
  private async refreshSafetySettings() {
    try {
      const saved = await getStorage(storageName.safetySettingsStorageName);
      if (saved) {
        this.safetySettings = {
          requestInterval: Number(saved.requestInterval?.value || 6),
          failedPauseInterval: Number(saved.failedPauseInterval?.value || 600),
          requestRandomRange: Number(saved.requestRandomRange?.value || 4)
        };
      }
    } catch (error) {
      console.error('Error refreshing safety settings:', error);
    }
  }

  /**
   * 构造“已关注用户记录”。
   *
   * 用途：
   * - 当某次 autoFollow 成功后，组装一条可用于 UI Details 展示的数据。
   * - 该记录会持久化到 storage（挂在 GrowthTask.followedUsers 上）。
   *
   * 参数：
   * - targetUserId：string；被关注的目标 userId。
   * - seed：any；可选的种子数据（例如 followers/following 列表节点），用于直接取 username/avatar，减少额外请求。
   *
   * 返回值：
   * - FollowedUserRecord
   *
   * 异常：
   * - 网络请求失败时会降级返回仅包含 userId + followedAt 的记录。
   */
  private async buildFollowedUserRecord(
    targetUserId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seed?: any
  ): Promise<FollowedUserRecord> {
    const parsed = parseInsUserFromSeed(seed);
    const record: FollowedUserRecord = {
      userId: targetUserId,
      username: parsed.username,
      avatarUrl: parsed.avatarUrl,
      followers: parsed.followers,
      following: parsed.following,
      followStatus: "",
      followedAt: Date.now()
    };

    try {
      if (
        record.username &&
        record.avatarUrl &&
        typeof record.followers === "number" &&
        typeof record.following === "number"
      ) {
        return record;
      }

      const userRtn = await InsRequestUtils.getInsUserInfo(targetUserId);
      if (userRtn?.success && userRtn.data) {
        record.username = record.username || userRtn.data.username;
        record.avatarUrl = record.avatarUrl || userRtn.data.profileImage;
        record.followers = typeof userRtn.data.follower === "number" ? userRtn.data.follower : record.followers;
        record.following = typeof userRtn.data.following === "number" ? userRtn.data.following : record.following;
      }
    } catch {
      // ignore
    }

    return record;
  }

  /**
   * 等待请求间隔（含随机范围）。
   */
  private async waitRequestInterval(taskId?: string) {
    const base = this.safetySettings.requestInterval;
    const range = this.safetySettings.requestRandomRange;
    const randomOffset = Math.random() * range;
    const totalMs = (base + randomOffset) * 1000;
    await this.cancellableWait(taskId || "", totalMs);
  }

  /**
   * 等待失败暂停间隔（含随机范围）。
   */
  private async waitFailurePauseInterval(taskId?: string) {
    const base = this.safetySettings.failedPauseInterval;
    const range = this.safetySettings.requestRandomRange;
    const randomOffset = Math.random() * range;
    const totalMs = (base + randomOffset) * 1000;
    await this.cancellableWait(taskId || "", totalMs);
  }

  /**
   * 用途：连续无进展计数（用于自动 stop）。
   * 类型：Record<string, number>
   * 可选性：必填
   * 默认值：{}
   */
  private noProgressMap: Record<string, number> = {};

  /**
   * 用途：关键接口连续失败次数（按 taskId 维度统计）。
   *
   * 说明：
   * - 当关键接口返回 success=false 时累加。
   * - 当任一关键接口成功时清零。
   * - 达到阈值后自动 pause 任务，避免高频失败请求导致风控/封号。
   */
  private criticalFailureMap: Record<string, number> = {};

  /**
   * 用途：连续失败阈值。
   *
   * 说明：
   * - 连续失败达到该次数后，将任务自动暂停。
   */
  private readonly criticalFailurePauseThreshold: number = 3;

  /**
   * 关键接口成功：清零连续失败计数。
   *
   * 用途：
   * - 只要关键接口有一次成功，就认为当前环境恢复，失败计数应重置。
   *
   * 参数：
   * - taskId：string；任务 id。
   */
  private resetCriticalFailure(taskId: string) {
    if (!taskId) return;
    this.criticalFailureMap[taskId] = 0;
  }

  /**
   * 关键接口失败：执行安全退避 + 计数 + 达阈值自动暂停。
   *
   * 用途：
   * - 避免 loop 每秒扫描导致的“失败高频重试”。
   * - 对同一任务的连续失败进行计数，达到阈值后自动暂停任务。
   *
   * 参数：
   * - taskId：string；任务 id。
   * - reason：string；失败原因（仅用于日志）。
   *
   * 返回值：
   * - Promise<void>
   */
  private async handleCriticalFailure(taskId: string, reason: string) {
    if (!taskId) {
      await this.waitFailurePauseInterval();
      return;
    }

    const current = this.criticalFailureMap[taskId] || 0;
    const next = current + 1;
    this.criticalFailureMap[taskId] = next;

    console.warn(`[GrowthTaskRunner] critical failure: taskId=${taskId}, count=${next}, reason=${reason}`);

    // 先执行退避等待，降低重试频率
    await this.waitFailurePauseInterval(taskId);

    // 达到阈值：自动暂停任务
    if (next >= this.criticalFailurePauseThreshold) {
      try {
        await pauseGrowthTask(taskId);
      } finally {
        // 暂停后清零计数，避免用户恢复后立刻再次触发阈值
        this.resetCriticalFailure(taskId);
      }
    }
  }


  /**
   * 启动 Runner。
   *
   * 用途：
   * - 在 growth.tsx 挂载时调用。
   *
   * 返回值：
   * - void
   */
  start() {
    if (this.started) return;
    this.started = true;
    this.stopped = false;
    this.operatorUserId = "";
    this.noProgressMap = {};
    this.criticalFailureMap = {};
    this.loop();
  }

  /**
   * 停止 Runner。
   *
   * 用途：
   * - 在 growth.tsx 卸载时调用。
   *
   * 返回值：
   * - void
   */
  stop() {
    this.stopped = true;
  }

  /**
   * Runner 主循环。
   *
   * 用途：
   * - 每 1s 扫描一次 active tasks，找到 running 任务并执行一个“最小工作单元”。
   * - 最小工作单元：尽量只处理少量用户，避免 UI 卡顿。
   */
  private async loop() {
    if (this.runningLoop) return;
    this.runningLoop = true;

    try {
      while (!this.stopped) {
        await this.refreshSafetySettings();
        const snapshot = await getGrowthTaskSnapshot();
        const runningTask = snapshot.activeTasks.find((t) => t.status === "running");

        if (!runningTask) {
          await sleep(1000);
          continue;
        }

        // 尽量缓存操作者 userId（用于自动关注成功统计）。
        if (!this.operatorUserId) {
          const currentUser = await InsRequestUtils.getCurrentUser();
          this.operatorUserId = currentUser?.success ? (currentUser.data?.userId || "") : "";
        }

        if (runningTask.type === "competitor-follow") {
          await this.runCompetitorFollow(runningTask);
        } else if (runningTask.type === "post-follow") {
          await this.runPostFollow(runningTask);
        } else if (runningTask.type === "csv-follow") {
          await this.runCsvFollow(runningTask);
        } else {
          // 其他类型暂未实现：避免 busy loop
          await sleep(1000);
        }
      }
    } finally {
      this.runningLoop = false;
    }
  }

  /**
   * competitor-follow 执行逻辑（账号来源）。
   *
   * 约定：
   * - `task.sourceInput` 为竞对用户名。
   * - `task.competitorEdge` 默认为 followers（后续 CreateTask 可让用户选择 following）。
   *
   * 执行步骤：
   * - 1) username -> userId
   * - 2) 分页拉取 followers/following（每次拉一页）
   * - 3) 对本页的用户逐个 autoFollow（每次最多处理 N 个）
   * - 4) 成功后写入统计，并回写任务进度
   */
  private async runCompetitorFollow(task: GrowthTask) {
    // 每轮最多执行多少次关注，避免一次循环太重
    const maxOpsPerTick = 3;

    const sourceInput = (task.sourceInput || "").trim();
    if (!sourceInput) {
      await sleep(1000);
      return;
    }

    // 1) 确保 sourceUserId
    let sourceUserId = task.sourceUserId;
    if (!sourceUserId) {
      const userRtn = await InsRequestUtils.getUserByUsername(sourceInput);
      if (!userRtn?.success || !userRtn.data?.userId) {
        await this.handleCriticalFailure(task.id, "competitor-follow:getUserByUsername");
        return;
      }

      this.resetCriticalFailure(task.id);

      sourceUserId = userRtn.data.userId;

      await patchActiveGrowthTask(task.id, {
        sourceUserId,
        sourceUrl: `https://www.instagram.com/${userRtn.data.username}/`,
        competitorEdge: task.competitorEdge || "followers",
        runnerAfter: "",
        runnerHasNextPage: true,
        total: 0,
        estimatedDays: this.buildEstimatedDaysText(0, task.progress || 0)
      });

      // 让 UI 先刷新
      await sleep(200);
      return;
    }

    // 2) 拉取一页候选用户
    const edge = task.competitorEdge || "followers";
    const edgeType = edge === "followers" ? "edge_followed_by" : "edge_follow";
    const hash = edge === "followers" ? queryHash.follower : queryHash.following;

    const pageSize = (() => {
      const n = parseInt(process.env.PLASMO_PUBLIC_INS_PAGESIZE);
      return Number.isFinite(n) && n > 0 ? n : 20;
    })();

    const page = await InsRequestUtils.fetchFollowUsers(
      sourceUserId,
      hash,
      edgeType,
      pageSize,
      task.runnerAfter || ""
    );

    if (!page?.success) {
      await this.handleCriticalFailure(task.id, "competitor-follow:fetchFollowUsers");
      return;
    }

    this.resetCriticalFailure(task.id);

    const users = Array.isArray(page.users) ? page.users : [];

    // 回写分页信息 + total
    const nextTotal = page.count || task.total || 0;
    await patchActiveGrowthTask(task.id, {
      total: nextTotal,
      runnerAfter: page.endCursor || "",
      runnerHasNextPage: !!page.hasNextPage,
      estimatedDays: this.buildEstimatedDaysText(nextTotal, task.progress || 0)
    });

    // 3) 执行 autoFollow
    let ops = 0;
    let tickSuccess = 0;
    for (const u of users) {
      if (ops >= maxOpsPerTick) break;

      // 每次操作前都再确认当前任务仍在 running（避免用户 pause 后还继续）
      const latest = (await getGrowthTaskSnapshot()).activeTasks.find((t) => t.id === task.id);
      if (!latest || latest.status !== "running") return;

      const targetUserId = u?.id;
      if (!targetUserId) continue;

      const followRtn = await InsRequestUtils.autoFollow(targetUserId);
      if (followRtn?.success) {
        this.resetCriticalFailure(task.id);
        // 统计：今日 +1
        await incrementAutoFollowSuccessDailyCounter(1);

		// 同步：将本次关注关系上报后端，用于插件侧粉丝统计（不影响主流程）
		if (this.operatorUserId) {
			try {
				await Fetcher.addFollow(task.id, this.operatorUserId, targetUserId);
			} catch {
				// swallow
			}
		}

        // 统计：近 7 天新增（按 operatorUserId 隔离）
        if (this.operatorUserId) {
          await recordAutoFollowSuccess({
            operatorUserId: this.operatorUserId,
            targetUserId,
            time: Date.now()
          });
        }

        // 回写任务进度
        const currentProgress = latest.progress || 0;
        const currentFollowed = latest.followedCount || 0;
        const currentToday = latest.todayActions || 0;

        const newRecord = await this.buildFollowedUserRecord(targetUserId, u);
        newRecord.followStatus = typeof followRtn.data === "string" ? followRtn.data : String(followRtn.data ?? "");
        const nextFollowedUsers = [
          newRecord,
          ...((latest.followedUsers || []) as FollowedUserRecord[])
        ];

        const maxFollowedUsersLen = 200;

        const nextProgress = currentProgress + 1;

        await patchActiveGrowthTask(latest.id, {
          progress: nextProgress,
          followedCount: currentFollowed + 1,
          todayActions: currentToday + 1,
          followedUsers: nextFollowedUsers.slice(0, maxFollowedUsersLen),
          estimatedDays: this.buildEstimatedDaysText(latest.total || 0, nextProgress)
        });

        tickSuccess++;
        ops++;
      } else {
        await this.handleCriticalFailure(task.id, "competitor-follow:autoFollow");
      }

      // 控制节奏：使用安全随机间隔
      await this.waitRequestInterval(task.id);
    }

    // 自动 stop：分页结束 + 本页没有用户
    if (!page.hasNextPage && users.length === 0) {
      await stopGrowthTask(task.id, "completed");
      return;
    }

    // 自动 stop：连续无进展（避免一直 running）
    const currentNoProgress = this.noProgressMap[task.id] || 0;
    const nextNoProgress = tickSuccess > 0 ? 0 : currentNoProgress + 1;
    this.noProgressMap[task.id] = nextNoProgress;

    // 连续 20 轮无成功（约 20s+），自动结束
    if (nextNoProgress >= 20) {
      await stopGrowthTask(task.id, "no_progress");
      return;
    }

    // 4) 如果没有下一页，则标记 runnerHasNextPage=false
    if (!page.hasNextPage) {
      await patchActiveGrowthTask(task.id, {
        runnerHasNextPage: false
      });
      await sleep(1000);
    }
  }

  /**
   * post-follow 执行逻辑（帖子来源）。
   *
   * 支持来源：
   * - likers：使用 `fetchPostLikers(mediaId)`
   * - commenters：使用 `fetchComments(shortCode, queryHash.comments, ...)` 分页
   * - both：两者合并去重
   */
  private async runPostFollow(task: GrowthTask) {
    const maxOpsPerTick = 3;

    const postUrl = (task.postUrl || task.sourceInput || "").trim();
    if (!postUrl) {
      await sleep(1000);
      return;
    }

    const mode = task.postSourceMode || "both";

    // 初始化解析 shortCode
    let shortCode = task.postShortCode;
    if (!shortCode) {
      const parsed = parseInstagramUrl(postUrl);
      if (!parsed?.shortCode) {
        await this.handleCriticalFailure(task.id, "post-follow:parseInstagramUrl");
        return;
      }
      shortCode = parsed.shortCode;
      await patchActiveGrowthTask(task.id, {
        postUrl,
        postShortCode: shortCode,
        postCommentAfter: "",
        postCommentHasNextPage: true,
        postLikersDone: false,
        postCommentersDone: false
      });
      await sleep(200);
      return;
    }

    // 初始化解析 mediaId（用于点赞者）
    let mediaId = task.postMediaId;
    if ((mode === "likers" || mode === "both") && !mediaId) {
      const id = await getMediaIdFromPostUrl(postUrl);
      if (!id) {
        await this.handleCriticalFailure(task.id, "post-follow:getMediaIdFromPostUrl");
        return;
      }
      mediaId = id;
      await patchActiveGrowthTask(task.id, {
        postMediaId: mediaId
      });
      await sleep(200);
      return;
    }

    // 进度恢复：从任务字段恢复队列与去重集合
    const maxQueueLen = 2000;
    const maxSeenLen = 20000;

    const queue: string[] = Array.isArray(task.postQueueUserIds) ? [...task.postQueueUserIds] : [];
    const seenArr: string[] = Array.isArray(task.postSeenUserIds) ? task.postSeenUserIds : [];
    const seen = new Set<string>(seenArr);

    // 1) 拉取 likers（一次性，非分页）
    if ((mode === "likers" || mode === "both") && !task.postLikersDone && mediaId) {
      const likersRtn = await InsRequestUtils.fetchPostLikers(mediaId);
      if (likersRtn?.success) {
        this.resetCriticalFailure(task.id);
        for (const u of likersRtn.users || []) {
          const uid = u?.pk || u?.id;
          if (!uid) continue;
          if (seen.has(uid)) continue;
          seen.add(uid);
          queue.push(uid);
        }
        await patchActiveGrowthTask(task.id, {
          postLikersDone: true,
          postQueueUserIds: queue.slice(0, maxQueueLen),
          postSeenUserIds: Array.from(seen).slice(0, maxSeenLen),
          total: Math.max(task.total || 0, queue.length),
          estimatedDays: this.buildEstimatedDaysText(Math.max(task.total || 0, queue.length), task.progress || 0)
        });
      } else {
        await this.handleCriticalFailure(task.id, "post-follow:fetchPostLikers");
        return;
      }
    }

    // 2) 拉取 commenters（分页，按页追加到队列）
    if ((mode === "commenters" || mode === "both") && task.postCommentersDone !== true) {
      const pageSize = (() => {
        const n = parseInt(process.env.PLASMO_PUBLIC_INS_PAGESIZE);
        return Number.isFinite(n) && n > 0 ? n : 20;
      })();

      const after = task.postCommentAfter || "";
      const commentsRtn = await InsRequestUtils.fetchComments(shortCode, queryHash.comments, pageSize, after);
      if (!commentsRtn?.success) {
        await this.handleCriticalFailure(task.id, "post-follow:fetchComments");
        return;
      }

      this.resetCriticalFailure(task.id);

      for (const c of commentsRtn.comments || []) {
        const uid = c?.owner?.id || c?.user?.id || c?.user_id;
        if (!uid) continue;
        if (seen.has(uid)) continue;
        seen.add(uid);
        queue.push(uid);
      }

      await patchActiveGrowthTask(task.id, {
        postCommentAfter: commentsRtn.endCursor || "",
        postCommentHasNextPage: !!commentsRtn.hasNextPage,
        postCommentersDone: !commentsRtn.hasNextPage,
        postQueueUserIds: queue.slice(0, maxQueueLen),
        postSeenUserIds: Array.from(seen).slice(0, maxSeenLen),
        total: Math.max(task.total || 0, commentsRtn.count || 0),
        estimatedDays: this.buildEstimatedDaysText(
          Math.max(task.total || 0, commentsRtn.count || 0),
          task.progress || 0
        )
      });
    }

    // 3) 执行 autoFollow（从队列取）
    let ops = 0;
    let tickSuccess = 0;

    while (ops < maxOpsPerTick && queue.length > 0) {
      const latest = (await getGrowthTaskSnapshot()).activeTasks.find((t) => t.id === task.id);
      if (!latest || latest.status !== "running") return;

      const targetUserId = queue.shift();
      if (!targetUserId) break;

      const followRtn = await InsRequestUtils.autoFollow(targetUserId);
      if (followRtn?.success) {
        this.resetCriticalFailure(task.id);
        await incrementAutoFollowSuccessDailyCounter(1);

		// 同步：将本次关注关系上报后端，用于插件侧粉丝统计（不影响主流程）
		if (this.operatorUserId) {
			try {
				await Fetcher.addFollow(task.id, this.operatorUserId, targetUserId);
			} catch {
				// swallow
			}
		}
        if (this.operatorUserId) {
          await recordAutoFollowSuccess({
            operatorUserId: this.operatorUserId,
            targetUserId,
            time: Date.now()
          });
        }

        const nextProgress = (latest.progress || 0) + 1;
        const newRecord = await this.buildFollowedUserRecord(targetUserId);
        newRecord.followStatus = typeof followRtn.data === "string" ? followRtn.data : String(followRtn.data ?? "");
        const nextFollowedUsers = [
          newRecord,
          ...((latest.followedUsers || []) as FollowedUserRecord[])
        ];
        const maxFollowedUsersLen = 200;

        await patchActiveGrowthTask(latest.id, {
          progress: nextProgress,
          followedCount: (latest.followedCount || 0) + 1,
          todayActions: (latest.todayActions || 0) + 1,
          followedUsers: nextFollowedUsers.slice(0, maxFollowedUsersLen),
          postQueueUserIds: queue.slice(0, maxQueueLen),
          postSeenUserIds: Array.from(seen).slice(0, maxSeenLen),
          estimatedDays: this.buildEstimatedDaysText(latest.total || 0, nextProgress)
        });

        tickSuccess++;

        // 若本次成功后队列为空，则立刻判断是否满足 stop 条件；满足则直接 stop，避免最后一次成功还等待。
        if (queue.length === 0) {
          const latestAfterSuccess = (await getGrowthTaskSnapshot()).activeTasks.find((t) => t.id === task.id);
          if (!latestAfterSuccess || latestAfterSuccess.status !== "running") return;

          const likersDone = latestAfterSuccess.postLikersDone === true || mode === "commenters";
          const commentersDone = latestAfterSuccess.postCommentersDone === true || mode === "likers";
          if (likersDone && commentersDone) {
            await stopGrowthTask(task.id, "completed");
            return;
          }
        }
      } else {
        await this.handleCriticalFailure(task.id, "post-follow:autoFollow");
      }

      ops++;
      await this.waitRequestInterval(task.id);
    }

    // 4) 自动 stop：两类来源都 done 且队列为空
    const latestAfterOps = (await getGrowthTaskSnapshot()).activeTasks.find((t) => t.id === task.id);
    if (!latestAfterOps) return;

    const likersDone = latestAfterOps.postLikersDone === true || mode === "commenters";
    const commentersDone = latestAfterOps.postCommentersDone === true || mode === "likers";
    const queueEmpty = queue.length === 0;

    if (likersDone && commentersDone && queueEmpty) {
      await stopGrowthTask(task.id, "completed");
      return;
    }

    // 若本轮未成功，但队列发生了变化，也需要回写以便刷新恢复
    await patchActiveGrowthTask(task.id, {
      postQueueUserIds: queue.slice(0, maxQueueLen),
      postSeenUserIds: Array.from(seen).slice(0, maxSeenLen)
    });

    // 5) 自动 stop：连续无进展
    const currentNoProgress = this.noProgressMap[task.id] || 0;
    const nextNoProgress = tickSuccess > 0 ? 0 : currentNoProgress + 1;
    this.noProgressMap[task.id] = nextNoProgress;
    if (nextNoProgress >= 20) {
      await stopGrowthTask(task.id, "no_progress");
      return;
    }
  }

  /**
   * csv-follow 执行逻辑（CSV/Excel 导入）。
   *
   * 策略：
   * - 从 task.csvUsernames 中逐个取出用户名。
   * - 调用 getUserByUsername 转换为 userId。
   * - 执行 autoFollow 并记录统计与进度。
   */
  private async runCsvFollow(task: GrowthTask) {
    const maxOpsPerTick = 3;
    const usernames = Array.isArray(task.csvUsernames) ? [...task.csvUsernames] : [];

    if (usernames.length === 0) {
      await stopGrowthTask(task.id, "completed");
      return;
    }

    let ops = 0;
    let tickSuccess = 0;

    while (ops < maxOpsPerTick && usernames.length > 0) {
      // 确认任务仍处于 running 状态
      const latestSnapshot = await getGrowthTaskSnapshot();
      const latest = latestSnapshot.activeTasks.find((t) => t.id === task.id);
      if (!latest || latest.status !== "running") return;

      const username = usernames.shift();
      if (!username) break;

      // 1) 解析 username 为 userId
      const userRtn = await InsRequestUtils.getUserByUsername(username);
      if (userRtn?.success && userRtn.data?.userId) {
        this.resetCriticalFailure(task.id);
        const targetUserId = userRtn.data.userId;

        // 2) 执行 autoFollow
        const followRtn = await InsRequestUtils.autoFollow(targetUserId);
        if (followRtn?.success) {
          this.resetCriticalFailure(task.id);
          await incrementAutoFollowSuccessDailyCounter(1);

		  // 同步：将本次关注关系上报后端，用于插件侧粉丝统计（不影响主流程）
		  if (this.operatorUserId) {
			  try {
				  await Fetcher.addFollow(task.id, this.operatorUserId, targetUserId);
			  } catch {
				  // swallow
			  }
		  }
          if (this.operatorUserId) {
            await recordAutoFollowSuccess({
              operatorUserId: this.operatorUserId,
              targetUserId,
              time: Date.now()
            });
          }

          const nextProgress = (latest.progress || 0) + 1;
          const newRecord = await this.buildFollowedUserRecord(targetUserId);
          newRecord.followStatus = typeof followRtn.data === "string" ? followRtn.data : String(followRtn.data ?? "");
          const nextFollowedUsers = [
            newRecord,
            ...((latest.followedUsers || []) as FollowedUserRecord[])
          ];
          const maxFollowedUsersLen = 200;

          await patchActiveGrowthTask(latest.id, {
            progress: nextProgress,
            followedCount: (latest.followedCount || 0) + 1,
            todayActions: (latest.todayActions || 0) + 1,
            followedUsers: nextFollowedUsers.slice(0, maxFollowedUsersLen),
            csvUsernames: usernames, // 回写剩余队列
            estimatedDays: this.buildEstimatedDaysText(latest.total || 0, nextProgress)
          });
          tickSuccess++;

          // 若本次成功后队列为空，则直接 stop，避免最后一次成功还等待。
          if (usernames.length === 0) {
            await stopGrowthTask(task.id, "completed");
            return;
          }
        } else {
          // 关注失败也建议回写队列，避免死循环处理同一个用户
          await this.handleCriticalFailure(task.id, "csv-follow:autoFollow");
          await patchActiveGrowthTask(latest.id, {
            csvUsernames: usernames
          });
        }
      } else {
        // 用户名解析失败（可能账号已注销/改名）也跳过
        await this.handleCriticalFailure(task.id, "csv-follow:getUserByUsername");
        await patchActiveGrowthTask(latest.id, {
          csvUsernames: usernames
        });
      }

      ops++;
      await this.waitRequestInterval(task.id); // 使用安全随机间隔
    }

    // 自动 stop：队列耗尽
    if (usernames.length === 0) {
      await stopGrowthTask(task.id, "completed");
      return;
    }

    // 自动 stop：连续无进展判定
    const currentNoProgress = this.noProgressMap[task.id] || 0;
    const nextNoProgress = tickSuccess > 0 ? 0 : currentNoProgress + 1;
    this.noProgressMap[task.id] = nextNoProgress;
    if (nextNoProgress >= 20) {
      await stopGrowthTask(task.id, "no_progress");
      return;
    }
  }
}

/**
 * 获取 growth 任务 Runner 单例。
 *
 * 用途：
 * - 避免重复创建 Runner 导致并发执行。
 */
export const growthTaskRunner = new GrowthTaskRunner();
