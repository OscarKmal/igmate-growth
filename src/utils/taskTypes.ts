import { Users, Heart, FileSpreadsheet, UserMinus, type LucideIcon } from 'lucide-react';

export type TaskType = 'competitor-follow' | 'post-follow' | 'csv-follow' | 'unfollow';

export interface TaskTypeConfig {
  id: TaskType;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string; // Tailwind color class prefix
  bgColor: string;
  iconColor: string;
}

export const TASK_TYPES: Record<TaskType, TaskTypeConfig> = {
  'competitor-follow': {
    id: 'competitor-follow',
    icon: Users,
    label: 'Follow from Competitor',
    description: 'Follow users from competitor\'s followers/following',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  'post-follow': {
    id: 'post-follow',
    icon: Heart,
    label: 'Follow from Post',
    description: 'Follow users who liked or commented on posts',
    color: 'pink',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600'
  },
  'csv-follow': {
    id: 'csv-follow',
    icon: FileSpreadsheet,
    label: 'Follow from CSV',
    description: 'Upload CSV/Excel file with user list',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  'unfollow': {
    id: 'unfollow',
    icon: UserMinus,
    label: 'Smart Unfollow',
    description: 'Clean up non-followers and inactive accounts',
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  }
};

export const getTaskTypeConfig = (type: TaskType): TaskTypeConfig => {
  return TASK_TYPES[type];
};

// Helper function to get task type from task title
export const getTaskTypeFromTitle = (title: string): TaskType => {
  if (title.toLowerCase().includes('competitor')) return 'competitor-follow';
  if (title.toLowerCase().includes('post') || title.toLowerCase().includes('like')) return 'post-follow';
  if (title.toLowerCase().includes('csv') || title.toLowerCase().includes('excel')) return 'csv-follow';
  if (title.toLowerCase().includes('unfollow') || title.toLowerCase().includes('clean')) return 'unfollow';
  return 'competitor-follow'; // default
};

/**
 * 获取任务在 UI 中展示的标题（动态区分子模式，但不改变 TaskType）。
 *
 * 用途：
 * - 在 Active/Stopped Actions 中展示更精确的任务标题。
 * - competitor-follow：区分 followers / following。
 * - post-follow：区分 likers / commenters / both。
 *
 * 参数：
 * - params：任务最小信息。
 *   - type：TaskType；主任务类型。
 *   - title：string；原始标题（兜底用）。
 *   - sourceInput：string；用户输入（优先用于展示括号内容）。
 *   - competitorEdge："followers" | "following"；竞对来源模式。
 *   - postSourceMode："likers" | "commenters" | "both"；帖子来源模式。
 *
 * 返回值：
 * - string：展示标题。
 */
export const getTaskDisplayTitle = (params: {
  type: TaskType;
  title?: string;
  sourceInput?: string;
  competitorEdge?: "followers" | "following";
  postSourceMode?: "likers" | "commenters" | "both";
}): string => {
  const base = TASK_TYPES[params.type]?.label || params.type;
  const input = (params.sourceInput || "").trim();
  const inputPart = input ? ` (${input})` : "";

  if (params.type === "competitor-follow") {
    const edge = params.competitorEdge || "followers";
    const suffix = edge === "following" ? " (Following)" : " (Followers)";
    return `${base}${suffix}${inputPart}`;
  }

  if (params.type === "post-follow") {
    const mode = params.postSourceMode || "both";
    const suffix = mode === "likers" ? " (Likers)" : mode === "commenters" ? " (Commenters)" : " (Likers+Commenters)";
    return `${base}${suffix}${inputPart}`;
  }

  if (params.type === "csv-follow") {
    return `${base}${inputPart}`;
  }

  if (params.type === "unfollow") {
    return `${base}${inputPart}`;
  }

  return params.title || `${base}${inputPart}`;
};
