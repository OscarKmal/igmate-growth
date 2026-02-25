import React from 'react';
import "~styles/index.css";
import { TrendingUp, Users, BarChart3, Zap } from 'lucide-react';
import { onOpenTab, t } from '~utils/commonFunction'

/**
 * PopupPage
 *
 * 用途：
 * - 浏览器扩展 Popup 首页入口组件，展示产品简介与核心卖点，并提供“开始使用”的跳转入口。
 *
 * 返回值：
 * - React JSX 元素：Popup 首页 UI。
 *
 * 异常：
 * - 本组件本身不主动抛出异常；国际化 key 缺失时，`t()` 会回退为空字符串。
 */
export default function PopupPage() {
  return (
    <div className="w-[380px] bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl">{t('pop_home_app_name')}</h1>
            <p className="text-sm text-white/90">{t('pop_home_slogan')}</p>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="p-6">
        <h2 className="text-lg mb-4 text-gray-900">{t('pop_home_why_choose_us')}</h2>
        
        <div className="space-y-3 mb-6">
          <ValueCard
            icon={<Users className="w-5 h-5 text-purple-600" />}
            title={t('pop_home_value1_title')}
            description={t('pop_home_value1_desc')}
          />
          
          <ValueCard
            icon={<Zap className="w-5 h-5 text-pink-600" />}
            title={t('pop_home_value2_title')}
            description={t('pop_home_value2_desc')}
          />
          
          <ValueCard
            icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
            title={t('pop_home_value3_title')}
            description={t('pop_home_value3_desc')}
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onOpenTab()}
          className="text-lg w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          {t('pop_home_cta_start')}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          {t('pop_home_footer_tip')}
        </p>
      </div>
    </div>
  );
}

/**
 * ValueCardProps
 *
 * 用途：
 * - ValueCard 组件的属性定义。
 *
 * 属性：
 * - icon：React 节点；用于展示左侧图标。
 * - title：字符串；卖点标题（建议使用 i18n 文案）。
 * - description：字符串；卖点描述（建议使用 i18n 文案）。
 */
type ValueCardProps = {
  /**
   * 用途：左侧图标。
   * 类型：React.ReactNode
   * 可选性：必填
   * 默认值：无
   */
  icon: React.ReactNode;
  /**
   * 用途：卡片标题。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  title: string;
  /**
   * 用途：卡片描述。
   * 类型：string
   * 可选性：必填
   * 默认值：无
   */
  description: string;
}

/**
 * ValueCard
 *
 * 用途：
 * - Popup 首页的卖点展示卡片，包含图标、标题与描述。
 *
 * 参数：
 * - props：ValueCardProps
 *
 * 返回值：
 * - React JSX 元素：单个卖点卡片。
 *
 * 异常：
 * - 该组件不主动抛出异常。
 */
function ValueCard({ 
  icon, 
  title, 
  description 
}: ValueCardProps) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-gray-900 mb-0.5">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
