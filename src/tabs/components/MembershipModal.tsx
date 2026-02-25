import React from 'react';
import { X, Crown, Check, Zap, Shield, TrendingUp } from 'lucide-react';

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
            <h2 className="text-3xl mb-2">升级会员，解锁全部功能</h2>
            <p className="text-white/90">加速您的Instagram增长之旅</p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <PricingCard
              name="月付"
              price="¥99"
              period="/月"
              popular={false}
              features={[
                '所有核心功能',
                '每日140人关注限额',
                '智能取关功能',
                '数据分析报告',
                '邮件支持',
              ]}
            />

            <PricingCard
              name="季付"
              price="¥249"
              period="/季"
              popular={true}
              savings="节省 ¥48"
              features={[
                '所有核心功能',
                '每日140人关注限额',
                '智能取关功能',
                '数据分析报告',
                '优先客服支持',
                '高级过滤选项',
              ]}
            />

            <PricingCard
              name="年付"
              price="¥799"
              period="/年"
              popular={false}
              savings="节省 ¥389"
              features={[
                '所有核心功能',
                '每日140人关注限额',
                '智能取关功能',
                '数据分析报告',
                '专属客服支持',
                '高级过滤选项',
                'API接口访问',
              ]}
            />
          </div>

          {/* Features Comparison */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg mb-6 text-center">会员功能对比</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-yellow-600" />}
                title="智能批量关注"
                description="从多种来源自动获取目标用户，支持精准过滤"
                premium={false}
              />
              
              <FeatureItem
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                title="效果数据分析"
                description="实时追踪回关率，优化增长策略"
                premium={false}
              />
              
              <FeatureItem
                icon={<Crown className="w-5 h-5 text-orange-600" />}
                title="智能取关管理"
                description="一键取关未回关用户，保持账号质量"
                premium={true}
              />
              
              <FeatureItem
                icon={<Shield className="w-5 h-5 text-green-600" />}
                title="安全速率控制"
                description="智能控制操作频率，避免账号风险"
                premium={false}
              />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>安全支付</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>随时取消</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>7天退款保证</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              选择订阅即表示您同意我们的服务条款和隐私政策
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
            最受欢迎
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
        选择{name}
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
