import { BrowserType} from '../modles/extension';
import type { InsMembershipTier, InsUserInfo, UserInfo} from '../modles/extension';
import { Storage } from "@plasmohq/storage"
import defaultAvator from "data-base64:@/assets/images/defaultAvator.png"
import {storageName} from '~utils/consts'

const storage = new Storage({area: "local"})

const USER_KEY = "ExtUserInfo";
const INS_USER_KEY = "InsUserInfo";

/**
 * Sleep
 * @param ms How long the program should pause
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if the string is a valid url
 * @param urlString The string that should be checked
 */
export function validURL(urlString: string): boolean {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    return pattern.test(urlString);
}

export const shortcodeToDateString = (shortcode: string): string =>
    instaIDToTimestamp(
        shortcodeToInstaID(shortcode),
    );

export const shortcodeToInstaID = (shortcode: string): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    let mediaID = BigInt(0);
    for (const letter of shortcode) {
        mediaID = (mediaID * BigInt(64)) + BigInt(alphabet.charCodeAt(parseInt(letter, 0)));
    }

    return mediaID.toString();
};

export const instaIDToTimestamp = (id: string) => {
    const timestamp = (Number(id) / Math.pow(2, 23)) + 1314220021721;

    return new Date(timestamp).toLocaleString();
};


export function getCompatibleFilename(filename: string, max: number): string {
    filename = filename.split('\n')[0];
    // Replace non a-z, 0-9, and space characters with a space
    let filtered = filename.replace(/[^a-z0-9 ]/gi, ' ');
    // Replace multiple consecutive spaces with one space
    let cleaned = filtered.replace(/\s+/g, ' ');
    // Remove spaces at the beginning and end
    return cleaned.trim().substring(0, max);
}

export function getBrowserType(): BrowserType {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Edg")) {
        return BrowserType.Edge;
    } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
        return BrowserType.Opera;
    } else if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) {
        return BrowserType.Chrome;
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium")) {
        return BrowserType.Safari;
    } else if (userAgent.includes("Firefox")) {
        return BrowserType.Firefox;
    } else {
        return BrowserType.Unknown;
    }
}

/**
 * retrive the userInfo
 * first,try to get the userInfo in the cache if exist
 * second, if there is no userInfo in the cache, then :
 * 1. try to get the identifid from chrome, means  chrome.runtime.id
 * 2. if not, use generated userInfo by UUID
 * 
 * finally put the userInfo into the cache and retrive the value
 * 
 * @returns userInfo
 */
export async function getOrCreateUserInfo(): Promise<UserInfo> {
    //try to get the clientID from chrome cache

    let userInfo: UserInfo = await storage.get<UserInfo>(USER_KEY);

    if (userInfo == null || userInfo.userId == null || userInfo.userId == "") {
        let userId;
        //try to get the identifid from chrome, means  chrome.runtime.id
        if (chrome && chrome.runtime && !chrome.runtime.id) {
            userId = chrome.runtime.id;
        } else {
            //if there id no chrome.runtime.id, use generated UUID
            userId = generateUUID();
        }
        userInfo = {};
        userInfo.userId = userId;
        userInfo.memberName = 'free';

        await storage.set(USER_KEY, userInfo);
        return userInfo;
    }
    else {
        return userInfo;
    }
}

export async function setUserInfo(userInfo: UserInfo) {
    await storage.set(USER_KEY, userInfo);
}

export async function getOrCreateInsUserInfo(): Promise<InsUserInfo> {
    let insUserInfo: InsUserInfo = await storage.get<InsUserInfo>(INS_USER_KEY);
    if (insUserInfo == null) {
        insUserInfo = {};
        insUserInfo.userId = '';
        insUserInfo.email = '';
        insUserInfo.account = '';
        insUserInfo.fullName = '';
        insUserInfo.avatar = defaultAvator;
        insUserInfo.isLogin = false;
		insUserInfo.updateTime = Date.now(); 
        await storage.set(INS_USER_KEY, insUserInfo);
        return insUserInfo;
    }
    else {
        return insUserInfo;
    }
}

export async function setInsUserInfo(insUserInfo: InsUserInfo) {
    await storage.set(INS_USER_KEY, insUserInfo);
}

