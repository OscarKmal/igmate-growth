import { InsRequestUtils } from "~utils/InsRequestUtils";
import type { InsUserInfo, UserInfo } from "~modles/extension";
import {
  checkIsNeedRefreshInsProfile,
  getOrCreateInsUserInfo,
  getOrCreateUserInfo,
  covertUserInfoToExt,
  getStorage,
  setInsUserInfo,
  setUserInfo
} from "~utils/functions";
import { defaultFreeUserDailyLimit, storageName } from "~utils/consts";
import {
  getAutoFollowSuccessDailyCounter,
  getFollowingGrowth7d,
  getTotalFollowingDistinctAllTime
} from "~utils/autoFollowStats";
import { sendToBackground } from "@plasmohq/messaging";
import { Fetcher } from "~utils/Fetcher";

/**
 * GrowthUserProfileData
 *
 * 用途：
 * - growth 页面 UserProfile 区域所需的聚合数据结构。
 * - 将 Instagram 账号信息、插件账号信息、今日用量、7 天统计等统一聚合，避免 UI 内部散落业务逻辑。
 *
 * 属性：
 * - insUser：InsUserInfo；当前 Instagram 登录用户信息（来自 storage + 可能的远端刷新）。
 * - appUser：UserInfo；当前插件账号信息（来自 storage；后续可扩展校验 token）。
 * - followers：number；Instagram 当前粉丝数（当前实现若无法获取则为 0）。
 * - following：number；Instagram 当前关注数（当前实现若无法获取则为 0）。
 * - followersGrowth7d：number；近 7 天新增粉丝数（按你要求暂时为 0）。
 * - followingGrowth7d：number；近 7 天新增关注数（来自自动关注成功记录统计）。
 * - todayActionsUsed：number；今日已用（自动关注成功次数，按天累计）。
 * - todayActionsLimit：number；今日限额（从 appConfig.dayLimit 获取，缺省140）。
 * - isInsLoggedIn：boolean；Instagram 是否登录（用于 UI 展示错误态/跳登录）。
 */
export interface GrowthUserProfileData {
  /**
   * 用途：Instagram 用户信息。
   * 类型：InsUserInfo
   * 可选性：必填
   * 默认值：{}
   */
  insUser: InsUserInfo;

  /**
   * 用途：插件账号用户信息。
   * 类型：UserInfo
   * 可选性：必填
   * 默认值：{}
   */
  appUser: UserInfo;

  /**
   * 用途：粉丝总数。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  followers: number;

  /**
   * 用途：关注总数。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  following: number;

  /**
   * 用途：近 7 天新增粉丝。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  followersGrowth7d: number;

  /**
   * 用途：近 7 天新增关注。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  followingGrowth7d: number;

  /**
   * 用途：今日已用次数。
   * 类型：number
   * 可选性：必填
   * 默认值：0
   */
  todayActionsUsed: number;

  /**
   * 用途：今日限额。
   * 类型：number
   * 可选性：必填
   * 默认值：140
   */
  todayActionsLimit: number;

  /**
   * 用途：Instagram 登录状态。
   * 类型：boolean
   * 可选性：必填
   * 默认值：true
   */
  isInsLoggedIn: boolean;
}

/**
 * 将可能包含逗号的数字字符串转换成 number。
 *
 * 用途：
 * - `InsRequestUtils.checkInstagramLogin` 当前返回 `followers/following` 为 `toLocaleString()` 后的字符串。
 * - growth 页面需要 number 以便格式化/计算。
 *
 * 参数：
 * - value：unknown；输入值。
 *
 * 返回值：
 * - number；无法解析则返回 0。
 */
function toSafeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/,/g, "").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 初始化 growth 页面 UserProfile 所需的聚合数据。
 *
 * 用途：
 * - 参考 `example.tsx` 的初始化流程，提取为 utils 层可复用逻辑。
 * - UI 层只需要在合适时机调用本方法，拿到聚合结果后渲染。
 *
 * 参数：
 * - showLoading：可选函数；用于 UI 控制 loading（例如 skeleton）。
 *
 * 返回值：
 * - GrowthUserProfileData
 *
 * 异常：
 * - 该方法内部吞掉网络/存储异常，尽量返回可渲染的默认结构，避免页面崩溃。
 */
