import {UserAction} from '../modles/extension';
import { ApiUtils } from './ApiUtils';
import { API_URLS } from './ApiUrls';
import { sleep } from "~utils/functions";

/**
 * Method for requesting backend
 */
export class Fetcher {
    
    //Attempted times already
    static retryCount = 0;

    //max retries
    static retryMaxCount = 3;

    static userReg(action:UserAction, detail:any, callback:any)
    {
        const params = {
            action,
            detail: JSON.stringify(detail)
        }
        ApiUtils.postRequest(API_URLS.userReg, params, callback)
    }

    //log user action
    static async logAction(action:UserAction, detail:any, url: string, callback:any) {
        let domain = null;
        if(url){
            domain = new URL(url).hostname
        }
        const params = {
            action,
            detail: JSON.stringify(detail),
            url,
            domain: domain
        }
        const rtnData = await ApiUtils.postRequest(API_URLS.LOG_ACTION, params, callback)
        return rtnData
    }

    static async getConfig() {
        let responseData = null;
        let flag = true;
        try {
            responseData = await ApiUtils.postRequest(API_URLS.configUrl, {}, null)
            if(responseData==null){
                flag = false;
            }
        } catch(error) {
            flag = false;
            console.log(error);
        }
        if(!flag && this.retryCount < this.retryMaxCount){
            this.retryCount++;
            await sleep(1000);
            this.getConfig();
        }else{
            this.retryCount = 0;
        }
        return responseData;
    }

    //save feedback
    static async saveFeedback(email: string, feedbackContent: string) {
        const params = {
            email,
            feedbackContent
        }
        const rtnData = await ApiUtils.postRequest(API_URLS.saveFeedBack, params)
        return rtnData;
    }
	
	//save rating
	static async saveRating(rating: number) {
	    const params = {
	        rating
	    }
	    const rtnData = await ApiUtils.postRequest(API_URLS.saveRating, params)
	    return rtnData;
	}
	
	//check has five rating
	static async checkFiveRating() {
	    const rtnData = await ApiUtils.postRequest(API_URLS.checkFiveRating, {})
	    return rtnData;
	}
	
	//get userinfo
	static async getUserInfo() {
	    const rtnData = await ApiUtils.postRequest(API_URLS.GET_USER_INFO, {})
	    if(rtnData==null||rtnData.code==403){
			return {loginStatus: false, data: null, code: rtnData?.code};
		}else{
			return {loginStatus: true, data: rtnData.data, code: rtnData.code};
		}
	}
	
	//extension login
	static async extensionLogin(token: string) {
	    const rtnData = await ApiUtils.postRequest(API_URLS.extensionLogin, {}, null, {token: token})
		return rtnData;
	}
	
	//extension logout
	static async extensionLogout() {
	    const rtnData = await ApiUtils.postRequest(API_URLS.logout, {})
		return rtnData;
	}
	
	//getShareTemplateList
	static async getShareTemplateList() {
	    const rtnData = await ApiUtils.postRequest(API_URLS.getShareTemplateList, {})
		return rtnData;
	}

    //addFollow
	static async addFollow(taskId: string, followUserId: string, followeeUserId: string) {
	    const rtnData = await ApiUtils.postRequest(API_URLS.addFollow, {taskId, followUserId, followeeUserId})
		return rtnData;
	}

    //followerStats
	static async followerStats(followUserId: string) {
	    const rtnData = await ApiUtils.postRequest(API_URLS.followerStats, {followUserId})
		return rtnData;
	}

    //distinctFollowerUserIdsLast30Days
	static async distinctFollowerUserIdsLast30Days(followeeUserId: string) {
	    const rtnData = await ApiUtils.postRequest(API_URLS.distinctFollowerUserIdsLast30Days, {followeeUserId})
		return rtnData;
	}
}
