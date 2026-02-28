/**
 * Instagram 用户种子数据解析器
 *
 * 用途：
 * - GrowthTaskRunner 在处理 followers/following/post likers 等列表节点时，会拿到不同结构的用户节点（seed）。
 * - 本文件负责将这些“多形态 seed”解析成统一字段：username/avatarUrl/followers/following。
 * - 避免 Runner 内部散落各种字段兼容判断，便于后续扩展与测试。
 */

/**
 * 解析得到的用户基础字段。
 */
export interface ParsedInsSeedUser {
  /**
   * 用途：用户名。
   * 类型：string
   * 可选性：可选
   * 默认值：undefined
   */
  username?: string;

  /**
   * 用途：头像链接。
   * 类型：string
   * 可选性：可选
   * 默认值：undefined
   */
  avatarUrl?: string;

  /**
   * 用途：粉丝数。
   * 类型：number
   * 可选性：可选
   * 默认值：undefined
   */
  followers?: number;

  /**
   * 用途：关注数。
   * 类型：number
   * 可选性：可选
   * 默认值：undefined
   */
  following?: number;
}

/**
 * 从多形态 seed 中解析 Instagram 用户信息。
 *
 * 用途：
 * - 兼容不同接口返回的字段命名，例如：
 *   - follower_count / following_count
 *   - edge_followed_by.count / edge_follow.count
 *   - profile_pic_url / profileImage
 *
 * 参数：
 * - seed：unknown；任意来源的用户节点。
 *
 * 返回值：
 * - ParsedInsSeedUser；解析结果（字段可能不完整）。
 *
 * 异常：
 * - 本方法不抛异常；解析失败返回空对象。
 */
export function parseInsUserFromSeed(seed: unknown): ParsedInsSeedUser {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = seed;
    if (!s) return {};

    const username = typeof s.username === "string" ? s.username : undefined;
    const avatarUrl = typeof s.profile_pic_url === "string" ? s.profile_pic_url : typeof s.profileImage === "string" ? s.profileImage : undefined;

    const followers =
      typeof s.follower_count === "number"
        ? s.follower_count
        : typeof s.edge_followed_by?.count === "number"
          ? s.edge_followed_by.count
          : undefined;

    const following =
      typeof s.following_count === "number"
        ? s.following_count
        : typeof s.edge_follow?.count === "number"
          ? s.edge_follow.count
          : undefined;

    return {
      username,
      avatarUrl,
      followers,
      following
    };
  } catch {
    return {};
  }
}
