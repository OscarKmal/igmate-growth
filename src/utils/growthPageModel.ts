import { useEffect, useMemo, useRef, useState } from "react";
import { initGrowthUserProfileData } from "~utils/growthProfile";
import { growthTaskRunner } from "~utils/growthTaskRunner";
import { getOrCreateInsUserInfo, getStorage, setStorage } from "~utils/functions";
import { safetyPresets, storageName } from "~utils/consts";
import {
  getAutoFollowSuccessDailyCounter,
  getFollowingGrowth7d,
  getTotalFollowingDistinctAllTime
} from "~utils/autoFollowStats";
import { Fetcher } from "~utils/Fetcher";

/**
 * GrowthPageModel
 *
 * 用途：
 * - 将 growth 页面中的“功能型逻辑”（数据初始化、Runner 生命周期、storage 订阅、安全设置读写等）从 UI 中抽离。
 * - 让 `src/tabs/growth.tsx` 仅保留页面交互（弹窗开关、事件绑定、组件渲染）。
 *
 * 说明：
 * - 该文件以 React Hook 形式提供页面模型，便于 UI 订阅状态并触发动作。
 */

/**
 * Growth 页安全设置（UI 层使用）。
 */
export interface GrowthSafetySettingsUiState {
  /**
   * 用途：每次请求间隔（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：6
   */
  requestInterval: number;

  /**
   * 用途：失败后暂停时长（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：600
   */
  failurePause: number;

  /**
   * 用途：随机范围（秒）。
   * 类型：number
   * 可选性：必填
   * 默认值：4
   */
  randomRange: number;
}

/**
 * Growth 页面模型 state。
 */
export interface GrowthPageModelState {
  /**
   * 用途：页面是否处于加载中。
   * 类型：boolean
   * 可选性：必填
   * 默认值：true
   */
  isLoading: boolean;

  /**
   * 用途：用户 profile 聚合数据。
   * 类型：Awaited<ReturnType<typeof initGrowthUserProfileData>> | null
   * 可选性：必填
   * 默认值：null
   */
  profileData: Awaited<ReturnType<typeof initGrowthUserProfileData>> | null;

  /**
   * 用途：SettingsDialog 是否展示高级设置。
   * 类型：boolean
   * 可选性：必填
   * 默认值：false
   */
  showAdvanced: boolean;

  /**
   * 用途：当前自定义安全设置。
   * 类型：GrowthSafetySettingsUiState
   * 可选性：必填
   * 默认值：见初始化
   */
  customSettings: GrowthSafetySettingsUiState;

  /**
   * 用途：当前匹配的预设等级（或 custom）。
   * 类型：string
   * 可选性：必填
   * 默认值：custom
   */
  matchedPresetLevel: string;
}

/**
 * Growth 页面模型 actions。
 */
export interface GrowthPageModelActions {
  /**
   * 用途：设置 showAdvanced。
   * 参数：
   * - next：boolean
   * 返回值：void
   */
  setShowAdvanced: (next: boolean) => void;

  /**
   * 用途：增量更新自定义安全设置。
   * 参数：
   * - patch：Partial<GrowthSafetySettingsUiState>
   * 返回值：void
   */
  patchCustomSettings: (patch: Partial<GrowthSafetySettingsUiState>) => void;

  /**
   * 用途：选择某个安全预设（或 custom）。
   * 参数：
   * - level：string
   * 返回值：void
   */
  handlePresetChange: (level: string) => void;

  /**
   * 用途：保存当前安全设置到 storage。
   * 返回值：Promise<void>
   */
  saveSafetySettings: () => Promise<void>;
}

/**
 * useGrowthPageModel
 *
 * 用途：
 * - growth 页面模型 Hook。
 * - 封装副作用（初始化、订阅、runner start/stop）。
 *
 * 返回值：
 * - { state, actions }
 */
