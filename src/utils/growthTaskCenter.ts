import type { TaskType } from "~utils/taskTypes";
import { getStorage, setStorage } from "~utils/functions";
import { storageName } from "~utils/consts";

/**
 * GrowthTaskStatus
 *
 * 用途：
 * - growth 页面自动关注任务的运行状态。
 */
export type GrowthTaskStatus = "running" | "paused";

/**
 * FollowedUserRecord
 *
 * 用途：
 * - 用于 Active Actions -> Details 中展示“本任务已关注过的用户列表”。
 * - 该数据需要持久化到 storage，以便页面刷新后仍可查看。
 *
 * 属性：
 * - userId：目标用户 id。
 * - username：目标用户名。
 * - avatarUrl：头像 URL（可选）。
 * - followers：粉丝数（可选）。
 * - following：关注数（可选）。
 * - followStatus：关注结果状态（可选）。
 * - followedAt：关注时间戳（毫秒）。
 */
export interface FollowedUserRecord {
  /**
   * 用途：目标用户 id。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  userId: string;

  /**
   * 用途：目标用户名。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  username?: string;

  /**
   * 用途：目标头像 URL。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  avatarUrl?: string;

  /**
   * 用途：目标粉丝数。
   * 类型：number
   * 可选性：可选
   * 默认值：无
   */
  followers?: number;

  /**
   * 用途：目标关注数。
   * 类型：number
   * 可选性：可选
   * 默认值：无
   */
  following?: number;

  /**
   * 用途：关注状态。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   *
   * 说明：
   * - 该字段直接存储 `InsRequestUtils.autoFollow` 返回的 `result.result` 原始值，不做解析。
   */
  followStatus?: string;

  /**
   * 用途：关注发生时间（毫秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：Date.now()
   */
  followedAt: number;
}

/**
 * GrowthTask
 *
 * 用途：
 * - growth 页面 Active Actions 列表中任务的数据结构。
 * - 该结构仅描述“任务元信息与进度”，具体执行器（真正去关注用户）后续再接入。
 *
 * 属性：
 * - id：任务唯一标识。
 * - type：任务类型（与 TaskType 保持一致）。
 * - title：任务标题，用于 UI 展示。
 * - status：任务状态（running/paused）。
 * - sourceInput：用户输入（账号名/帖子链接/文件名等）。
 * - createdAt：创建时间戳（毫秒）。
 * - updatedAt：更新时间戳（毫秒）。
 * - progress：已处理数量。
 * - total：预计总数量（当前可为 0，后续接入数据源后再回填）。
 */
export interface GrowthTask {
  /**
   * 用途：任务唯一标识。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  id: string;

  /**
   * 用途：任务类型。
   * 类型：TaskType
   * 可选性：必填
   * 默认值：无
   */
  type: TaskType;

  /**
   * 用途：任务标题。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  title: string;

  /**
   * 用途：任务运行状态。
   * 类型：GrowthTaskStatus
   * 可选性：必填
   * 默认值：paused
   */
  status: GrowthTaskStatus;

  /**
   * 用途：任务输入原文。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  sourceInput?: string;

  /**
   * 用途：创建时间。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  createdAt: number;

  /**
   * 用途：更新时间。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  updatedAt: number;

  /**
   * 用途：任务进度（已处理数量）。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  progress: number;

  /**
   * 用途：任务总量（预计数量）。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  total: number;

  /**
   * 用途：任务来源链接（例如竞对主页、Post/Reel 链接）。
   * 类型：string
   * 可选性：可选
   * 默认值：无
   */
  sourceUrl?: string;

  /**
   * 用途：本任务已关注用户列表（用于 Active Actions -> Details 展示）。
   * 类型：FollowedUserRecord[]
   * 可选性：可选
   * 默认值：[]
   *
   * 说明：
   * - 该字段会随 Runner 每次关注成功追加，并持久化到 storage。
   * - 为避免无限增长，Runner 会进行裁剪（例如保留最近 N 条）。
   */
  followedUsers?: FollowedUserRecord[];

