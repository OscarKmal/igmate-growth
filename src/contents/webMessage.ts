import { sendToBackground } from "@plasmohq/messaging";
import { appInfo } from '~utils/AppInfo'
import { getOrCreateUserInfo } from "~utils/functions";

window.addEventListener("message", async (event) => {
	if (event.source !== window) return
	const { type, data } = event.data;
	if(type == 'checkInstall'){
		const userInfo = await getOrCreateUserInfo();
		window.postMessage({
			source: appInfo.appId,
			type: 'checkInstallResponse',
			requestId: data.requestId,
			data: {appId: appInfo.appId, userId: userInfo.userId}
		});
	}else{
		const result = await sendToBackground({
			name: "webMsg",
			body: event.data
		});
		if(event.data.type=='extensionSetting'){
			setTimeout(()=>{
				window.postMessage({
					source: 'insGrowth',
					type: 'extensionSettingResponse',
					data: result
				});
			}, 300);
		}
	}
})

export const config = {
	matches: [
		'http://localhost:3000/*',
		'https://igmate.net/*',
		'https://igmate.me/*'
	]
}
