import React from 'react';
import { X, Crown, Check, Zap, Shield, TrendingUp } from 'lucide-react';
import { t } from '~utils/commonFunction';

interface MembershipModalProps {
  onClose: () => void;
}

export function MembershipModal({ onClose }: MembershipModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-3xl mb-2">{t('dlg_membership_title')}</h2>
            <p className="text-white/90">{t('dlg_membership_subtitle')}</p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <PricingCard
              name={t('dlg_membership_plan_monthly')}
              price={t('dlg_membership_plan_monthly_price')}
              period={t('dlg_membership_plan_monthly_period')}
              popular={false}
              features={[
                t('dlg_membership_feature_core'),
                t('dlg_membership_feature_daily_limit_140'),
                t('dlg_membership_feature_smart_unfollow'),
                t('dlg_membership_feature_analytics'),
                t('dlg_membership_feature_email_support'),
              ]}
            />

            <PricingCard
              name={t('dlg_membership_plan_quarterly')}
              price={t('dlg_membership_plan_quarterly_price')}
              period={t('dlg_membership_plan_quarterly_period')}
              popular={true}
              savings={t('dlg_membership_plan_quarterly_savings')}
              features={[
                t('dlg_membership_feature_core'),
                t('dlg_membership_feature_daily_limit_140'),
                t('dlg_membership_feature_smart_unfollow'),
                t('dlg_membership_feature_analytics'),
                t('dlg_membership_feature_priority_support'),
                t('dlg_membership_feature_advanced_filters'),
              ]}
            />

            <PricingCard
              name={t('dlg_membership_plan_yearly')}
              price={t('dlg_membership_plan_yearly_price')}
              period={t('dlg_membership_plan_yearly_period')}
              popular={false}
              savings={t('dlg_membership_plan_yearly_savings')}
              features={[
                t('dlg_membership_feature_core'),
                t('dlg_membership_feature_daily_limit_140'),
                t('dlg_membership_feature_smart_unfollow'),
                t('dlg_membership_feature_analytics'),
                t('dlg_membership_feature_dedicated_support'),
                t('dlg_membership_feature_advanced_filters'),
                t('dlg_membership_feature_api_access'),
              ]}
            />
          </div>

          {/* Features Comparison */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg mb-6 text-center">{t('dlg_membership_compare_title')}</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-yellow-600" />}
                title={t('dlg_membership_compare_item_bulk_follow_title')}
                description={t('dlg_membership_compare_item_bulk_follow_desc')}
                premium={false}
              />
              
              <FeatureItem
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                title={t('dlg_membership_compare_item_analytics_title')}
                description={t('dlg_membership_compare_item_analytics_desc')}
                premium={false}
              />
              
              <FeatureItem
                icon={<Crown className="w-5 h-5 text-orange-600" />}
                title={t('dlg_membership_compare_item_unfollow_title')}
                description={t('dlg_membership_compare_item_unfollow_desc')}
                premium={true}
              />
              
              <FeatureItem
                icon={<Shield className="w-5 h-5 text-green-600" />}
                title={t('dlg_membership_compare_item_safety_title')}
                description={t('dlg_membership_compare_item_safety_desc')}
                premium={false}
              />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{t('dlg_membership_trust_secure_payment')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{t('dlg_membership_trust_cancel_anytime')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{t('dlg_membership_trust_refund_7days')}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {t('dlg_membership_terms_notice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  popular,
  savings,
  features,
}: {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}) {
  return (
    <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${
      popular 
        ? 'border-orange-400 shadow-lg scale-105' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-4 py-1 rounded-full">
            {t('dlg_membership_most_popular')}
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg mb-2">{name}</h3>
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-4xl">{price}</span>
          <span className="text-gray-500 mb-1">{period}</span>
        </div>
        {savings && (
          <div className="text-sm text-green-600">{savings}</div>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-3 rounded-xl transition-all ${
        popular
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }`}>
        {t('dlg_membership_choose_plan', { name })}
      </button>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  premium,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  premium: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm">{title}</h4>
          {premium && (
            <Crown className="w-3 h-3 text-orange-500" />
          )}
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
