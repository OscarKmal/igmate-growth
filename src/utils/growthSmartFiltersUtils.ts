export interface GrowthSmartFilters {
  /**
   * 用途：仅关注已认证账号。
   * 类型：boolean
   * 可选性：可选
   * 默认值：false
   */
  requireVerified?: boolean;

  /**
   * 用途：排除 30 天内注册账号。
   * 类型：boolean
   * 可选性：可选
   * 默认值：false
   *
   * 重要说明：
   * - 当前项目的现有数据链路无法获取 Instagram 账号的注册时间（account created time）。
   * - 因此该条件暂不生效：即不会因为该条件而过滤任何用户。
   * - 未来若接入可用数据源，可在本工具内补齐真正的判断。
   */
  excludeNew30Days?: boolean;

  /**
   * 用途：最小“回关潜力”阈值（关注/粉丝 比）。
   * 类型：number
   * 可选性：可选
   * 默认值：1
   *
   * 规则约定（按产品当前定义）：
   * - 使用 following / followers 的比值。
   * - 仅当 following / followers >= minFollowRatio 时才允许关注。
   */
  minFollowRatio?: number;

  /**
   * 用途：最低发帖数门槛，用于估算账号活跃度。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  minPostCount?: number;
}

/**
 * 判断是否启用了任意“智能筛选”条件。
 *
 * 用途：
 * - GrowthTaskRunner 需要据此决定：是否必须在每次关注前拉取 getInsUserInfo。
 * - 当未启用任何筛选时，应避免不必要的额外请求。
 *
 * 参数：
 * - filters：GrowthSmartFilters | undefined；任务 filters。
 *
 * 返回值：
 * - boolean；true 表示至少启用一个筛选条件。
 */
export function hasEnabledSmartFilters(filters: GrowthSmartFilters | undefined): boolean {
  const f = filters || {};
  return !!(
    f.requireVerified ||
    f.excludeNew30Days ||
    (typeof f.minFollowRatio === "number" && Number.isFinite(f.minFollowRatio) && f.minFollowRatio > 0) ||
    (typeof f.minPostCount === "number" && Number.isFinite(f.minPostCount) && f.minPostCount > 0)
  );
}

export interface GrowthSmartFilterUserInfo {
  /**
   * 用途：用户 id。
   * 类型：string
   * 可选性：可选
   */
  userId?: string;

  /**
   * 用途：用户名。
   * 类型：string
   * 可选性：可选
   */
  username?: string;

  /**
   * 用途：头像 URL。
   * 类型：string
   * 可选性：可选
   */
  avatarUrl?: string;

  /**
   * 用途：粉丝数。
   * 类型：number
   * 可选性：可选
   */
  followers?: number;

  /**
   * 用途：关注数。
   * 类型：number
   * 可选性：可选
   */
  following?: number;

  /**
   * 用途：发帖数。
   * 类型：number
   * 可选性：可选
   */
  postCount?: number;

  /**
   * 用途：是否已认证。
   * 类型：boolean
   * 可选性：可选
   */
  isVerified?: boolean;
}

export interface SmartFilterDecision {
  /**
   * 用途：是否通过筛选。
   * 类型：boolean
   * 可选性：必填
   */
  pass: boolean;

  /**
   * 用途：未通过时的原因编码（用于调试/日志）。
   * 类型：string
   * 可选性：可选
   */
  reason?: string;

  /**
   * 用途：是否需要补充拉取用户信息（例如 getInsUserInfo），才能完成判断。
   * 类型：boolean
   * 可选性：可选
   */
  needMoreInfo?: boolean;
}

/**
 * 基于“智能筛选”配置，判断某个候选用户是否允许关注。
 *
 * 用途：
 * - GrowthTaskRunner 在 competitor-follow / post-follow / csv-follow 三种任务执行中复用该逻辑。
 * - 统一在 autoFollow 前做过滤，避免 UI 层（ActionCenter/CreateTask）出现分散的判断。
 *
 * 参数：
 * - filters：GrowthSmartFilters | undefined；任务的 filters 配置。
 * - user：GrowthSmartFilterUserInfo；候选用户的基础信息（允许不完整）。
 *
 * 返回值：
 * - SmartFilterDecision；包含是否通过、原因、以及是否需要补充信息。
 *
 * 异常：
 * - 本方法不抛异常；遇到任何异常时，默认“放行”并返回 pass=true。
 */
export function decideSmartFilter(
  filters: GrowthSmartFilters | undefined,
  user: GrowthSmartFilterUserInfo
): SmartFilterDecision {
  try {
    const f = filters || {};

    // 1) requireVerified
    if (f.requireVerified) {
      if (typeof user.isVerified !== "boolean") {
        return {
          pass: true,
          needMoreInfo: true
        };
      }
      if (user.isVerified !== true) {
        return {
          pass: false,
          reason: "require_verified"
        };
      }
    }

    // 2) minPostCount
    const minPostCount = typeof f.minPostCount === "number" ? f.minPostCount : undefined;
    if (typeof minPostCount === "number" && Number.isFinite(minPostCount) && minPostCount > 0) {
      if (typeof user.postCount !== "number") {
        return {
          pass: true,
          needMoreInfo: true
        };
      }
      if (!Number.isFinite(user.postCount) || user.postCount < minPostCount) {
        return {
          pass: false,
          reason: "min_post_count"
        };
      }
    }

    // 3) minFollowRatio (B: following / followers)
    const ratio = typeof f.minFollowRatio === "number" ? f.minFollowRatio : undefined;
    if (typeof ratio === "number" && Number.isFinite(ratio) && ratio > 0) {
      if (typeof user.followers !== "number" || typeof user.following !== "number") {
        return {
          pass: true,
          needMoreInfo: true
        };
      }

      const followers = user.followers;
      const following = user.following;
      if (!Number.isFinite(followers) || followers <= 0) {
        // followers 为 0 时无法做分母，这里认为不满足条件（风险：可能误杀新号）。
        return {
          pass: false,
          reason: "min_follow_ratio_followers_invalid"
        };
      }

      const actual = following / followers;
      if (!Number.isFinite(actual) || actual < ratio) {
        return {
          pass: false,
          reason: "min_follow_ratio"
        };
      }
    }

    // 4) excludeNew30Days：暂不生效（见字段注释）。

    return {
      pass: true
    };
  } catch {
    return {
      pass: true
    };
  }
}
