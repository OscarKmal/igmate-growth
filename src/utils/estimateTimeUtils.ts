/**
 * 预计完成时间计算工具。
 *
 * 用途：
 * - 根据任务总量/进度，以及安全设置（请求间隔、随机范围）与固定请求耗时，估算剩余完成耗时。
 * - 供 GrowthTaskRunner 在任务进度变化时计算并写回 task.estimatedDays。
 */

export interface EstimateTaskCompletionOptions {
  /**
   * 用途：任务总量。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  total: number;

  /**
   * 用途：任务进度（已处理数量）。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  progress: number;

  /**
   * 用途：安全设置中的基础请求间隔（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  requestIntervalSeconds: number;

  /**
   * 用途：安全设置中的随机范围（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   *
   * 说明：
   * - 实际运行时每次间隔为 requestInterval + random(0, requestRandomRange)
   * - 估算时取均值：requestInterval + requestRandomRange/2
   */
  requestRandomRangeSeconds: number;

  /**
   * 用途：每次请求/处理的固定耗时（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  fixedRequestDurationSeconds: number;
}

/**
 * 计算“剩余动作数”。
 *
 * 用途：
 * - 将 total/progress 转换为剩余数量。
 *
 * 参数：
 * - total：任务总量。
 * - progress：任务进度。
 *
 * 返回值：
 * - number：剩余动作数（不会小于 0）。
 */
export function calcRemainingActions(total: number, progress: number): number {
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  return Math.max(0, safeTotal - safeProgress);
}

/**
 * 计算单次动作的“平均耗时”（秒）。
 *
 * 用途：
 * - 用于将安全设置的随机等待折算为平均值。
 *
 * 参数：
 * - requestIntervalSeconds：基础等待（秒）。
 * - requestRandomRangeSeconds：随机范围（秒）。
 * - fixedRequestDurationSeconds：固定请求耗时（秒）。
 *
 * 返回值：
 * - number：单次动作平均耗时（秒），最小为 0。
 */
export function calcAvgSecondsPerAction(
  requestIntervalSeconds: number,
  requestRandomRangeSeconds: number,
  fixedRequestDurationSeconds: number
): number {
  const base = Number.isFinite(requestIntervalSeconds) ? requestIntervalSeconds : 0;
  const range = Number.isFinite(requestRandomRangeSeconds) ? requestRandomRangeSeconds : 0;
  const fixed = Number.isFinite(fixedRequestDurationSeconds) ? fixedRequestDurationSeconds : 0;

  const avgWait = base + Math.max(0, range) / 2;
  return Math.max(0, avgWait + fixed);
}

/**
 * 估算任务剩余完成耗时（秒）。
 *
 * 用途：
 * - 将剩余动作数乘以单次平均耗时，得到剩余秒数。
 *
 * 参数：
 * - options：估算参数。
 *
 * 返回值：
 * - number：剩余耗时（秒），向上取整；当 total<=0 时返回 0。
 */
export function estimateTaskRemainingSeconds(options: EstimateTaskCompletionOptions): number {
  const total = Number.isFinite(options.total) ? options.total : 0;
  const progress = Number.isFinite(options.progress) ? options.progress : 0;

  if (total <= 0) return 0;

  const remaining = calcRemainingActions(total, progress);
  const perAction = calcAvgSecondsPerAction(
    options.requestIntervalSeconds,
    options.requestRandomRangeSeconds,
    options.fixedRequestDurationSeconds
  );

  return Math.max(0, Math.ceil(remaining * perAction));
}

/**
 * 将秒数格式化为“最大单位”文本。
 *
 * 用途：
 * - UI 展示友好：只显示最大时间单位（days/hours/minutes/seconds）。
 *
 * 参数：
 * - seconds：秒数。
 *
 * 返回值：
 * - string：格式化文本，例如："2 days"、"3 hours"、"15 minutes"、"20 seconds"。
 */
export function formatDurationLargestUnit(seconds: number): string {
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;

  const day = 24 * 60 * 60;
  const hour = 60 * 60;
  const minute = 60;

  if (s >= day) {
    const n = Math.ceil(s / day);
    return `${n} days`;
  }

  if (s >= hour) {
    const n = Math.ceil(s / hour);
    return `${n} hours`;
  }

  if (s >= minute) {
    const n = Math.ceil(s / minute);
    return `${n} minutes`;
  }

  return `${s} seconds`;
}

/**
 * 构造任务预计完成时间文案。
 *
 * 用途：
 * - Runner 写回 task.estimatedDays 的统一入口。
 *
 * 参数：
 * - options：估算参数。
 *
 * 返回值：
 * - string：预计完成时间文案；当 total<=0 时返回空字符串。
 */
export function buildTaskEstimatedDaysText(options: EstimateTaskCompletionOptions): string {
  if (!Number.isFinite(options.total) || options.total <= 0) return "";
  const seconds = estimateTaskRemainingSeconds(options);
  return formatDurationLargestUnit(seconds);
}

/**
 * 估算“批量关注”的总耗时（秒）。
 *
 * 用途：
 * - 用于 CSV/Excel 上传后，在 UI 上展示“预计时间”。
 * - 与 Runner 行为保持一致：最后一次关注成功后不再等待请求间隔，因此间隔等待次数为 (count - 1)。
 *
 * 计算规则：
 * - count 次关注：固定请求耗时 = count * fixedRequestDurationSeconds
 * - 间隔等待： (count - 1) * (requestIntervalSeconds + requestRandomRangeSeconds/2)
 *
 * 参数：
 * - count：number；关注数量。
 * - requestIntervalSeconds：number；基础间隔（秒）。
 * - requestRandomRangeSeconds：number；随机范围（秒）。
 * - fixedRequestDurationSeconds：number；固定请求耗时（秒），例如 1.5。
 *
 * 返回值：
 * - number：总耗时（秒），向上取整；当 count<=0 时返回 0。
 */
export function estimateBatchFollowTotalSeconds(params: {
  count: number;
  requestIntervalSeconds: number;
  requestRandomRangeSeconds: number;
  fixedRequestDurationSeconds: number;
}): number {
  const count = Number.isFinite(params.count) ? Math.max(0, Math.floor(params.count)) : 0;
  if (count <= 0) return 0;

  const base = Number.isFinite(params.requestIntervalSeconds) ? params.requestIntervalSeconds : 0;
  const range = Number.isFinite(params.requestRandomRangeSeconds) ? Math.max(0, params.requestRandomRangeSeconds) : 0;
  const fixed = Number.isFinite(params.fixedRequestDurationSeconds) ? Math.max(0, params.fixedRequestDurationSeconds) : 0;

  const avgInterval = base + range / 2;
  const intervalTimes = Math.max(0, count - 1);
  const totalSeconds = count * fixed + intervalTimes * avgInterval;

  return Math.max(0, Math.ceil(totalSeconds));
}

/**
 * 构造“批量关注预计时间”文案。
 *
 * 用途：
 * - CreateTask 的 CSV 上传完成卡片展示。
 *
 * 返回值：
 * - string：预计时间（英文单位）；当 count<=0 时返回空字符串。
 */
export function buildBatchFollowEstimatedTimeText(params: {
  count: number;
  requestIntervalSeconds: number;
  requestRandomRangeSeconds: number;
  fixedRequestDurationSeconds: number;
}): string {
  const count = Number.isFinite(params.count) ? Math.max(0, Math.floor(params.count)) : 0;
  if (count <= 0) return "";
  const seconds = estimateBatchFollowTotalSeconds(params);
  return formatDurationLargestUnit(seconds);
}