export async function initGrowthUserProfileData(
  showLoading?: (flag: boolean) => void
): Promise<GrowthUserProfileData> {
  const defaultResult: GrowthUserProfileData = {
    insUser: {},
    appUser: {},
    followers: 0,
    following: 0,
    followersGrowth7d: 0,
    followingGrowth7d: 0,
    todayActionsUsed: 0,
    todayActionsLimit: parseInt(process.env.PLASMO_PUBLIC_FREE_USER_DAILY_LIMIT),
    isInsLoggedIn: true
  };

  showLoading?.(true);

  try {
    const appConfigData = (await getStorage(storageName.appConfigStorageName)) || {};
    const appUserInfo: UserInfo = await getOrCreateUserInfo();

    /**
     * 用途：记录本地是否已有 token。
     * 说明：
     * - 即使没有 token，也需要请求一次后端，以便获取 dayLimit 等配置。
     * - 但只有在“本地原本有 token 且后端判定失效”时，才需要触发全局 logout 通知。
     */
    const hasLocalToken = !!appUserInfo.token;

    const { loginStatus, data, code } = await Fetcher.getUserInfo();
    if (loginStatus && data) {
      covertUserInfoToExt(appUserInfo, data);
      await setUserInfo(appUserInfo);
    } else {
      // 登录失效/未登录：仅当本地原本有 token 时，才做清空并触发全局 logout
      if (hasLocalToken && code === 403) {
        appUserInfo.email = null;
        appUserInfo.token = null;
        appUserInfo.memberName = "free";
        appUserInfo.name = null;
        appUserInfo.picture = null;
        appUserInfo.dayLimit = undefined;
        await setUserInfo(appUserInfo);
        await sendToBackground({
          name: "webMsg",
          body: {
            type: "logout"
          }
        });
      }
    }

    const todayActionsLimitRaw =
      appUserInfo.dayLimit ??
      (appConfigData.dayLimit ? parseInt(appConfigData.dayLimit) : defaultFreeUserDailyLimit);
    const todayActionsLimit = Number.isFinite(todayActionsLimitRaw) ? todayActionsLimitRaw : parseInt(process.env.PLASMO_PUBLIC_FREE_USER_DAILY_LIMIT);

    const insUserInfo: InsUserInfo = await getOrCreateInsUserInfo();

    // 今日已用（按天累计的自动关注成功次数）
    const dailyCounter = await getAutoFollowSuccessDailyCounter();

    // Instagram Profile 刷新（用于判断登录态、缓存账号信息；不再作为粉丝/关注“总计”展示口径）
    let isInsLoggedIn = true;
    let followers = 0;
    let following = 0;

    const needRefresh = await checkIsNeedRefreshInsProfile();
    if (needRefresh) {
      const { success, data } = await InsRequestUtils.checkInstagramLogin(() => {
        // 这里不直接驱动 UI 二次 loading，避免闪烁；由外层统一控制
      });

      if (success) {
        insUserInfo.account = data.username;
        insUserInfo.fullName = data.fullName;
        insUserInfo.avatar = data.profileImage;
        insUserInfo.isLogin = data.isLoggedIn;
        insUserInfo.userId = data.userId;
        insUserInfo.updateTime = Date.now();
        insUserInfo.isLogin = true;
        (insUserInfo as any).followerCount = String(data.followers || "0");
        (insUserInfo as any).followingCount = String(data.following || "0");

        // 仍保留抓取结果，但 UI 将改为插件统计口径
        followers = toSafeNumber(data.followers);
        following = toSafeNumber(data.following);
      } else {
        // 若已有 userId，认为仍处于可用状态（参考 example.tsx 逻辑）
        if (insUserInfo.userId) {
          insUserInfo.isLogin = true;
        } else {
          isInsLoggedIn = false;
          insUserInfo.isLogin = false;
        }
      }
    } else {
      // 未到刷新时间：沿用缓存
      // 仍保留缓存结果，但 UI 将改为插件统计口径
      followers = toSafeNumber((insUserInfo as any).followerCount);
      following = toSafeNumber((insUserInfo as any).followingCount);
      insUserInfo.isLogin = true;
    }

    await setInsUserInfo(insUserInfo);

    const operatorUserId = insUserInfo.userId || "";

    // 插件统计：粉丝数据（来自后端统计）
    let pluginFollowersTotal = 0;
    let pluginFollowersGrowth7d = 0;
    try {
      if (operatorUserId) {
        const statsRtn = await Fetcher.followerStats(operatorUserId);
        const s = statsRtn?.data || statsRtn;
        pluginFollowersTotal = Number(s?.totalFollowerCount || 0);
        pluginFollowersGrowth7d = Number(s?.last7DaysNewFollowerCount || 0);
      }
    } catch {
      pluginFollowersTotal = 0;
      pluginFollowersGrowth7d = 0;
    }

    // 插件统计：关注数据（来自本地自动关注成功记录）
    const followingGrowth7d = await getFollowingGrowth7d(operatorUserId);
    const pluginFollowingTotal = await getTotalFollowingDistinctAllTime(operatorUserId);

    return {
      insUser: insUserInfo,
      appUser: appUserInfo,
      followers: pluginFollowersTotal,
      following: pluginFollowingTotal,
      followersGrowth7d: pluginFollowersGrowth7d,
      followingGrowth7d,
      todayActionsUsed: dailyCounter.count,
      todayActionsLimit,
      isInsLoggedIn
    };
  } catch {
    return defaultResult;
  } finally {
    showLoading?.(false);
  }
}
