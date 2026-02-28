import { storageName } from "~utils/consts";
import { getCurrentDate, getStorage, setStorage } from "~utils/functions";

/**
 * 自动关注成功（日累计）数据结构
 *
 * 用途：
 * - 记录某一天内自动关注成功的次数，用于“今日额度/今日已用”展示。
 *
 * 属性：
 * - date：字符串；日期（格式：MM/DD/YYYY），由 `getCurrentDate()` 生成。
 * - count：number；当天累计成功次数。
 */
export interface AutoFollowSuccessDailyCounter {
  /**
   * 用途：记录所属日期。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  date: string;

  /**
   * 用途：当天成功次数。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  count: number;
}

/**
 * 自动关注成功记录
 *
 * 用途：
 * - 记录每一次自动关注成功的事件，用于统计“近 7 天新增关注”。
 *
 * 属性：
 * - operatorUserId：当前执行自动关注的 Instagram 登录账号 id（用于隔离不同账号的统计口径）。
 * - targetUserId：被关注的目标账号 id。
 * - time：成功发生时间戳（毫秒）。
 */
export interface AutoFollowSuccessRecord {
  /**
   * 用途：执行者 Instagram 账号 id。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  operatorUserId: string;

  /**
   * 用途：被关注账号 id。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  targetUserId: string;

  /**
   * 用途：成功发生时间戳（毫秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  time: number;
}

/**
 * 获取自动关注成功日累计（仅当天）。
 *
 * 用途：
 * - 用于 UI 展示“今日已用”。
 *
 * 返回值：
 * - AutoFollowSuccessDailyCounter；若不存在则返回 `{date: today, count: 0}`。
 *
 * 异常：
 * - 读取 storage 异常时返回默认值。
 */
export async function getAutoFollowSuccessDailyCounter(): Promise<AutoFollowSuccessDailyCounter> {
  try {
    const today = getCurrentDate();
    const data = (await getStorage(
      storageName.autoFollowSuccessDailyStorageName
    )) as AutoFollowSuccessDailyCounter | null;

    if (!data || data.date !== today) {
      return { date: today, count: 0 };
    }

    return {
      date: today,
      count: typeof data.count === "number" ? data.count : 0
    };
  } catch {
    return { date: getCurrentDate(), count: 0 };
  }
}

/**
 * 增加一次“自动关注成功”的日累计。
 *
 * 用途：
 * - 当某次自动关注成功后调用，使“今日已用”计数 +1。
 *
 * 参数：
 * - inc：number；增加的数量。
 *
 * 返回值：
 * - AutoFollowSuccessDailyCounter；更新后的当日计数。
 *
 * 异常：
 * - storage 读写失败时不会抛出，返回计算后的值（但可能未成功持久化）。
 */
export async function incrementAutoFollowSuccessDailyCounter(
  inc: number = 1
): Promise<AutoFollowSuccessDailyCounter> {
  const today = getCurrentDate();
  try {
    const current = await getAutoFollowSuccessDailyCounter();
    const next = {
      date: today,
      count: Math.max(0, (current.count ?? 0) + inc)
    };
    await setStorage(storageName.autoFollowSuccessDailyStorageName, next);
    return next;
  } catch {
    const next = { date: today, count: inc };
    return next;
  }
}

/**
 * 记录一次自动关注成功事件。
 *
 * 用途：
 * - 用于统计“近 7 天新增关注（followingGrowth7d）”。
 * - 统计口径：按 `operatorUserId` 隔离；同一 operator 在 7 天内对同一 `targetUserId` 的成功仅计 1 次。
 *
 * 参数：
 * - record：AutoFollowSuccessRecord；成功记录。
 *
 * 返回值：
 * - void
 *
 * 异常：
 * - storage 读写失败时不抛出异常（避免影响主流程）。
 */
export async function recordAutoFollowSuccess(record: AutoFollowSuccessRecord): Promise<void> {
  try {
    const list = ((await getStorage(
      storageName.autoFollowSuccessRecordsStorageName
    )) || []) as AutoFollowSuccessRecord[];

    const next: AutoFollowSuccessRecord[] = [
      {
        operatorUserId: record.operatorUserId,
        targetUserId: record.targetUserId,
        time: record.time
      },
      ...list
    ];

    // 简单裁剪，避免无限增长
    const maxLen = 5000;
    await setStorage(
      storageName.autoFollowSuccessRecordsStorageName,
      next.slice(0, maxLen)
    );
  } catch {
    // swallow
  }
}

/**
 * 获取某个 Instagram 账号近 7 天新增关注数量。
 *
 * 用途：
 * - `UserProfile` 里的 `followingGrowth7d` 数据来源。
 *
 * 统计规则：
 * - 仅统计 `operatorUserId` 匹配的记录。
 * - 仅统计 `now - time <= 7 天` 的记录。
 * - 同一个 `targetUserId` 在窗口期内只计 1 次（去重）。
 *
 * 参数：
 * - operatorUserId：string；当前 Instagram 登录账号 id。
 *
 * 返回值：
 * - number：近 7 天新增关注数量。
 *
 * 异常：
 * - storage 读取失败时返回 0。
 */
export async function getFollowingGrowth7d(operatorUserId: string): Promise<number> {
  try {
    if (!operatorUserId) return 0;

    const now = Date.now();
    const windowMs = 7 * 24 * 60 * 60 * 1000;

    const list = ((await getStorage(
      storageName.autoFollowSuccessRecordsStorageName
    )) || []) as AutoFollowSuccessRecord[];

    const seen = new Set<string>();
    for (const item of list) {
      if (!item) continue;
      if (item.operatorUserId !== operatorUserId) continue;
      if (!item.targetUserId) continue;
      if (typeof item.time !== "number") continue;
      if (now - item.time > windowMs) continue;
      seen.add(item.targetUserId);
    }

    return seen.size;
  } catch {
    return 0;
  }
}

/**
 * 获取某个 Instagram 账号“历史累计关注成功去重总数”。
 *
 * 用途：
 * - `UserProfile` 里的 `following`（累计关注总计）数据来源。
 * - 统计口径：仅统计通过本插件自动关注成功的记录，并按 `operatorUserId` 隔离。
 *
 * 统计规则：
 * - 仅统计 `operatorUserId` 匹配的记录。
 * - 对 `targetUserId` 做全量去重（不限制时间窗口）。
 *
 * 参数：
 * - operatorUserId：string；当前 Instagram 登录账号 id。
 *
 * 返回值：
 * - number：历史累计关注成功去重总数。
 *
 * 异常：
 * - storage 读取失败时返回 0。
 */
export async function getTotalFollowingDistinctAllTime(operatorUserId: string): Promise<number> {
  try {
    if (!operatorUserId) return 0;

    const list = ((await getStorage(
      storageName.autoFollowSuccessRecordsStorageName
    )) || []) as AutoFollowSuccessRecord[];

    const seen = new Set<string>();
    for (const item of list) {
      if (!item) continue;
      if (item.operatorUserId !== operatorUserId) continue;
      if (!item.targetUserId) continue;
      seen.add(item.targetUserId);
    }

    return seen.size;
  } catch {
    return 0;
  }
}
