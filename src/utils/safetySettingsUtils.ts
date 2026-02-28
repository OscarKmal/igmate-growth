/**
 * 安全设置读取工具。
 *
 * 用途：
 * - 从 storage 读取 Safety Settings，并转换为业务侧可直接使用的数值结构。
 * - 供页面（CreateTask）与 Runner（GrowthTaskRunner）复用，避免各处重复解析 storage 结构。
 */

import { getStorage } from "~utils/functions";
import { storageName } from "~utils/consts";

/**
 * 标准化后的安全设置。
 */
export interface NormalizedSafetySettings {
  /**
   * 用途：基础请求间隔（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：6
   */
  requestIntervalSeconds: number;

  /**
   * 用途：请求间隔随机范围（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：4
   */
  requestRandomRangeSeconds: number;

  /**
   * 用途：失败暂停间隔（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：600
   */
  failedPauseIntervalSeconds: number;
}

/**
 * 从 storage 读取并标准化安全设置。
 *
 * 用途：
 * - 将 SettingsDialog 保存的结构：
 *   {
 *     requestInterval: { value: string },
 *     failedPauseInterval: { value: string },
 *     requestRandomRange: { value: string }
 *   }
 *   转换为纯数字对象，方便业务计算。
 *
 * 返回值：
 * - Promise<NormalizedSafetySettings>
 */
export async function loadNormalizedSafetySettings(): Promise<NormalizedSafetySettings> {
  const saved = await getStorage(storageName.safetySettingsStorageName);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s: any = saved || {};

  return {
    requestIntervalSeconds: Number(s.requestInterval?.value || 6),
    requestRandomRangeSeconds: Number(s.requestRandomRange?.value || 4),
    failedPauseIntervalSeconds: Number(s.failedPauseInterval?.value || 600)
  };
}
