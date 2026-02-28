import browser from 'webextension-polyfill';
import {InsRequestUtils} from '~utils/InsRequestUtils';
import { getStorage, setStorage, sleep} from '~utils/functions';
import type { postType, PostComment } from '~modles/extension';
import {selectedFieldsConsts, storageName} from '~utils/consts';
import {Fetcher} from '~utils/Fetcher';
import { appInfo } from './AppInfo';
import { sendToBackground } from "@plasmohq/messaging";
import {shareStyles, justice, witty, efficency, zen} from '~components/share/shareTpl';

export const queryHash = {
	"comments": "33ba35852cb50da46f5b5e889df7d159",
	"follower": "7dd9a7e2160524fd85f50317462cff9f",
	"following": '3dec7e2c57367ef3da3d987d89f9dbc8'
}

export const onOpenFeedback = ()=>{
	browser.tabs.create({ 
		url: browser.runtime.getURL('tabs/feedback.html') 
	});
}

export const openSupport = async() => {
	let email = process.env.PLASMO_PUBLIC_SUPPORT_EMAIL;
	const appConfigData = await getStorage(storageName.appConfigStorageName)||{};
	if(appConfigData.supportEmail){
		email = appConfigData.supportEmail;
	}
	const subject = t('support_subject');
	const body    = t('support_body');

	const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}
&su=${encodeURIComponent(subject)}
&body=${encodeURIComponent(body)}`.replace(/\n/g, "");

	browser.tabs.create({ url: gmailUrl }).catch(() => {
		const mailtoUrl =
		  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
		browser.tabs.create({ url: mailtoUrl });
	});
};


export const jumpToInsLogin = () => {
  browser.tabs.create({ 
    url: 'https://www.instagram.com/accounts/login/' 
  });
}

export const jumpLogin = ()=>{
	browser.tabs.create({
	  url: process.env.PLASMO_PUBLIC_BASE_WEB_HOST+'login'
	});
}

export const openPricePage = ()=>{
	browser.tabs.create({
	  url: process.env.PLASMO_PUBLIC_BASE_WEB_HOST+'pricing/'+appInfo.appId
	});
}

export const handleRateOnChromeStore = async(selectedRating: number)=>{
	await Fetcher.saveRating(selectedRating);
	if (process.env.PLASMO_TARGET === "chrome-mv3") {
		window.open('https://chromewebstore.google.com/detail/'+browser.runtime.id, '_blank');
	}else if (process.env.PLASMO_TARGET === "edge-mv3") {
		window.open('https://microsoftedge.microsoft.com/addons/detail/'+browser.runtime.id, '_blank');
	}
}

export const logout = async()=>{
	await sendToBackground({
		name: "webMsg",
		body: {
			type: 'logout',
			data: {}
		}
	})
}

export const onOpenTab = async(postId: string="", type: string="", postUrl: string="") => {
	const params = new URLSearchParams();
	if (postId) params.set("postId", postId);
	if (type) params.set("type", type);
	if (postUrl) params.set("postUrl", postUrl);
	
	const baseUrl = browser.runtime.getURL('tabs/growth.html');
	const targetUrl = baseUrl + (params.toString() ? `?${params.toString()}` : "");
	const tabs = await browser.tabs.query({});
	
	const existedTab = tabs.find((tab: any) => {
		if (!tab.url) return false;
		try {
			const url = new URL(tab.url);
			return url.origin === new URL(baseUrl).origin &&
				   url.pathname === '/tabs/growth.html';
		} catch {
			return false;
		}
	});
	
	if (existedTab) {
		await browser.tabs.update(existedTab.id!, {
			url: targetUrl,
			active: true
		});
		await browser.windows.update(existedTab.windowId!, { focused: true });
		return;
	}
	await browser.tabs.create({ 
		url: targetUrl
	});
};

export const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
};

// Format time in seconds to readable string
export const formatTime = (seconds: number): string => {
	const totalSeconds = Math.round(seconds);
	if (totalSeconds < 60) {
		return `${totalSeconds}s`;
	} else if (totalSeconds < 3600) {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins}m ${secs}s`;
	} else {
		const hours = Math.floor(totalSeconds / 3600);
		const mins = Math.floor((totalSeconds % 3600) / 60);
		return `${hours}h ${mins}m`;
	}
};

