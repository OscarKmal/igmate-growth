import {Crown} from "lucide-react";

export interface LoginOrRegisterInfo {
    email: string;
    password?: string;
    emailCode?: string;
}

export interface NoticeMessage {
    title:string;
    text: string;
    mainText:string;
    mainAction?: string;
    mainUrl:string;
    subText:string;
    subUrl:string;
    type?: NoticeType;
}

export enum NoticeType
{
    goSubscribe,
    pureNotice,
    drmLicense,
    retryMessage,
    serverError
}

export enum BrowserType {
    Edge,
    Chrome,
    Firefox,
    Opera,
    Safari,
    Unknown
}

export enum LoggingLevel {
    default = 'log',
    warn = 'warn',
    error = 'error',
}

export interface UserInfo {
    userId?: string;
    email?: string;
    name?: string;
    picture?: string;
    googleToken?: string;
    token?: string;
    memberName?: InsMembershipTier;
    expiredTime?: Date;
    loginTime?: number;
    insUser?: InsUserInfo;
	dayLimit?: number;
}

export interface InsUserInfo {
    userId?: string;
    email?: string;
    account?: string;
    fullName?: string;
    avatar?: string;
    isLogin?: boolean;
	updateTime?: number;
}

export interface MemberInfo {
    id?: number;
    levelId?: number;
    memberId?: number;
    memberName?: string;
    expiredTime?: Date;
    perday?:string;
    unfollowedCount?:number;
}

export enum  UserAction{
    install="install",
    uninstall="uninstall",
    changeUrl="changeUrl",
    register="register",
    login="login",
    googleLogin="googleLogin",
    sendEmailCode="sendEmailCode"
}


export interface AppInfo {
    version?: string,
    appId?: string,
    baseUrl?: string,
    webUrl?: string,
	baseUrls?: string[],
}

export type InsMembershipTier = "free" | "premium";

export interface MembershipFeature {
    text: string;
    available: boolean;
}
  
export interface MembershipPlan {
    tier: InsMembershipTier;
    name: string;
    icon: typeof Crown;
    badgeColor: string;
    gradientFrom: string;
    gradientTo: string;
    features: MembershipFeature[];
}
  
export type levelType = 'safe' | 'balanced' | 'fast';

export interface SafetyPreset {
    name: string;
    level: levelType;
    icon: typeof Crown;
    color: string;
    description: string;
    settings: {
        requestInterval: number;
        batchSize: number;
        batchPause: number;
        failurePause: number;
    };
}

export type msgType = 'loggedIn' | 'logOut';
