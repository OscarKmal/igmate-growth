import browser from 'webextension-polyfill';
import type { AppInfo } from '~modles/extension';

export const appInfo:AppInfo = {
    version: browser.runtime.getManifest().version,
    appId: process.env.PLASMO_PUBLIC_EXT_ID,
    baseUrl: process.env.PLASMO_PUBLIC_BASE_SVR_HOST,
    webUrl: process.env.PLASMO_PUBLIC_BASE_WEB_HOST,
	baseUrls: process.env.PLASMO_PUBLIC_BACKUP_BASE_SVR_HOSTS.split(',')
}