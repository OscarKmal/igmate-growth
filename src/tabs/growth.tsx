import React, { useEffect, useState } from 'react';
import "~styles/index.css";
import {UserProfile, ActionCenter, CreateTask, MembershipModal, SettingsDialog, DailyFollowOverDialog, FollowUpgradeDialog} from './components'
import { useGrowthPageModel } from '~utils/growthPageModel';

export default function TabPage() {
  const { state, actions } = useGrowthPageModel();
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyFollowOverDialog, setShowDailyFollowOverDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  const handleSaveSettings = async () => {
    await actions.saveSafetySettings();
    setShowSettings(false);
  };

  const isPremium = state.profileData?.appUser.memberName === 'premium';
  const todayActionsUsed = state.profileData?.todayActionsUsed ?? 0;
  const todayActionsLimit = state.profileData?.todayActionsLimit ?? Number(process.env.PLASMO_PUBLIC_FREE_USER_DAILY_LIMIT);

  useEffect(() => {
    if (isPremium) return;
    if (!Number.isFinite(todayActionsLimit) || todayActionsLimit <= 0) return;
    if (todayActionsUsed >= todayActionsLimit) {
      setShowDailyFollowOverDialog(true);
    }
  }, [isPremium, todayActionsLimit, todayActionsUsed]);

  return (
    <div className="bg-gray-50">
		<div className="max-w-7xl mx-auto px-4 py-6">
		  {/* User Profile Section */}
		  <UserProfile 
			loading={state.isLoading}
			avatarUrl={state.profileData?.insUser.avatar}
			username={state.profileData?.insUser.account}
			fullName={state.profileData?.insUser.fullName}
			followers={state.profileData?.followers ?? 0}
			following={state.profileData?.following ?? 0}
			followersGrowth7d={state.profileData?.followersGrowth7d ?? 0}
			followingGrowth7d={state.profileData?.followingGrowth7d ?? 0}
			isPremium={isPremium}
			todayActionsUsed={state.profileData?.todayActionsUsed ?? 0}
			todayActionsLimit={state.profileData?.todayActionsLimit ?? Number(process.env.PLASMO_PUBLIC_FREE_USER_DAILY_LIMIT)}
			onMembershipClick={() => setShowMembership(true)}
		  />

		  {/* Action Center - Main Content */}
		  <div className="mt-6">
			<ActionCenter
			  isPremium={isPremium}
			  todayActionsUsed={todayActionsUsed}
			  todayActionsLimit={todayActionsLimit}
			  onDailyLimitReached={() => setShowDailyFollowOverDialog(true)}
			  onCreateTask={() => setShowCreateTask(true)}
        onOpenSettings={() => setShowSettings(true)}
			  hasActiveTasks={true}
			/>
		  </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        selectedPreset={state.matchedPresetLevel as any}
        showAdvancedSettings={state.showAdvanced}
        customSettings={{
          requestInterval: state.customSettings.requestInterval,
          failurePause: state.customSettings.failurePause,
          randomRange: state.customSettings.randomRange
        }}
        onPresetChange={actions.handlePresetChange}
        onAdvancedSettingsChange={actions.setShowAdvanced}
        onCustomSettingsChange={(s) => actions.patchCustomSettings(s)}
        getCurrentSettings={() => ({
          requestInterval: state.customSettings.requestInterval,
          failurePause: state.customSettings.failurePause
        })}
        saveSetting={handleSaveSettings}
      />

		  {/* Create Task Modal */}
		  {showCreateTask && (
			<CreateTask 
			  onClose={() => setShowCreateTask(false)} 
			  onComplete={() => setShowCreateTask(false)}
			/>
		  )}

		  {/* Membership Modal */}
		  {showMembership && (
			<FollowUpgradeDialog
				open={showMembership}
				onOpenChange={setShowMembership}
			/> 
		  )}
			
			{/* daily unfollow over Dialog */}
			<DailyFollowOverDialog
				open={showDailyFollowOverDialog}
				onOpenChange={setShowDailyFollowOverDialog}
				dailyUsedCount={todayActionsUsed}
				freeUserDailyLimit={todayActionsLimit}
				setShowReferralDialog={setShowReferralDialog}
			/>
		</div>
	</div>
  );
}