  /**
   * 用途：已关注人数（用于 UI 展示）。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  followedCount?: number;

  /**
   * 用途：已回关人数（用于 UI 展示）。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  followedBackCount?: number;

  /**
   * 用途：已清理人数（用于 UI 展示）。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  cleanedCount?: number;

  /**
   * 用途：已清理（已取关）的用户 id 列表。
   * 类型：string[]
   * 可选性：可选
   * 默认值：[]
   *
   * 说明：
   * - 用于“清理未回关（取关）”功能的幂等控制。
   * - 当用户多次点击 Clean 时，需要跳过已经取关成功过的 userId，避免 cleanedCount 重复累加。
   * - 该字段会持久化到 storage（Active/Stopped 均可存在）。
   */
  cleanedUserIds?: string[];

  /**
   * 用途：今日已执行动作数（用于 UI 展示）。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  todayActions?: number;

  /**
   * 用途：预计完成耗时描述（用于 UI 展示）。
   * 类型：string
   * 可选性：可选
   * 默认值：无
   */
  estimatedDays?: string;

  /**
   * 用途：影响描述（用于 UI 展示）。
   * 类型：string
   * 可选性：可选
   * 默认值：无
   */
  impact?: string;

  /**
   * 用途：Runner 分页游标（用于 followers/following 拉取分页）。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  runnerAfter?: string;

  /**
   * 用途：Runner 是否还有下一页（followers/following 分页）。
   * 类型：boolean
   * 可选性：可选
   * 默认值：true
   */
  runnerHasNextPage?: boolean;

  /**
   * 用途：任务来源账号 userId（用于 followers/following 查询）。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  sourceUserId?: string;

  /**
   * 用途：competitor-follow 选择抓取 followers / following。
   * 类型："followers" | "following"
   * 可选性：可选
   * 默认值：followers
   */
  competitorEdge?: "followers" | "following";

  /**
   * 用途：post-follow 任务的用户来源模式。
   * 类型："likers" | "commenters" | "both"
   * 可选性：可选
   * 默认值：both
   */
  postSourceMode?: "likers" | "commenters" | "both";

  /**
   * 用途：post-follow 输入的原始链接。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  postUrl?: string;

  /**
   * 用途：post-follow 解析出的 shortCode（用于评论 GraphQL）。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  postShortCode?: string;

  /**
   * 用途：post-follow 解析出的 mediaId（用于点赞者接口）。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  postMediaId?: string;

  /**
   * 用途：post-follow 评论分页游标。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  postCommentAfter?: string;

  /**
   * 用途：post-follow 评论是否还有下一页。
   * 类型：boolean
   * 可选性：可选
   * 默认值：true
   */
  postCommentHasNextPage?: boolean;

  /**
   * 用途：post-follow 点赞者列表是否已拉取完成。
   * 类型：boolean
   * 可选性：可选
   * 默认值：false
   */
  postLikersDone?: boolean;

  /**
   * 用途：post-follow 评论者列表是否已处理完成。
   * 类型：boolean
   * 可选性：可选
   * 默认值：false
   */
  postCommentersDone?: boolean;

  /**
   * 用途：post-follow 待处理用户队列（用于刷新恢复进度）。
   * 类型：string[]
   * 可选性：可选
   * 默认值：[]
   *
   * 说明：
   * - 该队列存储“待自动关注”的 userId。
   * - Runner 会从队列头部取出并执行 autoFollow。
   */
  postQueueUserIds?: string[];

  /**
   * 用途：post-follow 已处理/已尝试用户去重集合（用于刷新恢复进度）。
   * 类型：string[]
   * 可选性：可选
   * 默认值：[]
   *
   * 说明：
   * - 使用数组而非 Set，是为了能持久化到 storage。
   * - Runner 会将其转换为 Set 用于去重判断。
   */
  postSeenUserIds?: string[];

  /**
   * 用途：csv-follow 导入的用户名列表。
   * 类型：string[]
   * 可选性：可选
   * 默认值：[]
   *
   * 说明：
   * - 存储从 CSV/Excel 文件中解析出的 Instagram 用户名（清洗后）。
   * - Runner 会逐个将用户名解析为 userId 并执行关注。
   */
  csvUsernames?: string[];

