import browser, { Runtime } from 'webextension-polyfill';
import OnInstalledDetailsType = Runtime.OnInstalledDetailsType;
import { Fetcher } from "../utils/Fetcher";
import { UserAction } from '../modles/extension';
import type { UserInfo } from '../modles/extension';
import { getOrCreateUserInfo,getOrCreateInsUserInfo, setStorage, getStorage } from '../utils/functions';
import { appInfo } from '~utils/AppInfo';
import { API_URLS } from '~utils/ApiUrls';
import {storageName} from '~utils/consts';

browser.runtime.onInstalled.addListener(async (reason: OnInstalledDetailsType) => {
	let userInfo: UserInfo = await getOrCreateUserInfo();
	await getOrCreateInsUserInfo();
	const configResult = await Fetcher.getConfig();
	let configData = {};
	if(configResult!=null&&configResult.code == 200 && configResult.data){
		configData = configResult.data;
	}
    let configJsonData = {};
    if(configData && configData != '' && configData['appConfig']){
         configJsonData = JSON.parse(configData['appConfig'].toString());
    }
	if (reason.reason == 'install') {
		//First register the user, then record the user's registration behavior, and finally jump to the guide page after successful installation          
		Fetcher.userReg(UserAction.install, null, async () => {await Fetcher.logAction(UserAction.install, null, null, () => {
			if(configJsonData && configJsonData['installPage']){
				browser.tabs.create({ url: configJsonData['installPage'] + '?userId=' + userInfo.userId + '&version=' + appInfo.version + '&appId=' + appInfo.appId });
			}else{
				browser.tabs.create({ url: appInfo.baseUrl + API_URLS.userInstallGuide + '?userId=' + userInfo.userId + '&version=' + appInfo.version + '&appId=' + appInfo.appId });
			}
		})});
	}

	if(configJsonData && configJsonData['uninstallUrl']){
		browser.runtime.setUninstallURL(configJsonData['uninstallUrl']+'?userId=' + userInfo.userId + '&version=' + appInfo.version + '&appId=' + appInfo.appId );
	}else{
		browser.runtime.setUninstallURL(appInfo.baseUrl + API_URLS.userUnInstallGuide + '?userId=' + userInfo.userId + '&version=' + appInfo.version + '&appId=' + appInfo.appId );
	}
	
	await setAppConfig(configData);
	await getShareTemplate();
});


const setUninstallUrl = async(configData: any)=>{
	//Dynamically obtain uninstallation URL
	let configJsonData = {};
	if(configData && configData != '' && configData['appConfig']){
		configJsonData = JSON.parse(configData['appConfig'].toString());
	}
	if(configJsonData && configJsonData['uninstallUrl']){
		let userInfo: UserInfo = await getOrCreateUserInfo();
		browser.runtime.setUninstallURL(configJsonData['uninstallUrl']+'?userId=' + userInfo.userId + '&version=' + appInfo.version + '&appId=' + appInfo.appId);
	}
}

const setAppConfig = async(configData: any)=>{
	let configJsonData = {};
	if(configData && configData != '' && configData['appConfig']){
		configJsonData = JSON.parse(configData['appConfig'].toString());
		await setStorage(storageName.appConfigStorageName, configJsonData);
		
		//setting Safety Settings
		let safetySettingData = await getStorage(storageName.safetySettingsStorageName);
		const variableSetting = ['requestInterval', 'failedPauseInterval', 'requestRandomRange'];
		if(safetySettingData){
			for(const key in safetySettingData){
				if(safetySettingData[key]['from']!='user'){
					safetySettingData[key]['value'] = configJsonData[key];
				}
			}
			for (const key of variableSetting) {
			    if (!(key in safetySettingData)) {
					safetySettingData[key] = {
						value: configJsonData[key],
						from: 'system'
					};
			    }
			}
		}else{
			safetySettingData = {};
			for (const key of variableSetting) {
				safetySettingData[key] = {
					value: configJsonData[key],
					from: 'system'
				};
			}
		}
		await setStorage(storageName.safetySettingsStorageName, safetySettingData);
	}
}

const getShareTemplate = async()=>{
	const shareTemplateData = await Fetcher.getShareTemplateList();
	if(shareTemplateData!=null&&shareTemplateData.code==200&&shareTemplateData.data&&shareTemplateData.data.length>0){
		await setStorage(storageName.shareTemplateStorageName, shareTemplateData.data);
	}
}

browser.alarms.create('getConfig', { periodInMinutes: parseInt(process.env.PLASMO_PUBLIC_CONFIG_ALARM_TIME) });
browser.alarms.onAlarm.addListener(async (alarm: any) => {
	if (alarm.name === 'getConfig') {
		const configResult = await Fetcher.getConfig();
		if(configResult&&configResult.code==200){
			await setUninstallUrl(configResult.data);
			await setAppConfig(configResult.data);
		}
		await getShareTemplate();
	}
});
