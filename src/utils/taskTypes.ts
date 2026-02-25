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
