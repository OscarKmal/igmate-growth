import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Settings as SettingsIcon,
} from "lucide-react";
import {
  getTaskTypeFromTitle,
  getTaskTypeConfig,
  getTaskDisplayTitle,
} from "~utils/taskTypes";
import { normalizeInsAvatarUrl } from "~utils/insAvatarUtils";
import ConfirmDialog from "./ConfirmDialog";
import { FollowUpgradeDialog } from "./FollowUpgradeDialog";
import { cleanNonFollowers } from "~utils/cleanNonFollowers";
import { t } from "~utils/commonFunction";
import {
  deleteActiveGrowthTask,
  deleteStoppedGrowthTask,
  getGrowthTaskSnapshot,
  pauseGrowthTask,
  startGrowthTask,
  stopGrowthTask,
  subscribeGrowthTaskSnapshot,
  type GrowthTask,
  type StoppedGrowthTask
} from "~utils/growthTaskCenter";
import { refreshActiveTasksFollowBackCounts } from "~utils/followBackStats";

interface ActionCenterProps {
  isPremium: boolean;
  onCreateTask: () => void;
  todayActionsUsed?: number;
  todayActionsLimit?: number;
  onDailyLimitReached?: () => void;
  onOpenSettings?: () => void;
  hasActiveTasks?: boolean;
}

