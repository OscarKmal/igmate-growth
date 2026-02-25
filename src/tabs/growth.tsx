import React, { useState } from 'react';
import "~styles/index.css";
import {UserProfile, ActionCenter, CreateTask, MembershipModal} from './components'

export default function TabPage() {
  
  const [devSettings, setDevSettings] = useState({
    isPremium: false,
    hasRateLimit: false,
    hasError: false,
    errorType: 'normal' as 'normal' | 'severe',
    currentFollowers: 1250,
    currentFollowing: 890,
    followersGrowth7d: 87,
    followingGrowth7d: 142,
    hasActiveTasks: true,
  });
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

  return (
    <div className="bg-gray-50">
		<div className="max-w-7xl mx-auto px-4 py-6">
		  {/* User Profile Section */}
		  <UserProfile 
			followers={devSettings.currentFollowers}
			following={devSettings.currentFollowing}
			followersGrowth7d={devSettings.followersGrowth7d}
			followingGrowth7d={devSettings.followingGrowth7d}
			isPremium={devSettings.isPremium}
			onMembershipClick={() => setShowMembership(true)}
		  />

		  {/* Action Center - Main Content */}
		  <div className="mt-6">
			<ActionCenter
			  isPremium={devSettings.isPremium}
			  onCreateTask={() => setShowCreateTask(true)}
			  hasActiveTasks={devSettings.hasActiveTasks}
			/>
		  </div>

		  {/* Create Task Modal */}
		  {showCreateTask && (
			<CreateTask 
			  onClose={() => setShowCreateTask(false)} 
			  onComplete={() => setShowCreateTask(false)}
			/>
		  )}

		  {/* Membership Modal */}
		  {showMembership && (
			<MembershipModal onClose={() => setShowMembership(false)} />
		  )}
		</div>
	</div>
  );
}