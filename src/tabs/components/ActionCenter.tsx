import React, { useState } from "react";
import {
  Pause,
  Play,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  X,
  EyeOff,
  ChevronUp,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  getTaskTypeFromTitle,
  getTaskTypeConfig,
} from "~utils/taskTypes";
import {MembershipModal} from "./MembershipModal";
import ConfirmDialog from "./ConfirmDialog";

interface ActionCenterProps {
  isPremium: boolean;
  onCreateTask: () => void;
  hasActiveTasks?: boolean;
}

export function ActionCenter({
  isPremium,
  onCreateTask,
  hasActiveTasks,
}: ActionCenterProps) {
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [cleaningTaskId, setCleaningTaskId] = useState<
    number | null
  >(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmType, setConfirmType] = useState<'cancel' | 'newAction'>('cancel');
  const [taskToCancel, setTaskToCancel] = useState<number | null>(
    null,
  );

  const handleCleanNonFollowers = (taskId: number) => {
    if (!isPremium) {
      setShowMembershipModal(true);
      return;
    }
    
    setCleaningTaskId(taskId);
    // 模拟清理过程
    setTimeout(() => {
      setCleaningTaskId(null);
    }, 3000);
  };

  const handleCancelTask = (taskId: number) => {
    setTaskToCancel(taskId);
    setConfirmType('cancel');
    setShowConfirmDialog(true);
  };

  const handleNewAction = () => {
    // 检查是否有运行中的任务
    if (activeTasks.length > 0) {
      setConfirmType('newAction');
      setShowConfirmDialog(true);
    } else {
      onCreateTask();
    }
  };

  const confirmAction = () => {
    if (confirmType === 'cancel' && taskToCancel !== null) {
      // In real app, this would trigger a callback to move task to completed list
      setTaskToCancel(null);
    } else if (confirmType === 'newAction') {
      // 停止当前所有任务并创建新任务
      onCreateTask();
    }
    setShowConfirmDialog(false);
  };

  const activeTasks = (hasActiveTasks !== false) ? [
    {
      id: 1,
      title: "Follow from Competitor (@fashion_hub)",
      status: "In Progress",
      progress: 85,
      total: 200,
      todayActions: 28,
      estimatedDays: "2–3 days",
      impact: "+12 new followers",
      statusColor: "blue",
      followedCount: 85,
      followedBackCount: 23,
      cleanedCount: 15,
      sourceUrl: "https://www.instagram.com/fashion_hub/",
    },
    {
      id: 2,
      title: "Follow from Post Likes (@travel_world)",
      status: "In Progress",
      progress: 142,
      total: 300,
      todayActions: 35,
      estimatedDays: "4–5 days",
      impact: "+18 new followers",
      statusColor: "blue",
      followedCount: 142,
      followedBackCount: 38,
      cleanedCount: 8,
      sourceUrl: "https://www.instagram.com/p/ABC123XYZ/",
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Active Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            Active Actions ({activeTasks.length})
          </h2>
          <button
            onClick={handleNewAction}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4" />
            New Action
          </button>
        </div>

        {activeTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No active actions yet</p>
            <p className="text-sm mt-1">
              Create your first action to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <ActionCard
                key={task.id}
                task={task}
                handleCleanNonFollowers={
                  handleCleanNonFollowers
                }
                cleaningTaskId={cleaningTaskId}
                handleCancelTask={handleCancelTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed / Paused Tasks */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <button
          onClick={() => setExpandedHistory(!expandedHistory)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h2 className="text-xl flex items-center gap-2">
            {expandedHistory ? (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
            Stopped Actions (Last 30 days)
          </h2>
          <span className="text-sm text-gray-500">
            3 actions
          </span>
        </button>

        {expandedHistory && (
          <div className="space-y-3 pt-2">
            <CompletedTaskItem
              task={{
                id: 1,
                title: "Follow from Competitor (@fashion_hub)",
                actions: 200,
                impact: "+18 new followers",
                date: "2 days ago",
                followedCount: 200,
                followedBackCount: 56,
                cleanedCount: 28,
                sourceUrl:
                  "https://www.instagram.com/fashion_hub/",
              }}
              handleCleanNonFollowers={handleCleanNonFollowers}
              cleaningTaskId={cleaningTaskId}
              isLast={false}
            />
            <CompletedTaskItem
              task={{
                id: 2,
                title: "Follow from Post Likes (@travel_world)",
                actions: 150,
                impact: "+12 new followers",
                date: "5 days ago",
                followedCount: 150,
                followedBackCount: 42,
                cleanedCount: 18,
                sourceUrl:
                  "https://www.instagram.com/p/ABC123XYZ/",
              }}
              handleCleanNonFollowers={handleCleanNonFollowers}
              cleaningTaskId={cleaningTaskId}
              isLast={false}
            />
            <CompletedTaskItem
              task={{
                id: 3,
                title: "Follow from CSV (influencers_list.csv)",
                actions: 95,
                impact: "+8 new followers",
                date: "1 week ago",
                followedCount: 95,
                followedBackCount: 24,
                cleanedCount: 12,
              }}
              handleCleanNonFollowers={handleCleanNonFollowers}
              cleaningTaskId={cleaningTaskId}
              isLast={true}
            />
          </div>
        )}
      </div>

      {/* Membership Modal */}
      {showMembershipModal && (
        <MembershipModal
          onClose={() => setShowMembershipModal(false)}
        />
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && confirmType === 'cancel' && (
        <ConfirmDialog
          title="Cancel Task"
          message="Are you sure you want to cancel this task? It will be moved to completed tasks."
          confirmText="Confirm"
          cancelText="Cancel"
          iconType="warning"
          confirmColor="red"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {showConfirmDialog && confirmType === 'newAction' && (
        <ConfirmDialog
          title="Account Safety Notice"
          message="For account safety, only one action can run at a time. Creating a new action will automatically stop all current actions and move them to Stopped Actions. Do you want to proceed?"
          confirmText="Proceed"
          cancelText="Cancel"
          iconType="security"
          confirmColor="purple"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}

function ActionCard({
  task,
  handleCleanNonFollowers,
  cleaningTaskId,
  handleCancelTask,
}: {
  task: any;
  handleCleanNonFollowers: (taskId: number) => void;
  cleaningTaskId: number | null;
  handleCancelTask: (taskId: number) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);

  const progressPercent = (task.progress / task.total) * 100;
  const taskType = getTaskTypeFromTitle(task.title);
  const taskTypeConfig = getTaskTypeConfig(taskType);
  const TaskIcon = taskTypeConfig.icon;
  const followBackRate = Math.round(
    (task.followedBackCount / task.followedCount) * 100,
  );

  // Determine if task has a link URL
  const hasLinkUrl =
    taskType === "competitor-follow" ||
    taskType === "post-follow";

  const handleOpenLink = () => {
    if (task.sourceUrl) {
      window.open(
        task.sourceUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    handleCancelTask(task.id);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Mock followed users data
  const followedUsers = [
    {
      id: 1,
      username: "fashionista_jane",
      avatar: "https://i.pravatar.cc/150?img=1",
      followers: 12500,
      following: 850,
      followStatus: "Following",
      followedAt: "2 hours ago",
    },
    {
      id: 2,
      username: "style_maven_22",
      avatar: "https://i.pravatar.cc/150?img=2",
      followers: 8200,
      following: 420,
      followStatus: "Requested",
      followedAt: "3 hours ago",
    },
    {
      id: 3,
      username: "trend_setter_mike",
      avatar: "https://i.pravatar.cc/150?img=3",
      followers: 45000,
      following: 1200,
      followStatus: "Following",
      followedAt: "5 hours ago",
    },
    {
      id: 4,
      username: "daily_outfits",
      avatar: "https://i.pravatar.cc/150?img=4",
      followers: 23400,
      following: 680,
      followStatus: "Following",
      followedAt: "1 day ago",
    },
    {
      id: 5,
      username: "closet_inspo",
      avatar: "https://i.pravatar.cc/150?img=5",
      followers: 5600,
      following: 320,
      followStatus: "Requested",
      followedAt: "1 day ago",
    },
  ];

  if (isCanceled) {
    return null; // In real app, parent would handle removal
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Task Type Icon */}
          <div
            className={`${taskTypeConfig.bgColor} ${taskTypeConfig.iconColor} p-2.5 rounded-lg flex-shrink-0`}
          >
            <TaskIcon className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-900">
                {task.title}
              </h3>
              {/* Link Button */}
              {hasLinkUrl && task.sourceUrl && (
                <button
                  onClick={handleOpenLink}
                  className="p-1 hover:bg-purple-50 rounded transition-colors group relative"
                  title="Open in Instagram"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isPaused ? (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-yellow-100 text-yellow-700">
                  ⏸ Paused
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                  🟢 In Progress
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key Stats - Compact but Prominent */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg px-3 py-2">
            <div className="text-[10px] text-purple-600 mb-0.5 flex items-center gap-1">
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              I Followed
            </div>
            <div className="text-lg font-bold text-purple-600">
              {task.followedCount}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-20 to-green-40 border border-green-200 rounded-lg px-3 py-2">
            <div className="text-[10px] text-green-600 mb-0.5 flex items-center gap-1">
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Follow Back
            </div>
            <div className="text-lg font-bold text-green-600">
              {task.followedBackCount}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-20 to-blue-40 border border-blue-200 rounded-lg px-3 py-2">
            <div className="text-[10px] text-blue-600 mb-0.5 flex items-center gap-1">
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Rate
            </div>
            <div className="text-lg font-bold text-blue-600">
              {followBackRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Progress</span>
            {!isPaused && (
              <Loader2 className="w-3.5 h-3.5 text-green-500 animate-spin" />
            )}
          </div>
          <span className="font-medium">
            {task.progress} / {task.total}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all relative overflow-hidden ${
              isPaused
                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            {/* Animated shimmer effect */}
            {!isPaused && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s infinite",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            Today
          </div>
          <div className="text-sm font-medium">
            {isPaused
              ? "0 followed"
              : `${task.todayActions} followed`}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">
            Est. completion
          </div>
          <div className="text-sm font-medium">
            {task.estimatedDays}
          </div>
        </div>
        {/* <div>
          <div className="text-xs text-gray-500 mb-1">
            Impact so far
          </div>
          <div className="text-sm font-medium text-green-600">
            {task.impact}
          </div>
        </div> */}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={handlePauseResume}
          className={`flex-1 px-3 py-2 border rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
            isPaused
              ? "border-green-300 text-green-600 hover:bg-green-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
        <button
          onClick={handleToggleDetails}
          className="flex-1 px-3 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          {showDetails ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Details
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Details Section - Followed Users List */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              Followed Users ({followedUsers.length})
            </h4>
            <button
              onClick={handleToggleDetails}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {followedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    @{user.username}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>
                      {user.followers.toLocaleString()}{" "}
                      followers
                    </span>
                    <span>·</span>
                    <span>
                      {user.following.toLocaleString()}{" "}
                      following
                    </span>
                  </div>
                </div>

                {/* Follow Status */}
                <div className="flex items-center gap-2">
                  {user.followStatus === "Following" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      <UserCheck className="w-3 h-3" />
                      Following
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      <UserPlus className="w-3 h-3" />
                      Requested
                    </span>
                  )}
                </div>

                {/* Followed Time */}
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {user.followedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedTaskItem({
  task,
  handleCleanNonFollowers,
  cleaningTaskId,
  isLast,
}: {
  task: any;
  handleCleanNonFollowers: (taskId: number) => void;
  cleaningTaskId: number | null;
  isLast: boolean;
}) {
  const taskType = getTaskTypeFromTitle(task.title);
  const taskTypeConfig = getTaskTypeConfig(taskType);
  const TaskIcon = taskTypeConfig.icon;
  const followBackRate = task.followedCount
    ? Math.round(
        (task.followedBackCount / task.followedCount) * 100,
      )
    : 0;
  const isCleaning = cleaningTaskId === task.id;

  // Determine if task has a link URL
  const hasLinkUrl =
    taskType === "competitor-follow" ||
    taskType === "post-follow";

  const handleOpenLink = () => {
    if (task.sourceUrl) {
      window.open(
        task.sourceUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div
      className={`flex gap-4 ${!isLast ? "pb-3 border-b" : ""}`}
    >
      {/* Timeline Dot with Icon */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={`${taskTypeConfig.bgColor} ${taskTypeConfig.iconColor} p-1.5 rounded-lg`}
        >
          <TaskIcon className="w-3.5 h-3.5" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gray-200 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium text-gray-900">
                    {task.title}
                  </h4>
                  {/* Link Button */}
                  {hasLinkUrl && task.sourceUrl && (
                    <button
                      onClick={handleOpenLink}
                      className="p-1 hover:bg-purple-50 rounded transition-colors group relative"
                      title="Open in Instagram"
                    >
                      <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-purple-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Completed
                  </span>
                  <span>·</span>
                  {/* <span>{task.actions} actions</span> */}
                  <span>·</span>
                  <span>{task.date}</span>
                </div>
              </div>

              {/* Compact Stats Cards */}
              {task.followedCount && (
                <div className="flex items-center gap-1.5 ml-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-md px-2 py-1">
                    <div className="text-[10px] text-purple-600 mb-0.5 flex items-center gap-0.5">
                      <svg
                        className="w-2 h-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Followed
                    </div>
                    <div className="text-sm font-bold text-purple-600">
                      {task.followedCount}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-md px-2 py-1">
                    <div className="text-[10px] text-green-600 mb-0.5 flex items-center gap-0.5">
                      <svg
                        className="w-2 h-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Follow Back
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {task.followedBackCount}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-md px-2 py-1">
                    <div className="text-[10px] text-blue-600 mb-0.5 flex items-center gap-0.5">
                      <svg
                        className="w-2 h-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      Rate
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {followBackRate}%
                    </div>
                  </div>

                  {task.cleanedCount > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-md px-2 py-1">
                      <div className="text-[10px] text-orange-600 mb-0.5 flex items-center gap-0.5">
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Cleaned
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        {task.cleanedCount}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 whitespace-nowrap ml-4">
            <Eye className="w-3.5 h-3.5" />
            View details
          </button> */}
        </div>

        <div className="flex items-center justify-between">
          {/* <div className="text-sm">
            <span className="text-gray-500">Net impact:</span>
            <span className="ml-1 font-medium text-green-600">
              {task.impact}
            </span>
          </div> */}

          {/* Clean Button */}
          <button
            onClick={() => handleCleanNonFollowers(task.id)}
            disabled={isCleaning}
            className="px-3 py-1.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCleaning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clean Non-Followers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}