  /**
   * 用途：任务过滤条件（来自 CreateTask 的 Advanced Settings）。
   * 类型：any
   * 可选性：可选
   * 默认值：无
   */
  filters?: any;
}

/**
 * StoppedGrowthTask
 *
 * 用途：
 * - growth 页面 Stopped Actions 列表中任务的数据结构。
 * - 该结构为“历史记录”，不再参与 Active Actions 的并发规则。
 */
export interface StoppedGrowthTask extends GrowthTask {
  /**
   * 用途：停止时间。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  stoppedAt: number;

  /**
   * 用途：停止原因。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  stopReason?: string;
}

/**
 * GrowthTaskSnapshot
 *
 * 用途：
 * - UI 一次性读取与渲染所需的任务快照。
 */
export interface GrowthTaskSnapshot {
  /**
   * 用途：活跃任务列表（running + paused）。
   * 类型：GrowthTask[]
   * 可选性：必填
   * 默认值：[]
   */
  activeTasks: GrowthTask[];

  /**
   * 用途：停止任务列表（近 30 天）。
   * 类型：StoppedGrowthTask[]
   * 可选性：必填
   * 默认值：[]
   */
  stoppedTasks: StoppedGrowthTask[];
}

/**
 * 生成任务 id。
 *
 * 用途：
 * - 为任务提供唯一标识。
 *
 * 返回值：
 * - string
 */
function generateTaskId(): string {
  try {
    // 部分环境支持 crypto.randomUUID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyCrypto: any = globalThis.crypto;
    if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  } catch {
    // ignore
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * 读取 Active Tasks。
 *
 * 用途：
 * - 统一读取 storage 并做容错。
 */
async function readActiveTasks(): Promise<GrowthTask[]> {
  const list = (await getStorage(storageName.growthActiveTasksStorageName)) || [];
  return Array.isArray(list) ? (list as GrowthTask[]) : [];
}

/**
 * 读取 Stopped Tasks，并按“近 30 天”裁剪。
 */
async function readStoppedTasks(): Promise<StoppedGrowthTask[]> {
  const list = await getStorage(storageName.growthStoppedTasksStorageName);
  const raw = Array.isArray(list) ? (list as StoppedGrowthTask[]) : [];

  const now = Date.now();
  const days30Ms = 30 * 24 * 60 * 60 * 1000;

  const filtered = raw.filter((t) => typeof t?.stoppedAt === "number" && now - t.stoppedAt <= days30Ms);
  return filtered;
}

/**
 * 裁剪 Stopped tasks。
 *
 * 用途：
 * - 写入 stopped tasks 前进行统一过滤，避免 storage 无限制增长。
 *
 * 参数：
 * - tasks：StoppedGrowthTask[]；待写入的 stopped tasks。
 *
 * 返回值：
 * - StoppedGrowthTask[]；已按“最近 30 天”过滤后的列表。
 *
 * 异常：
 * - 本方法不抛异常；若输入不合法则返回空数组。
 */
function trimStoppedTasks(tasks: StoppedGrowthTask[]): StoppedGrowthTask[] {
  try {
    const raw = Array.isArray(tasks) ? tasks : [];
    const now = Date.now();
    const days30Ms = 30 * 24 * 60 * 60 * 1000;
    return raw.filter((t) => typeof t?.stoppedAt === "number" && now - t.stoppedAt <= days30Ms);
  } catch {
    return [];
  }
}

/**
 * 写入 Active Tasks。
 */
async function writeActiveTasks(tasks: GrowthTask[]): Promise<void> {
  await setStorage(storageName.growthActiveTasksStorageName, tasks);
}

/**
 * 写入 Stopped Tasks。
 */
async function writeStoppedTasks(tasks: StoppedGrowthTask[]): Promise<void> {
  await setStorage(storageName.growthStoppedTasksStorageName, tasks);
}

/**
 * 更新 Active Task（按 id 合并 patch）。
 *
 * 用途：
 * - 供任务 Runner 持续回写进度、统计、分页游标等信息。
 * - 仅更新 Active Tasks 列表，不影响 Stopped Tasks。
 *
 * 参数：
 * - taskId：string；任务 id。
 * - patch：Partial<GrowthTask>；需要合并的字段。
 *
 * 返回值：
 * - GrowthTaskSnapshot
 */
export async function patchActiveGrowthTask(
  taskId: string,
  patch: Partial<GrowthTask>
): Promise<GrowthTaskSnapshot> {
  const now = Date.now();
  const active = await readActiveTasks();
  const next: GrowthTask[] = active.map((t) =>
    t?.id === taskId ? ({ ...t, ...patch, updatedAt: now } as GrowthTask) : t
  );
  await writeActiveTasks(next);
  return getGrowthTaskSnapshot();
}

/**
 * 更新 Stopped Task（按 id 合并 patch）。
 *
 * 用途：
 * - 在 Stopped Actions 中对历史任务做“清理未回关（取关）”等补充操作时，回写 cleanedCount 等统计字段。
 * - 仅更新 Stopped Tasks 列表，不影响 Active Tasks。
 *
 * 参数：
 * - taskId：string；任务 id。
 * - patch：Partial<GrowthTask>；需要合并的字段（例如 cleanedCount）。
 *
 * 返回值：
 * - Promise<GrowthTaskSnapshot>
 */
export async function patchStoppedGrowthTask(
  taskId: string,
  patch: Partial<GrowthTask>
): Promise<GrowthTaskSnapshot> {
  const now = Date.now();
  const stopped = await readStoppedTasks();
  const next: StoppedGrowthTask[] = stopped.map((t) =>
    t?.id === taskId ? ({ ...t, ...patch, updatedAt: now } as StoppedGrowthTask) : t
  );
  await writeStoppedTasks(trimStoppedTasks(next));
  return getGrowthTaskSnapshot();
}

/**
 * 获取任务快照。
 *
 * 用途：
 * - UI 初始化时读取当前任务状态。
 *
 * 返回值：
 * - GrowthTaskSnapshot
 */
export async function getGrowthTaskSnapshot(): Promise<GrowthTaskSnapshot> {
  const [activeTasks, stoppedTasks] = await Promise.all([readActiveTasks(), readStoppedTasks()]);
  return {
    activeTasks,
    stoppedTasks
  };
}

/**
 * 订阅任务快照变化。
 *
 * 用途：
 * - 让 UI 自动响应任务状态变化（无需手动刷新）。
 *
 * 参数：
 * - onChange：回调函数；当任务相关 storage key 变化时触发。
 *
 * 返回值：
 * - () => void；取消订阅函数。
 */
export function subscribeGrowthTaskSnapshot(onChange: (snapshot: GrowthTaskSnapshot) => void): () => void {
  const handler = async (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local") return;

    if (
      changes[storageName.growthActiveTasksStorageName] ||
      changes[storageName.growthStoppedTasksStorageName]
    ) {
      const snapshot = await getGrowthTaskSnapshot();
      onChange(snapshot);
    }
  };

  chrome.storage.onChanged.addListener(handler);

  return () => {
    chrome.storage.onChanged.removeListener(handler);
  };
}

/**
 * 创建任务。
 *
 * 用途：
 * - CreateTask 点击“开始自动关注”时创建任务。
 * - 注意：创建任务不等于启动任务；启动需要调用 `startGrowthTask`。
 *
 * 参数：
 * - type：TaskType；任务类型。
 * - sourceInput：string；用户输入。
 * - filters：any；过滤条件。
 *
 * 返回值：
 * - GrowthTask；创建后的任务。
 */
export async function createGrowthTask(params: {
  type: TaskType;
  sourceInput: string;
  filters?: any;
}): Promise<GrowthTask> {
  const now = Date.now();
  const id = generateTaskId();

  const title = (() => {
    const input = (params.sourceInput || "").trim();
    if (params.type === "competitor-follow") return `Follow from Competitor (${input})`;
    if (params.type === "post-follow") return `Follow from Post (${input})`;
    if (params.type === "csv-follow") return `Follow from CSV (${input})`;
    if (params.type === "unfollow") return `Unfollow (${input})`;
    return `Task (${input})`;
  })();

  const task: GrowthTask = {
    id,
    type: params.type,
    title,
    status: "paused",
    sourceInput: params.sourceInput,
    createdAt: now,
    updatedAt: now,
    progress: 0,
    total: 0,
    filters: params.filters
  };

  const active = await readActiveTasks();
  await writeActiveTasks([task, ...active]);

  return task;
}

/**
 * 启动任务（并自动暂停其他 running 任务）。
 *
 * 用途：
 * - 满足“同一时间只能运行一个任务”的规则。
 * - 新任务启动时：将其他 running 任务置为 paused。
 *
 * 参数：
 * - taskId：string
 *
 * 返回值：
 * - GrowthTaskSnapshot
 */
export async function startGrowthTask(taskId: string): Promise<GrowthTaskSnapshot> {
  const now = Date.now();
  const active = await readActiveTasks();

  const next: GrowthTask[] = active.map((t) => {
    if (!t) return t;

    if (t.id === taskId) {
      return { ...t, status: "running" as GrowthTaskStatus, updatedAt: now };
    }

    if (t.status === "running") {
      return { ...t, status: "paused" as GrowthTaskStatus, updatedAt: now };
    }

    return t;
  });

  await writeActiveTasks(next);
  return getGrowthTaskSnapshot();
}

/**
 * 暂停任务。
 */
export async function pauseGrowthTask(taskId: string): Promise<GrowthTaskSnapshot> {
  const now = Date.now();
  const active = await readActiveTasks();
  const next: GrowthTask[] = active.map((t) =>
    t?.id === taskId ? { ...t, status: "paused" as GrowthTaskStatus, updatedAt: now } : t
  );
  await writeActiveTasks(next);
  return getGrowthTaskSnapshot();
}

/**
 * 删除 Active task 记录。
 *
 * 用途：
 * - 用户在 Active Actions 中点击 Delete 时，任务应直接从 Active 列表移除。
 * - 该操作不应写入 Stopped Actions（Stopped 仅保留完成/停止的任务）。
 *
 * 参数：
 * - taskId：string；任务 id。
 *
 * 返回值：
 * - GrowthTaskSnapshot；最新快照。
 */
export async function deleteActiveGrowthTask(taskId: string): Promise<GrowthTaskSnapshot> {
  const active = await readActiveTasks();
  const remaining = active.filter((t) => t?.id !== taskId);
  await writeActiveTasks(remaining);
  return getGrowthTaskSnapshot();
}

/**
 * 停止任务：从 Active 移除，并写入 Stopped（近 30 天）。
 */
export async function stopGrowthTask(taskId: string, stopReason?: string): Promise<GrowthTaskSnapshot> {
  const now = Date.now();
  const active = await readActiveTasks();

  const target = active.find((t) => t?.id === taskId);
  const remaining = active.filter((t) => t?.id !== taskId);

  await writeActiveTasks(remaining);

  if (target && stopReason === "completed") {
    const stopped = await readStoppedTasks();
    const nextStopped: StoppedGrowthTask[] = [
      {
        ...target,
        // 计数字段兜底：避免 stopped actions 展示出现 undefined
        progress: target.progress ?? 0,
        total: target.total ?? 0,
        followedCount: target.followedCount ?? 0,
        followedBackCount: target.followedBackCount ?? 0,
        cleanedCount: target.cleanedCount ?? 0,
        todayActions: target.todayActions ?? 0,
        status: "paused" as GrowthTaskStatus,
        updatedAt: now,
        stoppedAt: now,
        stopReason: stopReason || ""
      },
      ...stopped
    ];

    await writeStoppedTasks(trimStoppedTasks(nextStopped));
  }

  return getGrowthTaskSnapshot();
}

/**
 * 删除 stopped task 记录。
 */
export async function deleteStoppedGrowthTask(taskId: string): Promise<GrowthTaskSnapshot> {
  const stopped = await readStoppedTasks();
  const next = stopped.filter((t) => t?.id !== taskId);
  await writeStoppedTasks(next);
  return getGrowthTaskSnapshot();
}
