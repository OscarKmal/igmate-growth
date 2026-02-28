import React, { useState } from "react";
import {
  X,
  ChevronDown,
  CheckCircle2,
  Play,
  Settings,
  Info,
  AlertTriangle,
  Shield,
  TrendingUp,
  Sparkles,
  Download,
  Upload,
  FileText,
  Trash2,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TASK_TYPES } from "~utils/taskTypes";
import { createGrowthTask, patchActiveGrowthTask, startGrowthTask } from "~utils/growthTaskCenter";
import { buildBatchFollowEstimatedTimeText } from "~utils/estimateTimeUtils";
import { loadNormalizedSafetySettings } from "~utils/safetySettingsUtils";

interface CreateTaskProps {
  onClose: () => void;
  onComplete: () => void;
}

type GoalType = "similar" | "interested" | "batch" | null;

interface UploadedFile {
  name: string;
  userCount: number;
  uploadDate: Date;
}

export function CreateTask({
  onClose,
  onComplete,
}: CreateTaskProps) {
  const [selectedGoal, setSelectedGoal] =
    useState<GoalType>(null);
  const [competitorEdge, setCompetitorEdge] = useState<"followers" | "following">("followers");
  const [postSourceMode, setPostSourceMode] = useState<"likers" | "commenters" | "both">("commenters");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomRatio, setShowCustomRatio] = useState(false);
  const [isCustomValue, setIsCustomValue] = useState(false);
  const [showCustomPosts, setShowCustomPosts] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [batchEstimatedTimeText, setBatchEstimatedTimeText] = useState<string>("");
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);
  const [csvUsernames, setCsvUsernames] = useState<string[]>([]);
  const [taskData, setTaskData] = useState({
    input: "",
    filters: {
      requireVerified: false,
      excludeNew30Days: true,
      minFollowRatio: 1.0,
      minPostCount: 10,
    },
  });

  const goalConfigs = {
    similar: {
      ...TASK_TYPES['competitor-follow'],
      title: "吸引与该账号相似的潜在粉丝",
      gradient: "from-blue-500 to-blue-600",
    },
    interested: {
      ...TASK_TYPES['post-follow'],
      title: "基于竞对内容，精准找到并关注高意向用户",
      gradient: "from-pink-500 to-pink-600",
    },
    batch: {
      ...TASK_TYPES['csv-follow'],
      title: "Follow Saved Users",
      gradient: "from-emerald-500 to-emerald-600",
    },
  };

  const handleStart = async () => {
    try {
      const type = (() => {
        if (selectedGoal === "similar") return "competitor-follow";
        if (selectedGoal === "interested") return "post-follow";
        if (selectedGoal === "batch") return "csv-follow";
        return null;
      })();

      if (!type) return;

      const sourceInput = selectedGoal === "batch" ? (uploadedFile?.name || "") : taskData.input;
      const task = await createGrowthTask({
        type,
        sourceInput,
        filters: taskData.filters
      });

	  if (type === "competitor-follow") {
		  await patchActiveGrowthTask(task.id, {
			  competitorEdge
		  });
	  }

	  if (type === "post-follow") {
		  await patchActiveGrowthTask(task.id, {
			  postSourceMode,
			  postUrl: taskData.input
		  });
	  }

    if (type === "csv-follow" && csvUsernames.length > 0) {
      await patchActiveGrowthTask(task.id, {
        csvUsernames,
        total: csvUsernames.length
      });
    }

      await startGrowthTask(task.id);
      onComplete();
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  const handleSelectGoal = (goal: GoalType) => {
    setSelectedGoal(goal);
    setShowAdvanced(false);
  };

  const handleDownloadTemplate = () => {
    // 创建CSV模板内容
    const csvContent =
      "Instagram Username\n@example_user1\nexample_user2\n@fashion_blogger\ntravel_influencer";
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      "instagram_users_template.csv",
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsParsing(true);
      setBatchEstimatedTimeText("");
      try {
        const { parseInstagramUsersFromFile } = await import("~utils/fileParser");
        const usernames = await parseInstagramUsersFromFile(file);
        setCsvUsernames(usernames);
        setUploadedFile({
          name: file.name,
          userCount: usernames.length,
          uploadDate: new Date(),
        });
        setTaskData({ ...taskData, input: file.name });

        const safety = await loadNormalizedSafetySettings();
        const text = buildBatchFollowEstimatedTimeText({
          count: usernames.length,
          requestIntervalSeconds: safety.requestIntervalSeconds,
          requestRandomRangeSeconds: safety.requestRandomRangeSeconds,
          fixedRequestDurationSeconds: 1.5
        });
        setBatchEstimatedTimeText(text);
      } catch (err) {
        console.error(err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setCsvUsernames([]);
    setTaskData({ ...taskData, input: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-300 via-pink-300 to-orange-200 px-8 py-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-white">
            {selectedGoal && (
              <button
                onClick={() => setSelectedGoal(null)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                title="返回重选"
              >
                <span className="text-xl">←</span>
              </button>
            )}
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {selectedGoal ? (() => {
                const SelectedIcon = goalConfigs[selectedGoal].icon;
                return <SelectedIcon className="w-5 h-5" />;
              })() : (
                <Play className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-2xl">
                {selectedGoal
                  ? goalConfigs[selectedGoal].title
                  : "选择你的增长策略"}
              </h2>
              <p className="text-sm text-white/80">
                {selectedGoal
                  ? "Auto-follow users you’ve already collected"
                  : "选择一个目标开始吸粉"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {!selectedGoal ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-4"
              >
                {(() => {
                  const CompetitorIcon = TASK_TYPES['competitor-follow'].icon;
                  return (
                    <GoalCard
                      icon={<CompetitorIcon className="w-8 h-8" />}
                      title="吸引与该账号相似的潜在粉丝"
                      description="从竞争对手或同行中吸粉"
                      gradient="from-blue-500 to-blue-600"
                      bgColor={TASK_TYPES['competitor-follow'].bgColor}
                      iconColor={TASK_TYPES['competitor-follow'].iconColor}
                      onClick={() => handleSelectGoal("similar")}
                    />
                  );
                })()}

                {(() => {
                  const PostIcon = TASK_TYPES['post-follow'].icon;
                  return (
                    <GoalCard
                      icon={<PostIcon className="w-8 h-8" />}
                      title="基于竞对内容，精准找到并关注高意向用户"
                      description="从某条 Post / Reel 中吸粉"
                      gradient="from-pink-500 to-pink-600"
                      bgColor={TASK_TYPES['post-follow'].bgColor}
                      iconColor={TASK_TYPES['post-follow'].iconColor}
                      onClick={() => handleSelectGoal("interested")}
                    />
                  );
                })()}

                {(() => {
                  const CsvIcon = TASK_TYPES['csv-follow'].icon;
                  return (
                    <GoalCard
                      icon={<CsvIcon className="w-8 h-8" />}
                      title="Follow Saved Users"
                      description="上传 Excel，一键自动关注"
                      gradient="from-emerald-500 to-emerald-600"
                      bgColor={TASK_TYPES['csv-follow'].bgColor}
                      iconColor={TASK_TYPES['csv-follow'].iconColor}
                      onClick={() => handleSelectGoal("batch")}
                    />
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                {/* Input Section */}
                <div className="space-y-6">
                  <InputSection
                    goal={selectedGoal}
                    value={taskData.input}
                    onChange={(value) =>
                      setTaskData({ ...taskData, input: value })
                    }
                    isParsing={isParsing}
                    batchEstimatedTimeText={batchEstimatedTimeText}
                    competitorEdge={competitorEdge}
                    onCompetitorEdgeChange={setCompetitorEdge}
                    postSourceMode={postSourceMode}
                    onPostSourceModeChange={setPostSourceMode}
                    uploadedFile={uploadedFile}
                    onDownloadTemplate={handleDownloadTemplate}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                  />

                  {/* Advanced Settings */}
                  <motion.div
                    animate={{
                      opacity:
                        taskData.input.trim().length > 0 ||
                        selectedGoal === "batch"
                          ? 1
                          : 0.4,
                      pointerEvents:
                        taskData.input.trim().length > 0 ||
                        selectedGoal === "batch"
                          ? "auto"
                          : "none",
                      scale:
                        taskData.input.trim().length > 0 ||
                        selectedGoal === "batch"
                          ? 1
                          : 0.98,
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setShowAdvanced(!showAdvanced)
                      }
                      disabled={
                        (taskData.input.trim().length === 0 &&
                        selectedGoal !== "batch") ||
                        (selectedGoal === "batch" && !uploadedFile)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <div className="text-sm">
                            🎯 智能筛选
                          </div>
                          <div className="text-xs text-gray-500">
                            {showAdvanced
                              ? "点击收起"
                              : "已帮你过滤低质量账号，提高关注成功率"}
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          rotate: showAdvanced ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 space-y-3 border-t-2 border-gray-100">
                            {/* 1. 避免低质量账号 - ��荐选项 */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-2xl p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-full shadow-sm">
                                  <Sparkles className="w-3 h-3" />
                                  推荐
                                </span>
                              </div>

                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Shield className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 pt-1">
                                  <FilterToggle
                                    label="避免低质量账号"
                                    description="排除可能是僵尸号、机器人的账号，更容易回关"
                                    checked={
                                      taskData.filters
                                        .excludeNew30Days
                                    }
                                    onChange={(checked) =>
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          excludeNew30Days:
                                            checked,
                                        },
                                      })
                                    }
                                    showHint
                                    hintText="排除注册30天以内的账号"
                                  />
                                </div>
                              </div>
                            </motion.div>

                            {/* 2. 筛选更容易回关的账号 - 主要选项 */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-2xl p-5 border-2 border-purple-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <TrendingUp className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 pt-1">
                                  <h3 className="text-base mb-1 flex items-center gap-2">
                                    筛选更容易回关的账号
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    粉丝数远大于关注数的账号，回关率更高
                                  </p>
                                </div>
                              </div>

                              {!showCustomRatio ? (
                                <div className="grid grid-cols-5 gap-2">
                                  <RatioButton
                                    label="宽松"
                                    value={0.1}
                                    currentValue={
                                      taskData.filters
                                        .minFollowRatio
                                    }
                                    hoverText="following人数/followers人数>0.1"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minFollowRatio: 0.1,
                                        },
                                      });
                                      setIsCustomValue(false);
                                    }}
                                  />
                                  <RatioButton
                                    label="适中"
                                    value={0.5}
                                    currentValue={
                                      taskData.filters
                                        .minFollowRatio
                                    }
                                    hoverText="following人数/followers人数>0.5"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minFollowRatio: 0.5,
                                        },
                                      });
                                      setIsCustomValue(false);
                                    }}
                                  />
                                  <RatioButton
                                    label="推荐 ⭐"
                                    value={1.0}
                                    currentValue={
                                      taskData.filters
                                        .minFollowRatio
                                    }
                                    hoverText="following人数/followers人数>1"
                                    isRecommended
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minFollowRatio: 1.0,
                                        },
                                      });
                                      setIsCustomValue(false);
                                    }}
                                  />
                                  <RatioButton
                                    label="严格"
                                    value={3.0}
                                    currentValue={
                                      taskData.filters
                                        .minFollowRatio
                                    }
                                    hoverText="following人数/followers人数>3"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minFollowRatio: 3.0,
                                        },
                                      });
                                      setIsCustomValue(false);
                                    }}
                                  />
                                  {isCustomValue ? (
                                    <button
                                      onClick={() =>
                                        setShowCustomRatio(true)
                                      }
                                      className="px-3 py-2.5 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md rounded-lg text-xs transition-all"
                                    >
                                      {taskData.filters.minFollowRatio.toFixed(
                                        1,
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setShowCustomRatio(true)
                                      }
                                      className="px-3 py-2.5 bg-white border border-gray-300 hover:border-purple-400 rounded-lg text-xs text-gray-700 transition-all flex items-center justify-center gap-1"
                                    >
                                      <Settings className="w-3 h-3" />
                                      自定义
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="relative bg-white rounded-lg p-4 border-2 border-purple-300"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <div className="mb-3">
                                    <div className="text-center text-lg text-purple-600 mb-1">
                                      {taskData.filters.minFollowRatio.toFixed(
                                        1,
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="0.1"
                                    value={
                                      taskData.filters
                                        .minFollowRatio
                                    }
                                    onChange={(e) => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minFollowRatio:
                                            parseFloat(
                                              e.target.value,
                                            ),
                                        },
                                      });
                                      setIsCustomValue(true);
                                    }}
                                    onMouseUp={() =>
                                      setShowCustomRatio(false)
                                    }
                                    onTouchEnd={() =>
                                      setShowCustomRatio(false)
                                    }
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(taskData.filters.minFollowRatio / 3) * 100}%, #e5e7eb ${(taskData.filters.minFollowRatio / 3) * 100}%, #e5e7eb 100%)`,
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>0.0</span>
                                    <span>3.0</span>
                                  </div>
                                </div>
                              )}

                              <p className="text-xs text-gray-500 mt-3 bg-white/80 px-3 py-2 rounded-lg backdrop-blur-sm">
                                💡 Following/Follower 比例{" "}
                                {taskData.filters.minFollowRatio.toFixed(
                                  1,
                                )}
                                （比例越高筛选越严格）
                              </p>
                            </motion.div>

                            {/* 3. 只关注真实活跃用户 - 次要选项 */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-br from-blue-50 via-cyan-50 to-white rounded-2xl p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Users className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 pt-1">
                                  <h3 className="text-base mb-1">
                                    只关注真实活跃用户
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    根据发帖数量判断账号活跃度
                                  </p>
                                </div>
                              </div>

                              {!showCustomPosts ? (
                                <div className="grid grid-cols-5 gap-2">
                                  <RatioButton
                                    label="Any"
                                    value={0}
                                    currentValue={
                                      taskData.filters
                                        .minPostCount
                                    }
                                    hoverText="无发帖数量要求"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minPostCount: 0,
                                        },
                                      });
                                    }}
                                  />
                                  <RatioButton
                                    label="Active"
                                    value={10}
                                    currentValue={
                                      taskData.filters
                                        .minPostCount
                                    }
                                    hoverText="活跃用户：至少10个帖子"
                                    isRecommended
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minPostCount: 10,
                                        },
                                      });
                                    }}
                                  />
                                  <RatioButton
                                    label="Established"
                                    value={50}
                                    currentValue={
                                      taskData.filters
                                        .minPostCount
                                    }
                                    hoverText="成熟账号：至少50个帖子"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minPostCount: 50,
                                        },
                                      });
                                    }}
                                  />
                                  <RatioButton
                                    label="Power users"
                                    value={200}
                                    currentValue={
                                      taskData.filters
                                        .minPostCount
                                    }
                                    hoverText="超级用户：至少200个帖子"
                                    onClick={() => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minPostCount: 200,
                                        },
                                      });
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      setShowCustomPosts(true)
                                    }
                                    className="px-3 py-2.5 bg-white border border-gray-300 hover:border-blue-400 rounded-lg text-xs text-gray-700 transition-all flex items-center justify-center gap-1"
                                  >
                                    Advanced
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className="relative bg-white rounded-lg p-4 border-2 border-blue-300"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <label className="block text-sm text-gray-700 mb-2">
                                    Minimum posts:
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      taskData.filters
                                        .minPostCount
                                    }
                                    onChange={(e) => {
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          minPostCount:
                                            parseInt(
                                              e.target.value,
                                            ) || 0,
                                        },
                                      });
                                    }}
                                    onBlur={() =>
                                      setShowCustomPosts(false)
                                    }
                                    autoFocus
                                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                                    placeholder="输入数字"
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    按 Enter 或点击外部关闭
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500 mt-3 bg-white/80 px-3 py-2 rounded-lg backdrop-blur-sm">
                                💡
                                发帖数越多，账号越可能是真人且活跃
                              </p>
                            </motion.div>

                            {/* 4. 仅关注已认证账号 - 不推荐选项 */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gradient-to-br from-yellow-50 via-amber-50 to-white rounded-2xl p-5 border-2 border-yellow-300 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-600 text-white text-xs rounded-full shadow-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  不推荐
                                </span>
                              </div>

                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 pt-1">
                                  <FilterToggle
                                    label="仅关注已证账号（蓝V）"
                                    description="会大幅减少可关注用户数量，极少数场景才需要"
                                    checked={
                                      taskData.filters
                                        .requireVerified
                                    }
                                    onChange={(checked) =>
                                      setTaskData({
                                        ...taskData,
                                        filters: {
                                          ...taskData.filters,
                                          requireVerified:
                                            checked,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Default Values Preview */}
                    {!showAdvanced && (
                      <div className="px-6 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {taskData.filters
                            .excludeNew30Days && (
                            <DefaultBadge
                              text="避免低质量账号"
                              hoverText="更容易回关的真实用户"
                            />
                          )}
                          {taskData.filters.requireVerified && (
                            <DefaultBadge
                              text="仅高质量用户"
                              hoverText="只关注有蓝色认证标识的账号"
                            />
                          )}
                          <DefaultBadge
                            text="更容易回关"
                            hoverText={`Following/Follower 比例 ≥ ${taskData.filters.minFollowRatio.toFixed(1)}`}
                          />
                          <DefaultBadge
                            text="真实活跃用户"
                            hoverText={`至少发布过 ${taskData.filters.minPostCount} 个帖子`}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    animate={{
                      opacity:
                        taskData.input.trim().length > 0 ||
                        uploadedFile
                          ? 1
                          : 0.4,
                      scale:
                        taskData.input.trim().length > 0 ||
                        uploadedFile
                          ? 1
                          : 0.98,
                    }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <p className="text-center text-xs text-gray-500">
                      预计每天关注 140 人 · 风险等级：低 🟢
                    </p>

                    {/* Start Button */}
                    <motion.button
                      onClick={handleStart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        selectedGoal === "batch"
                          ? !uploadedFile
                          : taskData.input.trim().length === 0
                      }
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-lg">
                        开始自动关注
                      </span>
                    </motion.button>

                    <p className="text-center text-xs text-gray-500">
                      🛡️ 已启用账号安全保护
                      系统会自动控制频率，避免触发风控
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function GoalCard({
  icon,
  title,
  description,
  gradient,
  bgColor,
  iconColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  bgColor: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all text-left overflow-hidden group"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className={`${bgColor} ${iconColor} p-3 rounded-xl inline-flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all`}>
          {icon}
        </div>
        <h3 className="text-base mb-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
          {description}
        </p>
      </div>

      <div
        className={`absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
    </motion.button>
  );
}

function InputSection({
  goal,
  value,
  onChange,
  isParsing,
  batchEstimatedTimeText,
  competitorEdge,
  onCompetitorEdgeChange,
  postSourceMode,
  onPostSourceModeChange,
  uploadedFile,
  onDownloadTemplate,
  onFileUpload,
  onRemoveFile,
}: {
  goal: GoalType;
  value: string;
  onChange: (value: string) => void;
  isParsing: boolean;
  batchEstimatedTimeText?: string;
  competitorEdge?: "followers" | "following";
  onCompetitorEdgeChange?: (edge: "followers" | "following") => void;
  postSourceMode?: "likers" | "commenters" | "both";
  onPostSourceModeChange?: (mode: "likers" | "commenters" | "both") => void;
  uploadedFile?: UploadedFile | null;
  onDownloadTemplate?: () => void;
  onFileUpload?: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onRemoveFile?: () => void;
}) {
  const hasInput = value.trim().length > 0;

  if (goal === "similar") {
    return (
      <div className="space-y-4">
        {/* Input Container with Subtle Focus Effect */}
        <motion.div
          animate={{
            marginBottom: hasInput ? "16px" : "12px",
          }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              hasInput
                ? "bg-white"
                : "bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 shadow-lg"
            }`}
          >
            <label
              className={`block mb-3 flex items-center gap-2 transition-all duration-300 ${
                hasInput ? "text-sm px-2" : "text-base"
              }`}
            >
              <motion.span
                animate={{
                  fontWeight: hasInput ? 400 : 600,
                  color: hasInput
                    ? "rgb(75, 85, 99)"
                    : "rgb(88, 28, 135)",
                }}
                className="transition-all"
              >
                {hasInput
                  ? "输入竞争对手的 Instagram 用户名"
                  : "👇 输入竞争对手的 Instagram 用户名"}
              </motion.span>
              <div className="relative inline-block group/username-hint">
                <Info
                  className={`w-4 h-4 cursor-help transition-colors ${
                    hasInput
                      ? "text-purple-500"
                      : "text-purple-600"
                  }`}
                />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-3 bg-white border-2 border-purple-200 rounded-xl shadow-xl opacity-0 invisible group-hover/username-hint:opacity-100 group-hover/username-hint:visible transition-all pointer-events-none z-[9999]">
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-8 border-transparent border-r-purple-200"></div>
                  <img
                    src="https://via.placeholder.com/240x180/9333ea/ffffff?text=Instagram+Username+Example"
                    alt="示例图片"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <p className="text-xs text-gray-700">
                    在这里输入你想分析的竞争对手用户名
                  </p>
                </div>
              </div>
            </label>

            <motion.input
              type="text"
              placeholder="例如: @fashion_blogger"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              animate={{
                paddingTop: hasInput ? "1rem" : "1.25rem",
                paddingBottom: hasInput ? "1rem" : "1.25rem",
                fontSize: hasInput ? "1.125rem" : "1.25rem",
              }}
              transition={{ duration: 0.3 }}
              className={`w-full px-5 border-2 rounded-xl focus:outline-none transition-all ${
                hasInput
                  ? "border-gray-300 focus:border-purple-500 bg-white"
                  : "border-purple-300 focus:border-purple-500 bg-white shadow-md ring-4 ring-purple-100"
              }`}
            />

            {/* Subtle Hint - Only show when no input */}
            {!hasInput && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-4 flex items-center gap-2 text-sm text-purple-700"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 bg-purple-600 rounded-full"
                />
                <span>输入后可继续设置筛选条件</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Followers/Following Options - Faded when no input */}
        <AnimatePresence>
          <motion.div
            animate={{
              opacity: hasInput ? 1 : 0.4,
              pointerEvents: hasInput ? "auto" : "none",
              scale: hasInput ? 1 : 0.98,
            }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            <label className="group/followers relative flex-1 flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all has-[:checked]:bg-gradient-to-br has-[:checked]:from-purple-50 has-[:checked]:to-purple-100 has-[:checked]:border-purple-400">
              <input
                type="radio"
                name="type"
                checked={(competitorEdge || "followers") === "followers"}
                onChange={() => onCompetitorEdgeChange?.("followers")}
                disabled={!hasInput}
                className="w-5 h-5 text-purple-600"
              />
              <div className="flex-1">
                <div className="text-sm flex items-center gap-1.5">
                  吸引 TA 的粉丝(Followers)
                  <div className="relative inline-block">
                    <Info className="w-3.5 h-3.5 text-purple-500" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/followers:opacity-100 group-hover/followers:visible transition-all pointer-events-none z-10">
                      他们更容易成为你的粉丝
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  关注 TA 的粉丝
                </div>
              </div>
            </label>
            <label className="flex-1 flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all has-[:checked]:bg-gradient-to-br has-[:checked]:from-purple-50 has-[:checked]:to-purple-100 has-[:checked]:border-purple-400">
              <input
                type="radio"
                name="type"
                checked={competitorEdge === "following"}
                onChange={() => onCompetitorEdgeChange?.("following")}
                disabled={!hasInput}
                className="w-5 h-5 text-purple-600"
              />
              <div>
                <div className="text-sm">
                  吸引TA的关注对象(Following)
                </div>
                <div className="text-xs text-gray-600">
                  TA 关注的人
                </div>
              </div>
            </label>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (goal === "interested") {
    return (
      <div className="space-y-4">
        {/* Input Container with Subtle Focus Effect */}
        <motion.div
          animate={{
            marginBottom: hasInput ? "16px" : "12px",
          }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              hasInput
                ? "bg-white"
                : "bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6 shadow-lg"
            }`}
          >
            <label
              className={`block mb-3 flex items-center gap-2 transition-all duration-300 ${
                hasInput ? "text-sm px-2" : "text-base"
              }`}
            >
              <motion.span
                animate={{
                  fontWeight: hasInput ? 400 : 600,
                  color: hasInput
                    ? "rgb(75, 85, 99)"
                    : "rgb(190, 24, 93)",
                }}
                className="transition-all"
              >
                {hasInput
                  ? "粘贴 Instagram 帖子 / Reel 链接"
                  : "👇 粘贴 Instagram 帖子 / Reel 链接"}
              </motion.span>
              <div className="relative inline-block group/post-hint">
                <Info
                  className={`w-4 h-4 cursor-help transition-colors ${
                    hasInput ? "text-pink-500" : "text-pink-600"
                  }`}
                />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-3 bg-white border-2 border-pink-200 rounded-xl shadow-xl opacity-0 invisible group-hover/post-hint:opacity-100 group-hover/post-hint:visible transition-all pointer-events-none z-[9999]">
                  <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-8 border-transparent border-r-pink-200"></div>
                  <img
                    src="https://via.placeholder.com/240x180/ec4899/ffffff?text=Instagram+Post+Link+Example"
                    alt="示例图片"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                  <p className="text-xs text-gray-700">
                    如何找到Post或者reels的链接
                  </p>
                </div>
              </div>
            </label>

            <motion.input
              type="text"
              placeholder="例如: https://instagram.com/p/xxx"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              animate={{
                paddingTop: hasInput ? "1rem" : "1.25rem",
                paddingBottom: hasInput ? "1rem" : "1.25rem",
                fontSize: hasInput ? "1.125rem" : "1.25rem",
              }}
              transition={{ duration: 0.3 }}
              className={`w-full px-5 border-2 rounded-xl focus:outline-none transition-all ${
                hasInput
                  ? "border-gray-300 focus:border-pink-500 bg-white"
                  : "border-pink-300 focus:border-pink-500 bg-white shadow-md ring-4 ring-pink-100"
              }`}
            />

            {/* Subtle Hint - Only show when no input */}
            {!hasInput && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="mt-4 flex items-center gap-2 text-sm text-pink-700"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 bg-pink-600 rounded-full"
                />
                <span>输入后可继续设置筛选条件</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Comment/Like Options - Faded when no input */}
        <AnimatePresence>
          <motion.div
            animate={{
              opacity: hasInput ? 1 : 0.4,
              pointerEvents: hasInput ? "auto" : "none",
              scale: hasInput ? 1 : 0.98,
            }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            <label className="flex-1 flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-all has-[:checked]:bg-gradient-to-br has-[:checked]:from-pink-50 has-[:checked]:to-pink-100 has-[:checked]:border-pink-400">
              <input
                type="radio"
                name="interaction-type"
                checked={(postSourceMode || "commenters") === "commenters"}
                onChange={() => onPostSourceModeChange?.("commenters")}
                disabled={!hasInput}
                className="w-5 h-5 text-pink-600"
              />
              <div className="flex-1">
                <div className="text-sm">评论者</div>
                <div className="text-xs text-gray-600">
                  更高互动深度，通常回关率更高
                </div>
              </div>
            </label>
            <label className="flex-1 flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 transition-all has-[:checked]:bg-gradient-to-br has-[:checked]:from-pink-50 has-[:checked]:to-pink-100 has-[:checked]:border-pink-400">
              <input
                type="radio"
                name="interaction-type"
                checked={postSourceMode === "likers"}
                onChange={() => onPostSourceModeChange?.("likers")}
                disabled={!hasInput}
                className="w-5 h-5 text-pink-600"
              />
              <div className="flex-1">
                <div className="text-sm">点赞者</div>
                <div className="text-xs text-gray-600">
                  覆盖更广，数量更大
                </div>
              </div>
            </label>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (goal === "batch") {
    return (
      <div className="space-y-4">
        {!uploadedFile ? (
          <>
            {/* Upload Area */}
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-orange-400 transition-colors cursor-pointer bg-gradient-to-br from-orange-50/50 to-white">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-700 mb-1">
                拖拽文件到这里，或点击上传
              </p>
              <p className="text-xs text-gray-500 mb-3">
                支持 Excel (.xlsx, .xls) 和 CSV 格式
              </p>
              <div className="inline-block px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md mb-4">
                选择文件
              </div>
              
              {/* Integrated Format Requirements */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">
                    📋 文件格式要求
                  </p>
                  <button
                    onClick={onDownloadTemplate}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载模板
                  </button>
                </div>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  <li>• 第一列必须是 Instagram 用户名（带或不带 @ 都可以）或者profile link</li>
                  <li>• 每行一个用户名，插件会自动去重</li>
                  <li>• 建议上传 200-500 个用户名</li>
                </ul>
              </div>
            </label>
          </>
        ) : (
          /* Uploaded File Display */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* File Info Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <h3 className="text-base text-green-900 truncate">
                      {uploadedFile.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-green-700">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {uploadedFile.userCount} 个用户
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        上传于{" "}
                        {uploadedFile.uploadDate.toLocaleDateString(
                          "zh-CN",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onRemoveFile}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                  title="删除文件"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700" />
                </button>
              </div>

              {/* Progress/Stats Bar */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between text-xs text-green-700 mb-2">
                  <span>文件解析完成</span>
                  <span className="text-green-800">100%</span>
                </div>
                <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 1,
                      ease: "easeOut",
                    }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* User Count Summary or Parsing Loading */}
            <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 min-h-[80px]">
              {isParsing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                  <div className="flex items-center gap-2 text-orange-600 font-medium animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>正在解析文件...</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl text-orange-600">
                    {uploadedFile.userCount}
                  </div>
                  <div className="text-xs text-gray-500">总用户数</div>
                </div>
              </div>
              
              <div className="w-px h-10 bg-gray-200"></div>
              
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl text-purple-600">
                    {batchEstimatedTimeText || "0 seconds"}
                  </div>
                  <div className="text-xs text-gray-500">预计时间</div>
                </div>
              </div>
            </div>

            {/* Tips */}
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}

function FilterToggle({
  label,
  description,
  detailText,
  checked,
  onChange,
  notRecommended,
  showHint,
  hintText,
}: {
  label: string;
  description: string;
  detailText?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  notRecommended?: boolean;
  showHint?: boolean;
  hintText?: string;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group/toggle">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 transition-all"></div>
        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
      </div>
      <div className="flex-1">
        <div className="text-sm mb-0.5 group-hover/toggle:text-purple-600 transition-colors flex items-center gap-1.5">
          {label}{" "}
          {notRecommended && (
            <span className="text-xs text-yellow-700">
              （不推荐）
            </span>
          )}
          {showHint && hintText && (
            <div className="relative inline-block group/hint">
              <Info className="w-3.5 h-3.5 text-gray-400 hover:text-purple-500 transition-colors cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/hint:opacity-100 group-hover/hint:visible transition-all pointer-events-none z-30">
                {hintText}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 mb-1">
          {description}
        </div>
      </div>
    </label>
  );
}

function DefaultBadge({
  text,
  hoverText,
}: {
  text: string;
  hoverText: string;
}) {
  return (
    <div className="group/badge relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg cursor-default">
      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
      <span className="text-xs text-gray-800">{text}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all pointer-events-none z-20">
        {hoverText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

function RatioButton({
  label,
  value,
  currentValue,
  hoverText,
  onClick,
  isRecommended,
  isCustom,
}: {
  label: string;
  value: number;
  currentValue: number;
  hoverText: string;
  onClick: () => void;
  isRecommended?: boolean;
  isCustom?: boolean;
}) {
  const isActive = isRecommended
    ? currentValue === value
    : currentValue === value;

  return (
    <div className="relative group/ratio inline-block">
      <button
        onClick={onClick}
        disabled={isCustom}
        className={`w-full px-3 py-2.5 rounded-lg text-xs transition-all relative ${
          isCustom
            ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md cursor-default"
            : isActive
              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl"
              : "bg-white border border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
        }`}
      >
        {label}
      </button>
      {!isCustom && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-auto whitespace-nowrap px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/ratio:opacity-100 group-hover/ratio:visible transition-all pointer-events-none z-40">
          {hoverText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      {isCustom && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-auto whitespace-nowrap px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/ratio:opacity-100 group-hover/ratio:visible transition-all pointer-events-none z-40">
          {hoverText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}