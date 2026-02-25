import React from "react";
import { Button } from "./button";
import { Zap, Check, Crown } from "lucide-react";
import { motion } from "motion/react";
import { t } from "~utils/commonFunction";

interface PremiumUpgradeCardProps {
  currentUsage?: number;
  dailyLimit?: number;
  onUpgrade?: () => void;
  showLimitInfo?: boolean;
  limitType?: "daily" | "monthly";
  limitDescription?: string;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  currentUsage = 0,
  dailyLimit = 200,
  onUpgrade,
  showLimitInfo = true,
  limitType = "daily",
  limitDescription,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-lg"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            color: "#f59e0b",
          }}
        />
      </div>

      {/* Decorative Crown */}
      <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full opacity-20 blur-2xl" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">
                {showLimitInfo
                  ? limitType === "monthly"
                    ? t("premium_upgrade_monthly_limit_reached")
                    : t("premium_upgrade_daily_limit_reached")
                  : t("premium_upgrade_upgrade_to_premium")}
              </h3>
            </div>
            {showLimitInfo && (
              <p className="text-sm text-amber-700">
                {limitDescription || (
                  <>
                    {limitType === "monthly"
                      ? t("premium_upgrade_this_months_usage")
                      : t("premium_upgrade_todays_usage")}
                    :{" "}
                    <span className="font-bold">
                      {currentUsage}/{dailyLimit}
                    </span>{" "}
                    {limitType === "monthly"
                      ? t("premium_upgrade_views")
                      : t("premium_upgrade_comments")}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
          {/* <p className="text-sm text-gray-700 mb-3">
            {t("premium_upgrade_subscribe_to_export_comments")}
          </p> */}

          {/* Features List */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 p-0.5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">
                {t("premium_upgrade_unlimited_daily_export")}
              </span>
            </div>
            {/* <div className="flex items-start gap-2">
              <div className="mt-0.5 p-0.5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">
                {t("premium_upgrade_more")}
              </span>
            </div> */}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30 border-0 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02]"
          size="lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          {t("premium_upgrade_view_plans")}
        </Button>
      </div>
    </motion.div>
  );
};