export const formatRelativeDate = (t?: number | string) => {
	if (!t) return "-";
	const date = new Date(t);
	const now = new Date();
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const diffDays = (n.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
	if (diffDays === 0) return "today";
	if (diffDays === 1) return "yesterday";
	return date.toISOString().slice(0, 10);
};

export function convertToComment(comment: any){
	let postComment: PostComment[] = [];
	for(const item of comment){
		postComment.push({
			id: item.id,
			userId: item.owner.id,
			username: item.owner.username,
			avatar: item.owner.profile_pic_url,
			commentText: item.text,
			publishedAt: item.created_at,
		});
	}
	return postComment;
}

export function isToday(time: number) {
  const d = new Date(time)
  const today = new Date()

  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate()
}

export function isCurrentMonth(time: number) {
  const d = new Date(time)
  const today = new Date()

  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
}

export function isOverOneMonth(ts: number) {
	const now = Date.now()
	const oneMonth = 30 * 24 * 60 * 60 * 1000
	return (now - ts) > oneMonth
}

function isWithinOneMonth(ts: number) {
	const d1 = new Date(ts)
	const d2 = new Date()
	d2.setMonth(d2.getMonth() - 1)
	return d1 >= d2
}

export const checkIsShowRating = async()=>{
	let showRating = true;
	try{
		const hasFiveRating = await Fetcher.checkFiveRating();
		if(hasFiveRating.code==200&&hasFiveRating.data){
			showRating = false;
		}else{
			const viewRatingTime = await getStorage(storageName.viewRatingTimeStorageName);
			if(viewRatingTime&&isWithinOneMonth(viewRatingTime)){
				showRating = false;
			}
		}
	}catch(e){
		console.log(e);
	}
	return showRating;
}

export function t(key: string, vars?: Record<string, string | number>) {
	let msg = browser.i18n.getMessage(key) || "";
	if (vars) {
		Object.keys(vars).forEach((k) => {
			const re = new RegExp(`\\{${k}\\}`, "g");
			msg = msg.replace(re, String(vars[k]));
		});
	}
	return msg;
}

export async function getShareTemplates(){
	const shareTemplates = await getStorage(storageName.shareTemplateStorageName);
	if(shareTemplates == null){
		return {tplSvg: [justice, witty, efficency, zen], shareStyles};
	}else{
		const tplSvg = {};
		const shareStyles = [];
		shareTemplates.forEach((item: any)=>{
			const styles = item.tplDesc?JSON.parse(item.tplDesc):{};
			shareStyles.push(styles);
			const tplId = styles.id;
			tplSvg[tplId]= item.tplContent||'';
		});
		
		return {tplSvg, shareStyles};
	}
}

export const downloadSvgAsPng = async (
	svgString: string,
	fileName = "image.png",
	scale = 2
) => {
	return new Promise<void>((resolve) => {
		const svgWithSize = svgString.replace(
			"<svg",
			`<svg width="800" height="450"`
		);

		const svgBlob = new Blob([svgWithSize], { type: "image/svg+xml" });
		const url = URL.createObjectURL(svgBlob);

		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width * scale;
			canvas.height = img.height * scale;
			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			canvas.toBlob((blob) => {
				const pngUrl = URL.createObjectURL(blob!);
				const a = document.createElement("a");
				a.href = pngUrl;
				a.download = fileName;
				a.click();
				URL.revokeObjectURL(pngUrl);
				URL.revokeObjectURL(url);
				resolve();
			}, "image/png");
		};

		img.src = url;
	});
};

export const randomInt = (max: number)=> {
	return Math.floor(Math.random() * (max + 1))
}

const getSettingTime = async()=>{
	const settings = {
		requestInterval: 4000,
		failedPauseInterval: 120000,
		requestRandomRange: 4000
	};
	try{
		const saftySetting = await getStorage(storageName.safetySettingsStorageName);
		if(saftySetting){
			settings.requestInterval = parseInt(saftySetting.requestInterval.value)*1000;
			settings.failedPauseInterval = parseInt(saftySetting.failedPauseInterval.value)*1000;
			settings.requestRandomRange = parseInt(saftySetting.requestRandomRange.value)*1000;
		}
	}catch(e){
		console.log(e);
	}
	return settings;
}

const getSleepTime = async(flag: boolean)=>{
	const settings = await getSettingTime();
	if(flag){
		return settings.requestInterval+randomInt(settings.requestRandomRange);
	}else{
		return settings.failedPauseInterval+randomInt(settings.requestRandomRange); 
	}
}

