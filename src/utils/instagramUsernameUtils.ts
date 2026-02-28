/**
 * Instagram 用户名解析工具。
 *
 * 用途：
 * - 将用户输入（用户名/@用户名/profile link）统一解析为标准 username。
 * - 供 CSV/Excel 文件解析、手动输入等多个场景复用。
 *
 * 设计原则：
 * - 尽量宽容输入格式（带协议/不带协议/带参数）。
 * - 尽量严格输出格式（只输出 [a-zA-Z0-9._]）。
 * - 对明显不是 profile 的链接（如 /p/、/reel/）返回 null，避免误识别。
 */

/**
 * Instagram 用户名允许字符正则。
 *
 * 用途：
 * - 校验输出 username 的合法性。
 */
const IG_USERNAME_RE = /^[a-zA-Z0-9._]+$/;

/**
 * 不应被当作用户名的路径段（常见非 profile 页面）。
 *
 * 用途：
 * - 避免将 post/reel/stories 等链接误识别成用户名。
 */
const NON_PROFILE_PATH_SEGMENTS = new Set([
  "p",
  "reel",
  "tv",
  "stories",
  "explore",
  "accounts",
  "direct",
  "about",
  "developer",
  "legal",
  "api"
]);

/**
 * 从输入中提取 Instagram 用户名。
 *
 * 用途：
 * - 支持输入：
 *   - "mosquitotse"
 *   - "@mosquitotse"
 *   - "https://www.instagram.com/mosquitotse/"
 *   - "www.instagram.com/mosquitotse/?utm_source=xxx"
 * - 统一输出："mosquitotse"
 *
 * 参数：
 * - input：unknown；原始输入（单元格内容/用户输入）。
 *
 * 返回值：
 * - string | null
 *   - string：提取出的用户名（仅包含 a-zA-Z0-9._）。
 *   - null：无法识别为用户名。
 */
export function extractInstagramUsername(input: unknown): string | null {
  if (input === null || input === undefined) return null;

  const raw = String(input).trim();
  if (!raw) return null;

  // 只取空格前的第一个 token（避免 "username xxx" 的情况）
  const token = raw.split(/\s+/)[0];
  if (!token) return null;

  // 1) 直接处理 @username
  if (token.startsWith("@")) {
    const username = token.replace(/^@+/, "");
    if (username && IG_USERNAME_RE.test(username)) return username;
    return null;
  }

  // 2) 直接处理 username
  if (IG_USERNAME_RE.test(token) && !token.includes(".")) {
    // 注意：这里额外排除类似 "www.instagram.com" 这种域名形式（包含 .）
    return token;
  }

  // 3) 尝试按 URL 解析（支持不带协议的情况）
  const normalizedUrlStr = (() => {
    if (/^https?:\/\//i.test(token)) return token;
    if (/^www\./i.test(token) || /instagram\.com/i.test(token)) return `https://${token}`;
    return "";
  })();

  if (!normalizedUrlStr) return null;

  try {
    const url = new URL(normalizedUrlStr);

    // 必须是 instagram 域名（含 www/m/子域）
    const host = url.hostname.toLowerCase();
    if (!host.includes("instagram.com")) return null;

    // 路径取第一个非空 segment
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    const first = (segments[0] || "").toLowerCase();
    if (!first) return null;

    // 排除明显非 profile 的路径
    if (NON_PROFILE_PATH_SEGMENTS.has(first)) return null;

    const candidate = segments[0];
    if (!candidate) return null;

    // 链接里可能出现 @username
    const username = candidate.replace(/^@+/, "");
    if (!username) return null;

    if (!IG_USERNAME_RE.test(username)) return null;

    return username;
  } catch {
    return null;
  }
}
