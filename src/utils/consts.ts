import type { SafetyPreset, downloadStatus} from '~modles/extension'
import {  Settings, Shield, Zap, CheckCircle, PlayCircle, PauseCircle, Download } from 'lucide-react';

export const safetyPresets: SafetyPreset[] = [
    {
      name: 'Safe',
      level: 'safe',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      description: 'Maximum safety, slowest speed',
      settings: {
        requestInterval: 10,
        batchSize: 0, // Not used anymore
        batchPause: 0, // Not used anymore
        failurePause: 900,
      },
    },
    {
      name: 'Balanced',
      level: 'balanced',
      icon: Settings,
      color: 'from-blue-500 to-cyan-500',
      description: 'Recommended for most users',
      settings: {
        requestInterval: 6,
        batchSize: 0, // Not used anymore
        batchPause: 0, // Not used anymore
        failurePause: 600,
      },
    },
    {
      name: 'Fast',
      level: 'fast',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      description: 'Faster but higher risk',
      settings: {
        requestInterval: 4,
        batchSize: 0, // Not used anymore
        batchPause: 0, // Not used anymore
        failurePause: 300,
      },
    },
];

export const getStatusColor = (status: downloadStatus) => {
    switch (status) {
		case "completed":
			return "text-green-600 bg-green-50 border-green-200";
		case "in-progress":
			return "text-blue-600 bg-blue-50 border-blue-200";
		case "paused":
			return "text-orange-600 bg-orange-50 border-orange-200";
		case "failed":
			return "text-red-600 bg-red-50 border-red-200";
    }
};

export const getStatusIcon = (status: downloadStatus) : typeof CheckCircle => {
    switch (status) {
		case "completed":
			return CheckCircle;
		case "in-progress":
			return PlayCircle;
		case "paused":
			return PlayCircle;
		case "failed":
			return Download;
    }
};

export const storageName = {
	//App configuration storage name
	appConfigStorageName: "appConfig",
	//Safety Settings Configuration Name
	safetySettingsStorageName: "safetySettings",
	//Successful export comments
	successExportCommentDataStorageName: "successExportCommentData",
	//Advanced Settings
	advanceSettingStorageName: "advanceSetting",
	//Reviewed the rating component time
	viewRatingTimeStorageName: "viewRatingTime",
	//shareTemplate
	shareTemplateStorageName: "shareTemplate",
	//PostInfo
	postInfoStorageName: "postInfo",
	//history post download records
	downloadPostHistoryStorageName: "downloadPostHistory",
	//post comments
	postCommentsStorageName: "postComments",
	//exportFields
	exportFieldsStorageName: "exportFields",
	//has open pop
	hasOpenPopStorageName: "hasOpenPop",
	//estimated time
	estimatedTimeStorageName: "estimatedTime",
}

export const selectedFieldsConsts = {
	// Basic fields (always fast)
	commentId: true,
	userId: true,
	userName: true,
	fullName: true,
	avatar: true,
	profileUrl: true,
	commentText: true,
	publishedDate: true,
	// Extended fields (slow - requires extra API calls)
	email: false,
	phone: false,
	followersCount: false,
	followingCount: false,
	postsCount: false
}

export const defaultFreeUserDailyLimit = parseInt(process.env.PLASMO_PUBLIC_FREE_USER_DAILY_LIMIT);