/**
* generate UUID
* @returns UUID
*/
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function isUrlInDomains(tabUrl) {
    let webSiteUrl = process.env.WEBSITE_URL.split(',');
    return webSiteUrl.some(domain => tabUrl.includes(domain));
}

export async function logOut(){
    const userInfo = await getOrCreateUserInfo();
    userInfo.email=null;
    userInfo.name=null;
    userInfo.picture=null;
    userInfo.googleToken=null;
    userInfo.token=null;
    userInfo.memberName=null;
    userInfo.expiredTime=null;
    await setUserInfo(userInfo);
}

export async function setStorage(key: string, value: any){
	await storage.set(key, value);
}

export async function getStorage(key: string){
	return await storage.get<any>(key);
}

export async function removeStorage(key: string){
	return await storage.remove(key);
}

export function getCurrentDate(format: string = 'MM/DD/YYYY'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hours12 = hours24 % 12 || 12; // 0 → 12, 13 → 1, etc.
  const period = hours24 >= 12 ? 'PM' : 'AM';

  const pad = (num: number): string => num.toString().padStart(2, '0');

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/MM/g, pad(month))
    .replace(/M/g, month.toString())
    .replace(/DD/g, pad(day))
    .replace(/D/g, day.toString())
    .replace(/hh/g, pad(hours12))
    .replace(/h/g, hours12.toString())
    .replace(/HH/g, pad(hours24))
    .replace(/H/g, hours24.toString())
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, seconds.toString())
    .replace(/A/g, period)
    .replace(/a/g, period.toLowerCase());
}

export function getDateByOffset(daysOffset: number = 0, format: string = 'MM/DD/YYYY'): string {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysOffset);

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 0-11 → 1-12
  const day = targetDate.getDate();
  const hours24 = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  const seconds = targetDate.getSeconds();

  const hours12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? 'PM' : 'AM';

  const pad = (num: number): string => num.toString().padStart(2, '0');

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/MM/g, pad(month))
    .replace(/M/g, month.toString())
    .replace(/DD/g, pad(day))
    .replace(/D/g, day.toString())
    .replace(/hh/g, pad(hours12))
    .replace(/h/g, hours12.toString())
    .replace(/HH/g, pad(hours24))
    .replace(/H/g, hours24.toString())
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, seconds.toString())
    .replace(/A/g, period)
    .replace(/a/g, period.toLowerCase());
}

export async function checkIsNeedRefreshInsProfile(){
	let needRefresh = true;
	const appConfig = await getStorage(storageName.appConfigStorageName)|| {};
	const refreshProfileInterval = appConfig['refreshProfileInterval'] || 120;
	const insUserInfo: InsUserInfo = await getOrCreateInsUserInfo();
	if(insUserInfo && insUserInfo.userId!=null && insUserInfo.userId!='' && insUserInfo.updateTime){
		needRefresh = parseInt(refreshProfileInterval)*60*1000<=(Date.now() - insUserInfo.updateTime);
	}
	return needRefresh;
}

export async function checkIsNeedRefreshPost(refreshAt:number){
	if(refreshAt){
		const appConfig = await getStorage(storageName.appConfigStorageName)|| {};
		const refreshPostInterval = appConfig['refreshPostInterval'] || 300;
		const needRefresh = parseInt(refreshPostInterval)*60*1000<=(Date.now() - refreshAt);
		return needRefresh;
	}else{
		return true;
	}
}

export async function covertUserInfoToExt(storageAppUserInfo: any,userInfo: any){
	let memberName : InsMembershipTier = 'free';
	if(userInfo.memberInfo&&userInfo.memberInfo.memberName!='Guest'){
		memberName = userInfo.memberInfo.memberName;
	}
	try{
		if(userInfo.memberInfo&&userInfo.memberInfo.extInfo){
			const extData = JSON.parse(userInfo.memberInfo.extInfo);
			storageAppUserInfo.dayLimit = extData['dayLimit'];
		}
	}catch(e){
		console.log(e);
	}
	storageAppUserInfo.userId = userInfo.userId;
	storageAppUserInfo.email = userInfo.email;
	storageAppUserInfo.name = userInfo.userName;
	storageAppUserInfo.picture = userInfo.avatar;
	storageAppUserInfo.token = userInfo.token;
	storageAppUserInfo.memberName = memberName;
}