export function ActionCenter({
  isPremium,
  onCreateTask,
  todayActionsUsed,
  todayActionsLimit,
  onDailyLimitReached,
  onOpenSettings,
  hasActiveTasks,
}: ActionCenterProps) {
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [activeTasks, setActiveTasks] = useState<GrowthTask[]>([]);
  const [stoppedTasks, setStoppedTasks] = useState<StoppedGrowthTask[]>([]);
  const [opTaskId, setOpTaskId] = useState<string | null>(null);
  const [opType, setOpType] = useState<"pause" | "resume" | "stop" | "deleteStopped" | null>(null);
  const [cleaningTaskId, setCleaningTaskId] = useState<
    string | null
  >(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmType, setConfirmType] = useState<'cancel' | 'newAction'>('cancel');
  const [taskToCancel, setTaskToCancel] = useState<string | null>(
    null,
  );

  /**
   * 用途：在定时器回调中拿到最新 activeTasks，避免 useEffect 依赖导致 interval 反复重建。
   */
  const activeTasksRef = useRef<GrowthTask[]>([]);

  useEffect(() => {
    let unsub: null | (() => void) = null;

    const init = async () => {
      setIsLoadingTasks(true);
      try {
        const snapshot = await getGrowthTaskSnapshot();
        setActiveTasks(snapshot.activeTasks);
        setStoppedTasks(snapshot.stoppedTasks);

		// 初始化时刷新一次回关统计（不阻塞 UI 渲染）
		void refreshActiveTasksFollowBackCounts(snapshot.activeTasks);
      } finally {
        setIsLoadingTasks(false);
      }

      unsub = subscribeGrowthTaskSnapshot((snapshot) => {
        setActiveTasks(snapshot.activeTasks);
        setStoppedTasks(snapshot.stoppedTasks);
      });
    };

    init();

    return () => {
      unsub?.();
    };
  }, []);

  useEffect(() => {
    activeTasksRef.current = activeTasks;
  }, [activeTasks]);

  useEffect(() => {
    // 定时刷新 Follow Back（每 2 分钟一次），避免频繁打后端
    const intervalMs = 2 * 60 * 1000;
    const timer = window.setInterval(() => {
      void refreshActiveTasksFollowBackCounts(activeTasksRef.current);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const hasRunningTask = useMemo(() => {
    return activeTasks.some((t) => t.status === "running");
  }, [activeTasks]);

  const isFreeDailyLimitReached = useMemo(() => {
    const used = typeof todayActionsUsed === "number" ? todayActionsUsed : 0;
    const limit = typeof todayActionsLimit === "number" ? todayActionsLimit : 0;
    if (isPremium) return false;
    if (!Number.isFinite(limit) || limit <= 0) return false;
    return used >= limit;
  }, [isPremium, todayActionsLimit, todayActionsUsed]);

  const handleCleanNonFollowers = (taskId: string) => {
    if (!isPremium) {
      setShowMembershipModal(true);
      return;
    }

    setCleaningTaskId(taskId);
    void (async () => {
      try {
        const snapshot = await getGrowthTaskSnapshot();
        const isActive = snapshot.activeTasks.some((t) => t?.id === taskId);
        await cleanNonFollowers({
          taskId,
          taskScope: isActive ? "active" : "stopped"
        });
      } finally {
        setCleaningTaskId(null);
      }
    })();
  };

  const handleCancelTask = (taskId: string) => {
    setTaskToCancel(taskId);
    setConfirmType('cancel');
    setShowConfirmDialog(true);
  };

  const handleNewAction = () => {
    if (isFreeDailyLimitReached) {
      onDailyLimitReached?.();
      return;
    }

    // 检查是否有运行中的任务
    if (hasRunningTask) {
      setConfirmType('newAction');
      setShowConfirmDialog(true);
    } else {
      onCreateTask();
    }
  };

  const confirmAction = async () => {
    try {
      if (confirmType === 'cancel' && taskToCancel) {
        setOpTaskId(taskToCancel);
        setOpType('stop');
        await stopGrowthTask(taskToCancel, 'user_cancel');
        setTaskToCancel(null);
      } else if (confirmType === 'newAction') {
        if (isFreeDailyLimitReached) {
          onDailyLimitReached?.();
          return;
        }
        onCreateTask();
      }
    } finally {
      setOpTaskId(null);
      setOpType(null);
      setShowConfirmDialog(false);
    }
  };

  const visibleActiveTasks = useMemo(() => {
    if (hasActiveTasks === false) return [];
    return activeTasks;
  }, [activeTasks, hasActiveTasks]);

  const handlePauseResumeTask = async (task: GrowthTask) => {
    try {
      setOpTaskId(task.id);
      if (task.status === "running") {
        setOpType("pause");
        await pauseGrowthTask(task.id);
      } else {
        if (isFreeDailyLimitReached) {
          onDailyLimitReached?.();
          return;
        }
        setOpType("resume");
        await startGrowthTask(task.id);
      }
    } finally {
      setOpTaskId(null);
      setOpType(null);
    }
  };

  const handleStopTask = async (taskId: string) => {
    try {
      setOpTaskId(taskId);
      setOpType("stop");
      await stopGrowthTask(taskId, "user_cancel");
    } finally {
      setOpTaskId(null);
      setOpType(null);
    }
  };

  const handleDeleteStoppedTask = async (taskId: string) => {
    try {
      setOpTaskId(taskId);
      setOpType("deleteStopped");
      await deleteStoppedGrowthTask(taskId);
    } finally {
      setOpTaskId(null);
      setOpType(null);
    }
  };

  const handleDeleteActiveTask = async (taskId: string) => {
    try {
      setOpTaskId(taskId);
      setOpType("stop");
      await deleteActiveGrowthTask(taskId);
    } finally {
      setOpTaskId(null);
      setOpType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            {t("cmp_action_center_active_actions", { count: activeTasks.length })}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
              title={t("cmp_action_center_safety_settings")}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleNewAction}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4" />
              {t("cmp_action_center_new_action")}
            </button>
          </div>
        </div>

        {isLoadingTasks ? (
          <div className="text-center py-12 text-gray-500">
            <Loader2 className="w-10 h-10 mx-auto mb-3 text-gray-300 animate-spin" />
            <p>{t("cmp_action_center_loading")}</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t("cmp_action_center_no_active_actions")}</p>
            <p className="text-sm mt-1">
              {t("cmp_action_center_no_active_actions_desc")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleActiveTasks.map((task) => (
              <ActionCard
                key={task.id}
                task={task}
                handleCleanNonFollowers={
                  handleCleanNonFollowers
                }
                cleaningTaskId={cleaningTaskId}
                handleCancelTask={handleCancelTask}
                handleDeleteActiveTask={handleDeleteActiveTask}
                handlePauseResumeTask={handlePauseResumeTask}
                opTaskId={opTaskId}
                opType={opType}
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
            {t("cmp_action_center_stopped_actions_last_30_days")}
          </h2>
          <span className="text-sm text-gray-500">
            {t("cmp_action_center_actions_count", { count: stoppedTasks.length })}
          </span>
        </button>

        {expandedHistory && (
          <div className="space-y-3 pt-2">
            {stoppedTasks.map((task, idx) => (
              <CompletedTaskItem
                key={task.id}
                task={task}
                handleCleanNonFollowers={handleCleanNonFollowers}
                cleaningTaskId={cleaningTaskId}
                isLast={idx === stoppedTasks.length - 1}
                onDelete={handleDeleteStoppedTask}
                opTaskId={opTaskId}
                opType={opType}
              />
            ))}
          </div>
        )}
      </div>

      {/* Membership Modal */}
      {showMembershipModal && (
        <FollowUpgradeDialog
        	open={showMembershipModal}
        	onOpenChange={setShowMembershipModal}
        />
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && confirmType === 'cancel' && (
        <ConfirmDialog
          title={t("dlg_confirm_cancel_task_title")}
          message={t("dlg_confirm_cancel_task_message")}
          confirmText={t("dlg_confirm_confirm")}
          cancelText={t("dlg_confirm_cancel")}
          iconType="warning"
          confirmColor="red"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {showConfirmDialog && confirmType === 'newAction' && (
        <ConfirmDialog
          title={t("dlg_confirm_account_safety_notice_title")}
          message={t("dlg_confirm_account_safety_notice_message")}
          confirmText={t("dlg_confirm_proceed")}
          cancelText={t("dlg_confirm_cancel")}
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
  handleDeleteActiveTask,
  handlePauseResumeTask,
  opTaskId,
  opType,
}: {
  task: GrowthTask;
  handleCleanNonFollowers: (taskId: string) => void;
  cleaningTaskId: string | null;
  handleCancelTask: (taskId: string) => void;
  handleDeleteActiveTask: (taskId: string) => void;
  handlePauseResumeTask: (task: GrowthTask) => void;
  opTaskId: string | null;
  opType: "pause" | "resume" | "stop" | "deleteStopped" | null;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);

  const safeTotal = task.total > 0 ? task.total : 1;
  const progressPercent = (task.progress / safeTotal) * 100;
  const taskTypeConfig = getTaskTypeConfig(task.type);
  const TaskIcon = taskTypeConfig.icon;
  const isPaused = task.status === "paused";
  const isOperating = opTaskId === task.id && (opType === "pause" || opType === "resume" || opType === "stop");
  const followedCount = task.followedCount ?? 0;
  const followedBackCount = task.followedBackCount ?? 0;
  const followBackRate = followedCount > 0 ? Math.round((followedBackCount / followedCount) * 100) : 0;
  const todayFollowed = task.todayActions ?? 0;

  // Determine if task has a link URL
  const hasLinkUrl =
    task.type === "competitor-follow" ||
    task.type === "post-follow";

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
    handlePauseResumeTask(task);
  };

  const handleCancel = () => {
    handleCancelTask(task.id);
  };

  const handleDelete = () => {
    handleDeleteActiveTask(task.id);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const followedUsers = Array.isArray(task.followedUsers) ? task.followedUsers : [];

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
                {getTaskDisplayTitle(task)}
              </h3>
              {/* Link Button */}
              {hasLinkUrl && task.sourceUrl && (
                <button
                  onClick={handleOpenLink}
                  className="p-1 hover:bg-purple-50 rounded transition-colors group relative"
                  title={t("cmp_action_center_open_in_instagram")}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isPaused ? (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-yellow-100 text-yellow-700">
                  {t("cmp_action_center_status_paused")}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                  {t("cmp_action_center_status_in_progress")}
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
              {t("cmp_action_center_stat_i_followed")}
            </div>
            <div className="text-lg font-bold text-purple-600">
              {followedCount}
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
              {t("cmp_action_center_stat_follow_back")}
            </div>
            <div className="text-lg font-bold text-green-600">
              {followedBackCount}
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
              {t("cmp_action_center_stat_rate")}
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
            <span className="text-gray-600">{t("cmp_action_center_progress")}</span>
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
            {t("cmp_action_center_today")}
          </div>
          <div className="text-sm font-medium">
            {t("cmp_action_center_today_followed", { count: todayFollowed })}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">
            {t("cmp_action_center_est_completion")}
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
              {t("cmp_action_center_resume")}
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              {t("cmp_action_center_pause")}
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
              {t("cmp_action_center_hide")}
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              {t("cmp_action_center_details")}
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          {t("cmp_action_center_delete")}
        </button>
      </div>

      {/* Details Section - Followed Users List */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {t("cmp_action_center_followed_users", { count: followedUsers.length })}
            </h4>
            <button
              onClick={handleToggleDetails}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {t("cmp_action_center_collapse")}
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {followedUsers.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">
                {t("cmp_action_center_no_followed_users")}
              </div>
            ) : (
              followedUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  {user.avatarUrl ? (
                    <img
                      src={normalizeInsAvatarUrl(user.avatarUrl)}
                      alt={user.username || user.userId}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {user.username ? `@${user.username}` : user.userId}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>
                        {t("cmp_action_center_user_followers", {
                          count: (user.followers ?? 0).toLocaleString()
                        })}
                      </span>
                      <span>·</span>
                      <span>
                        {t("cmp_action_center_user_following", {
                          count: (user.following ?? 0).toLocaleString()
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Follow Status */}
                  <div className="flex items-center gap-2">
                    {user.followStatus === "Following" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        <UserCheck className="w-3 h-3" />
                        {t("cmp_action_center_follow_status_following")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        <UserPlus className="w-3 h-3" />
                        {user.followStatus || t("cmp_action_center_follow_status_requested")}
                      </span>
                    )}
                  </div>

                  {/* Followed Time */}
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(user.followedAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
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
  onDelete,
  opTaskId,
  opType,
}: {
  task: StoppedGrowthTask;
  handleCleanNonFollowers: (taskId: string) => void;
  cleaningTaskId: string | null;
  isLast: boolean;
  onDelete: (taskId: string) => void;
  opTaskId: string | null;
  opType: "pause" | "resume" | "stop" | "deleteStopped" | null;
}) {
  const taskTypeConfig = getTaskTypeConfig(task.type);
  const TaskIcon = taskTypeConfig.icon;
  const followedCount = task.followedCount ?? 0;
  const followedBackCount = task.followedBackCount ?? 0;
  const followBackRate = followedCount > 0 ? Math.round((followedBackCount / followedCount) * 100) : 0;
  const isCleaning = cleaningTaskId === task.id;
  const isDeleting = opTaskId === task.id && opType === "deleteStopped";

  // Determine if task has a link URL
  const hasLinkUrl =
    task.type === "competitor-follow" ||
    task.type === "post-follow";

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
                    {getTaskDisplayTitle(task)}
                  </h4>
                  {/* Link Button */}
                  {hasLinkUrl && task.sourceUrl && (
                    <button
                      onClick={handleOpenLink}
                      className="p-1 hover:bg-purple-50 rounded transition-colors group relative"
                      title={t("cmp_action_center_open_in_instagram")}
                    >
                      <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-purple-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {t("cmp_action_center_status_completed")}
                  </span>
                  <span>·</span>
                  {/* <span>{task.actions} actions</span> */}
                  <span>·</span>
                  <span>{new Date(task.stoppedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Compact Stats Cards */}
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
                      {t("cmp_action_center_stat_followed")}
                    </div>
                    <div className="text-sm font-bold text-purple-600">
                      {followedCount}
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
                      {t("cmp_action_center_stat_follow_back")}
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {followedBackCount}
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
                      {t("cmp_action_center_stat_rate")}
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
                        {t("cmp_action_center_stat_cleaned")}
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        {task.cleanedCount}
                      </div>
                    </div>
                  )}
              </div>
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
            className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              isCleaning
                ? "bg-orange-100 text-orange-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isCleaning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserCheck className="w-3 h-3" />
            )}
            {t("cmp_action_center_clean_non_followers")}
          </button>

          <button
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className={`text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              isDeleting
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {t("cmp_action_center_delete")}
          </button>
        </div>
      </div>
    </div>
  );
}