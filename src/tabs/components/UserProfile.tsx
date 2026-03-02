import React, { useEffect, useState } from 'react';
import { User, Users, UserPlus, Crown, TrendingUp, Info, Activity } from 'lucide-react';
import { Skeleton } from '~components/ui/skeleton';
import browser from 'webextension-polyfill';
import { getOrCreateUserInfo } from '~utils/functions';
import { jumpLogin, t } from '~utils/commonFunction';
import { sendToBackground } from '@plasmohq/messaging';
import type { UserInfo } from '~modles/extension';

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
  /**
   * 用途：当前插件账号信息（用于展示邮箱/判断是否登录）。
   * 类型：UserInfo | null
   * 可选性：必填
   * 默认值：null
   */
  const [currentAppUser, setCurrentAppUser] = useState<UserInfo | null>(null);

  /**
   * 用途：插件账号是否已登录。
   * 类型：boolean
   * 可选性：必填
   * 默认值：false
   */
  const [isPluginLoggedIn, setIsPluginLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    /**
     * 用途：初始化加载插件账号登录态。
     */
    void (async () => {
      const appUserInfo = await getOrCreateUserInfo();
      setCurrentAppUser(appUserInfo);
      setIsPluginLoggedIn(!!appUserInfo?.token);
    })();

    /**
     * 用途：监听后台登录/登出消息，实时刷新展示。
     * 说明：
     * - 登录成功后后台会 sendMessage({type:'userLoggedIn'})。
     * - 退出登录后后台会 sendMessage({type:'userLogout'})。
     */
    const listener = async (msg: any) => {
      if (msg?.type === "userLoggedIn") {
        const appUserInfo = await getOrCreateUserInfo();
        setCurrentAppUser(appUserInfo);
        setIsPluginLoggedIn(true);
      } else if (msg?.type === "userLogout") {
        const appUserInfo = await getOrCreateUserInfo();
        setCurrentAppUser(appUserInfo);
        setIsPluginLoggedIn(false);
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const todayRemaining = todayActionsLimit - todayActionsUsed;
  const mockPremiumLimit = 99999;
  const safeLimitRaw = isPremium ? mockPremiumLimit : todayActionsLimit;
  const safeLimit = safeLimitRaw > 0 ? safeLimitRaw : 1;
  const progressPercent = Math.min(100, Math.max(0, (todayActionsUsed / safeLimit) * 100));

  /**
   * 用途：处理“插件账号登录/退出”。
   * 说明：
   * - 未登录：跳转到 web 登录页。
   * - 已登录：调用后台 logout 并等待广播消息刷新 UI。
   */
  const handlePluginLoginClick = async (): Promise<void> => {
    if (!isPluginLoggedIn) {
      jumpLogin();
      return;
    }

    await sendToBackground({
      name: "webMsg",
      body: {
        type: "logout"
      }
    });
  };

  // Determine safety status
  const getSafetyStatus = () => {
    if (progressPercent < 70) return { color: 'green', text: t('cmp_user_profile_safety_safe_pace'), icon: '🟢' };
    if (progressPercent < 90) return { color: 'yellow', text: t('cmp_user_profile_safety_moderate'), icon: '🟡' };
    return { color: 'red', text: t('cmp_user_profile_safety_approaching_limit'), icon: '🔴' };
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
                <span>
                  {isPremium
                    ? t('cmp_user_profile_membership_premium')
                    : t('cmp_user_profile_membership_free')}
                </span>
              </button>

			  <button
				type="button"
				onClick={() => void handlePluginLoginClick()}
				className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
					isPluginLoggedIn
						? 'bg-purple-600 text-white hover:bg-purple-700'
						: 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
				}`}
			  >
				<span>
					{isPluginLoggedIn
						? t('cmp_user_profile_plugin_logout')
						: t('cmp_user_profile_plugin_login')}
				</span>
			  </button>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? (
                <Skeleton className="h-5 w-20 mt-1" />
              ) : (
                username ? `@${username}` : '-'
              )}
            </div>
			{!loading && isPluginLoggedIn && (
				<div className="text-xs text-gray-400 mt-1">
					{currentAppUser?.email || '-'}
				</div>
			)}
          </div>
        </div>

        {/* Stats with Growth Highlight */}
        <div className="flex gap-6">
          <GrowthStatItem
            icon={<Users className="w-5 h-5 text-purple-600" />}
            label={t('cmp_user_profile_stat_followers')}
            total={followers}
            growth7d={followersGrowth7d}
            loading={loading}
            gradientFrom="from-purple-500"
            gradientTo="to-purple-600"
          />
          <GrowthStatItem
            icon={<UserPlus className="w-5 h-5 text-pink-600" />}
            label={t('cmp_user_profile_stat_following')}
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
            <span className="text-sm text-gray-600">{t('cmp_user_profile_today_limit')}</span>
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
                {isPremium ? (
                  <span>{todayActionsUsed} / ∞</span>
                ) : (
                  <>
                    <span>{todayActionsUsed} / {todayActionsLimit}</span>
                    <span className="font-medium text-gray-700">
                      {t('cmp_user_profile_today_remaining_left', { count: todayRemaining })}
                    </span>
                  </>
                )}
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
                  {t('cmp_user_profile_growth_7d_label')}
                </span>
                <div 
                  className="group relative inline-flex cursor-help"
                  title={t('cmp_user_profile_growth_7d_tooltip')}
                >
                  <Info className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors" />
                  {/* Custom Tooltip */}
                  <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {t('cmp_user_profile_growth_7d_tooltip')}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total - Secondary Info */}
        <div className="pt-2 border-t border-white/20">
          <div className="text-xs text-white/70">{t('cmp_user_profile_total_label')}</div>
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