export function useGrowthPageModel(): {
  state: GrowthPageModelState;
  actions: GrowthPageModelActions;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<Awaited<ReturnType<typeof initGrowthUserProfileData>> | null>(null);

  /**
   * 用途：保存最新 profileData，供 storage onChanged 回调读取。
   * 说明：
   * - chrome.storage.onChanged 的回调会长期存在，直接闭包读取 profileData 容易取到旧值。
   */
  const profileDataRef = useRef<Awaited<ReturnType<typeof initGrowthUserProfileData>> | null>(null);

  /**
   * 用途：节流 followerStats 请求，避免每次 storage 变更都打后端。
   */
  const lastFollowerStatsFetchAtRef = useRef<number>(0);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSettings, setCustomSettings] = useState<GrowthSafetySettingsUiState>({
    requestInterval: 6,
    failurePause: 600,
    randomRange: 4
  });

  const matchedPresetLevel = useMemo(() => {
    const preset = safetyPresets.find((p) => {
      return p.settings.requestInterval === customSettings.requestInterval && p.settings.failurePause === customSettings.failurePause;
    });

    return preset?.level || "custom";
  }, [customSettings.failurePause, customSettings.requestInterval]);

  /**
   * 用途：从 storage 加载安全设置并更新到 UI state。
   * 返回值：Promise<void>
   */
  const loadSafetySettings = async (): Promise<void> => {
    const saved = await getStorage(storageName.safetySettingsStorageName);
    if (saved && typeof saved === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s: any = saved;
      setCustomSettings({
        requestInterval: Number(s.requestInterval?.value || 6),
        failurePause: Number(s.failedPauseInterval?.value || 600),
        randomRange: Number(s.requestRandomRange?.value || 4)
      });
    }
  };

  /**
   * 用途：保存安全设置。
   * 返回值：Promise<void>
   */
  const saveSafetySettings = async (): Promise<void> => {
    const from = matchedPresetLevel === "custom" ? "user" : "system";
    const data = {
      requestInterval: { value: String(customSettings.requestInterval), from },
      failedPauseInterval: { value: String(customSettings.failurePause), from },
      requestRandomRange: { value: String(customSettings.randomRange), from }
    };
    await setStorage(storageName.safetySettingsStorageName, data);
  };

  /**
   * 用途：处理预设切换。
   * 参数：
   * - level：string
   * 返回值：void
   */
  const handlePresetChange = (level: string): void => {
    const preset = safetyPresets.find((p) => p.level === level);
    if (preset) {
      setCustomSettings((prev) => ({
        ...prev,
        requestInterval: preset.settings.requestInterval,
        failurePause: preset.settings.failurePause
      }));
    }
  };

  /**
   * 用途：增量更新自定义设置（UI 层传入 patch）。
   */
  const patchCustomSettings = (patch: Partial<GrowthSafetySettingsUiState>): void => {
    setCustomSettings((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    loadSafetySettings();
  }, []);

  useEffect(() => {
    growthTaskRunner.start();
    return () => {
      growthTaskRunner.stop();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const data = await initGrowthUserProfileData(setIsLoading);
      setProfileData(data);
    };
    init();
  }, []);

  useEffect(() => {
    profileDataRef.current = profileData;
  }, [profileData]);

  useEffect(() => {
    /**
     * 用途：监听自动关注成功后的统计写入，并刷新 UserProfile。
     * 说明：
     * - 今日已用：来自 autoFollowSuccessDaily
     * - 近 7 天新增关注：来自 autoFollowSuccessRecords
     *
     * 注意：
     * - 这里使用 chrome.storage.onChanged，与写入端（@plasmohq/storage -> chrome.storage）保持一致，避免 polyfill 在某些上下文下不触发。
     */
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "local") return;

      const dailyChange = changes?.[storageName.autoFollowSuccessDailyStorageName];
      if (dailyChange) {
        // 不依赖 onChanged 的 newValue 结构（不同上下文/封装可能不一致），直接从 storage 读取最新值
        void (async () => {
          const nextDaily = await getAutoFollowSuccessDailyCounter();
          setProfileData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              todayActionsUsed: typeof nextDaily.count === "number" ? nextDaily.count : 0
            };
          });
        })();
      }

      const recordsChange = changes?.[storageName.autoFollowSuccessRecordsStorageName];
      if (recordsChange) {
        // 直接从 storage 读取最新 InsUserInfo，避免暂停/恢复后 profileDataRef 尚未就绪导致 userId 为空
        void (async () => {
          const ins = await getOrCreateInsUserInfo();
          const operatorUserId = ins?.userId || "";
          if (!operatorUserId) return;

          const next7d = await getFollowingGrowth7d(operatorUserId);
          const nextTotalFollowing = await getTotalFollowingDistinctAllTime(operatorUserId);

          setProfileData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              following: nextTotalFollowing,
              followingGrowth7d: next7d
            };
          });

          // 节流刷新粉丝统计（后端）
          const now = Date.now();
          const minIntervalMs = 8000;
          if (now - lastFollowerStatsFetchAtRef.current < minIntervalMs) return;
          lastFollowerStatsFetchAtRef.current = now;

          try {
            const statsRtn = await Fetcher.followerStats(operatorUserId);
            const s = statsRtn?.data || statsRtn;
            const totalFollowerCount = Number(s?.totalFollowerCount || 0);
            const last7DaysNewFollowerCount = Number(s?.last7DaysNewFollowerCount || 0);
            setProfileData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                followers: totalFollowerCount,
                followersGrowth7d: last7DaysNewFollowerCount
              };
            });
          } catch {
            // swallow
          }
        })();
      }
    };

    chrome.storage.onChanged.addListener(handler);
    return () => {
      chrome.storage.onChanged.removeListener(handler);
    };
  }, []);

  return {
    state: {
      isLoading,
      profileData,
      showAdvanced,
      customSettings,
      matchedPresetLevel
    },
    actions: {
      setShowAdvanced,
      patchCustomSettings,
      handlePresetChange,
      saveSafetySettings
    }
  };
}
