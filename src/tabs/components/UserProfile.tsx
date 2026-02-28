import React from 'react';
import { User, Users, UserPlus, Crown, TrendingUp, Info, Activity } from 'lucide-react';
import { Skeleton } from '~components/ui/skeleton';

/**
 * UserProfileProps
 *
 * 用途：
 * - growth 页面用户信息卡片（UserProfile）所需的入参定义。
 * - 该组件为“纯展示组件”，业务数据由外层页面/聚合逻辑提供。
 *
 * 属性：
 * - avatarUrl：头像 URL。
 * - username：Instagram 用户名（@xxx 不带 @）。
 * - fullName：Instagram 显示名称。
 * - followers：粉丝总数。
 * - following：关注总数。
 * - followersGrowth7d：近 7 天新增粉丝（按需求暂可传 0）。
 * - followingGrowth7d：近 7 天新增关注（来自自动关注成功记录统计）。
 * - isPremium：是否会员（插件账号维度）。
 * - onMembershipClick：点击会员入口回调。
 * - todayActionsUsed：今日已用次数（自动关注成功次数，按天累计）。
 * - todayActionsLimit：今日限额。
 */
export interface UserProfileProps {
  /**
   * 用途：是否处于加载中。
   * 类型：boolean
   * 可选性：可选
   * 默认值：false
   */
  loading?: boolean;

  /**
   * 用途：用户头像 URL。
   * 类型：string
   * 可选性：可选
   * 默认值：无
   */
  avatarUrl?: string;

  /**
   * 用途：Instagram 用户名。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  username?: string;

  /**
   * 用途：Instagram 显示名称。
   * 类型：string
   * 可选性：可选
   * 默认值：空字符串
   */
  fullName?: string;

  /**
   * 用途：粉丝总数。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  followers: number;

  /**
   * 用途：关注总数。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  following: number;

  /**
   * 用途：近 7 天新增粉丝。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  followersGrowth7d?: number;

  /**
   * 用途：近 7 天新增关注。
   * 类型：number
   * 可选性：可选
   * 默认值：0
   */
  followingGrowth7d?: number;

  /**
   * 用途：是否会员。
   * 类型：boolean
   * 可选性：必填
   * 默认值：无
   */
  isPremium: boolean;

  /**
   * 用途：点击会员入口回调。
   * 类型：() => void
   * 可选性：必填
   * 默认值：无
   */
  onMembershipClick: () => void;

  /**
   * 用途：今日已用次数。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  todayActionsUsed: number;

  /**
   * 用途：今日限额。
   * 类型：number
   * 可选性：必填
   * 默认值：无
   */
  todayActionsLimit: number;
}

export function UserProfile({ 
  loading = false,
  avatarUrl,
  username = '',
  fullName = '',
  followers, 
  following,
  followersGrowth7d = 0,
  followingGrowth7d = 0,
  isPremium,
  onMembershipClick,
  todayActionsUsed,
  todayActionsLimit
}: UserProfileProps) {
  const todayRemaining = todayActionsLimit - todayActionsUsed;
  const safeLimit = todayActionsLimit > 0 ? todayActionsLimit : 1;
  const progressPercent = (todayActionsUsed / safeLimit) * 100;

  // Determine safety status
  const getSafetyStatus = () => {
    if (progressPercent < 70) return { color: 'green', text: 'Safe pace', icon: '🟢' };
    if (progressPercent < 90) return { color: 'yellow', text: 'Moderate', icon: '🟡' };
    return { color: 'red', text: 'Approaching limit', icon: '🔴' };
  };

  const safetyStatus = getSafetyStatus();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {loading ? (
            <Skeleton className="w-16 h-16 rounded-full" />
          ) : avatarUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              <img
                src={avatarUrl}
                alt={username || fullName || 'avatar'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
          )}

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl">
                {loading ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  fullName || username || '-'
                )}
              </h2>
              <button
                type="button"
                onClick={onMembershipClick}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isPremium
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>{isPremium ? 'Premium' : 'Free'}</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? (
                <Skeleton className="h-5 w-20 mt-1" />
              ) : (
                username ? `@${username}` : '-'
              )}
            </div>
          </div>
        </div>

        {/* Stats with Growth Highlight */}
        <div className="flex gap-6">
          <GrowthStatItem
            icon={<Users className="w-5 h-5 text-purple-600" />}
            label="粉丝"
            total={followers}
            growth7d={followersGrowth7d}
            loading={loading}
            gradientFrom="from-purple-500"
            gradientTo="to-purple-600"
          />
          <GrowthStatItem
            icon={<UserPlus className="w-5 h-5 text-pink-600" />}
            label="关注"
            total={following}
            growth7d={followingGrowth7d}
            loading={loading}
            gradientFrom="from-pink-500"
            gradientTo="to-pink-600"
          />
        </div>

        {/* Divider */}
        <div className="h-24 w-px bg-gray-200" />

        {/* Today's Limit Summary */}
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Today's Limit</span>
            <span className="text-xs">{safetyStatus.icon}</span>
            <span className={`text-xs font-medium ${
              safetyStatus.color === 'green' ? 'text-green-600' :
              safetyStatus.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {safetyStatus.text}
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="mb-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  safetyStatus.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  safetyStatus.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Text */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {loading ? (
              <>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </>
            ) : (
              <>
                <span>{todayActionsUsed} / {todayActionsLimit}</span>
                <span className="font-medium text-gray-700">{todayRemaining} left</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthStatItem({ 
  icon, 
  label, 
  total,
  growth7d,
  loading,
  gradientFrom,
  gradientTo
}: { 
  icon: React.ReactNode;
  label: string;
  total: number;
  growth7d: number;
  loading: boolean;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div className="relative">
      {/* Background card */}
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-4 min-w-[180px] shadow-lg`}>
        {/* Label and Icon */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div className="text-sm text-white/90">{label}</div>
        </div>

        {/* 7-day Growth - Primary Focus */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <TrendingUp className="w-4 h-4 text-white flex-shrink-0 mt-1" />
            <div>
              <div className="text-3xl text-white">
                {loading ? (
                  <Skeleton className="h-9 w-16 bg-white/20" />
                ) : (
                  <>+{growth7d}</>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-white/80">
                  近7天新增
                </span>
                <div 
                  className="group relative inline-flex cursor-help"
                  title="仅统计通过本插件实现的新增（安装插件之前的新增不统计）"
                >
                  <Info className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors" />
                  {/* Custom Tooltip */}
                  <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    仅统计通过本插件实现的新增（安装插件之前的新增不统计）
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total - Secondary Info */}
        <div className="pt-2 border-t border-white/20">
          <div className="text-xs text-white/70">总计</div>
          <div className="text-lg text-white">
            {loading ? (
              <Skeleton className="h-6 w-20 bg-white/20" />
            ) : (
              total.toLocaleString()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}