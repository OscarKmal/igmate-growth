import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getOrCreateUserInfo, setUserInfo, covertUserInfoToExt, getStorage, setStorage, removeStorage } from "~utils/functions";
import { Fetcher } from "~utils/Fetcher";
import browser from 'webextension-polyfill';
import { safetyPresets, storageName } from '~utils/consts';

const loggedIn = async(data: any)=>{
	const idToken = await getStorage("idToken");
	const userInfo = await getOrCreateUserInfo();
	if(idToken!=data.token||userInfo.token==null){
		await setStorage("idToken", data.token);
		const rtnData = await Fetcher.extensionLogin(data.token);
		if(rtnData&&rtnData.code==200){
			const userData = rtnData.data;
			if(userData.success){
				const data = userData.data;
				const appUserInfo = await getOrCreateUserInfo();
				covertUserInfoToExt(appUserInfo, data);
				await setUserInfo(appUserInfo);
				try{
					await browser.runtime.sendMessage({ type: "userLoggedIn" });
				}catch(e){
				}
			}
		}
	}
}

const logOut = async()=>{
	const userInfo = await getOrCreateUserInfo();
	if(userInfo.token){
		const rtnData = await Fetcher.extensionLogout();
		if(rtnData&&rtnData.code==200){
			const appUserInfo = await getOrCreateUserInfo();
			appUserInfo.email = null;
			appUserInfo.memberName = 'free';
			appUserInfo.token = null;
			appUserInfo.name = null;
			appUserInfo.picture = null;
			await setUserInfo(appUserInfo);
			await removeStorage("idToken");
			try{
				await browser.runtime.sendMessage({ type: "userLogout" });
			}catch(e){
			}
		}
	}
}

const installConfig = async(data: any)=>{
	const rateSetting = data.rateSetting;
	const safety = safetyPresets.find(safetyPreset=>safetyPreset.level==rateSetting);
	if(safety){
		let safetySettingData = await getStorage(storageName.safetySettingsStorageName)||{};
		safetySettingData['requestInterval']['from'] = 'user';
		safetySettingData['requestInterval']['value'] = safety.settings.requestInterval;
		safetySettingData['failedPauseInterval']['from'] = 'user';
		safetySettingData['failedPauseInterval']['value'] = safety.settings.failurePause;
		await setStorage(storageName.safetySettingsStorageName, safetySettingData);
	}
	const downloadFields = data.downloadFields;
	if(downloadFields){
		await setStorage(storageName.exportFieldsStorageName, downloadFields);
	}
}

const getExtensionSetting = async()=>{
	const userSettings = await browser.action.getUserSettings();
	return userSettings;
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    try{
		const { type, data } = req.body;
		console.log(type, data);
		if(type == 'login'){
			await loggedIn(data);
			return res.send({success: true})
		}else if(type == 'logout'){
			await logOut();
			return res.send({success: true})
		}else if(type == 'commentInstallConfig'){
			await installConfig(data);
			return res.send({success: true})
		}else if(type == 'extensionSetting'){
			const data = await getExtensionSetting();
			return res.send({data})
		}else{
			return res.send({success: true})
		}
    }catch(error){
        console.log(error);
		return res.send({success: false})
    }
}

export default handler