export const validateUrl = (url: string, callback: Function) => {
	if (!url?.trim()) {
		callback?.(t('pop_validate_tip1'), false);
		return false;
	}
	try {
	    const parsedUrl = new URL(url.trim());
	    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
			callback?.(t('pop_validate_tip2'), false);
			return false;
	    }
	    const hostname = parsedUrl.hostname.toLowerCase();
	    if (hostname !== 'instagram.com' && hostname !== 'www.instagram.com') {
			callback?.(t('pop_validate_tip2'), false);
			return false;
	    }
	    const path = parsedUrl.pathname;
	    const instagramPathPattern = /^\/(?:[A-Za-z0-9._]+\/)?(p|reel|reels)\/[A-Za-z0-9_-]+\/?$/;
	    if (!instagramPathPattern.test(path)) {
			callback?.(t('pop_validate_tip2'), false);
			return false;
	    }
	    callback?.('', true);
	    return true;
	} catch (error) {
	    callback?.(t('pop_validate_tip2'), false);
	    return false;
	}
};

export async function getMediaIdFromPostUrl(mediaUrl: string) {
    let mediaId = '';
	try {
        const res = await fetch(mediaUrl, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const htmlText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const metaTag = doc.querySelector('meta[property="al:ios:url"]');
        if (!metaTag) throw new Error("Meta tag not found");
        const content = metaTag.getAttribute("content");
        mediaId = content.split("=")[1];
    } catch (err) {
        console.log(err);
    }
	return mediaId;
}

export function parseInstagramUrl(url: string) {
	try {
	    const parsed = new URL(url.trim());
	    const hostname = parsed.hostname.toLowerCase();
	    if (hostname !== 'instagram.com' && hostname !== 'www.instagram.com') {
	      return null;
	    }
	    const path = parsed.pathname;
	    const match = path.match(/^\/(?:[A-Za-z0-9._]+\/)?(p|reel|reels)\/([A-Za-z0-9_-]+)(?:\/.*)?$/i);
	    if (!match) {
			return null;
	    }
	    const [, typePart, shortCode] = match;
	    const type: postType = typePart.toLowerCase() === 'p' ? 'post' : 'reels';
	    return { type, shortCode };
	} catch {
	    return null;
	}
}

export const initSelectedFields = async()=>{
	const exportFields = await getStorage(storageName.exportFieldsStorageName);
	if(exportFields){
		type SelectedFields = typeof selectedFieldsConsts;
		const result = Object.fromEntries(
			(Object.keys(selectedFieldsConsts) as Array<keyof SelectedFields>).map(key => [
			    key,
			    exportFields.includes(key)
			])
		) as SelectedFields;
		return {fields: result, hasExtended: checkHasExtendedFields(result)};
	}else{
		return {fields: selectedFieldsConsts, hasExtended: false};
	}
}

export const checkHasExtendedFields = (result: any)=>{
	const hasExtendedFields =
		result.email ||
		result.phone ||
		result.followersCount ||
		result.followingCount ||
		result.postsCount;
	return hasExtendedFields;
}


export const saveHisData = async(hisData: any)=>{
	const hisDatas = await getStorage(storageName.downloadPostHistoryStorageName)||[];
	const index = hisDatas.findIndex((item: any) => item.id === hisData.id);
	if (index > -1) {
		hisDatas[index] = {
			...hisDatas[index],
			...hisData
		};
	} else {
	    hisDatas.unshift(hisData);
	}
	await setStorage(storageName.downloadPostHistoryStorageName, hisDatas);
}

export const removeHisData = async(hisData: any)=>{
	const hisDatas = await getStorage(storageName.downloadPostHistoryStorageName)||[];
	const index = hisDatas.findIndex((item: any) => item.id === hisData.id);
	if (index > -1) {
		hisDatas.splice(index, 1); 
		await setStorage(storageName.downloadPostHistoryStorageName, hisDatas);
	}
}

export const calculateSaveTime = async(postId: string)=>{
	const hisDatas = await getStorage(storageName.downloadPostHistoryStorageName)||[];
	const curPost = hisDatas.find((item: any) => item.id === postId);
	if(curPost){
		const startTime = curPost.downloadedAt;
		let endTime = curPost.downloadedEnd;
		if(startTime){
			if(!endTime){
				endTime = Date.now();
			}
			return (endTime - startTime)/1000;
		}else{
			return 0;
		}
	}else{
		return 0;
	}
}
