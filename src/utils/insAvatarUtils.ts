/**
 * Instagram 头像 URL 处理工具
 *
 * 用途：
 * - 将 Instagram 原始头像链接统一转换为可访问的代理链接。
 * - 供 ActionCenter（Active/Stopped Actions）、以及其他需要展示头像的模块复用。
 *
 * 说明：
 * - 当前项目通过环境变量 `PLASMO_PUBLIC_INS_PICTURE_BASE_URL` 指定图片代理前缀。
 * - 若传入链接已包含该前缀，则不会重复拼接。
 */

const INS_PICTURE_BASE_URL = process.env.PLASMO_PUBLIC_INS_PICTURE_BASE_URL;

/**
 * 规范化 Instagram 头像 URL。
 *
 * 用途：
 * - 将原始头像 URL 拼接上图片代理前缀（`PLASMO_PUBLIC_INS_PICTURE_BASE_URL`）。
 *
 * 参数：
 * - url：string | undefined；原始头像 URL。
 *
 * 返回值：
 * - string；可用于 `<img src>` 的头像地址。若 url 为空，则返回空字符串。
 *
 * 异常：
 * - 本方法不抛异常；遇到异常将降级返回原始 url（或空字符串）。
 */
export function normalizeInsAvatarUrl(url?: string): string {
  try {
    if (!url) return "";

    const base = typeof INS_PICTURE_BASE_URL === "string" ? INS_PICTURE_BASE_URL : "";
    if (!base) return url;

    if (url.startsWith(base)) return url;
    return base + url;
  } catch {
    return url || "";
  }
}
