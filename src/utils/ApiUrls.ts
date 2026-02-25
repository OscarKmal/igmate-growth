
export const API_URLS = {
    //Initial installation
    userReg: 'app/user-reg/insComment/userReg',
    // get user info 
    GET_USER_INFO: 'app/user-reg/insComment/getUserInfo',
    // google login callback
    APP_LOGIN: `app/thirdParty/google/googleExtLogin`,
    //log
    LOG_ACTION: 'app/user-action/insComment/log-action',
    //get config info
    configUrl: 'app/user-action/insComment/getConfig',
    //install page
    userInstallGuide: 'app/web-transfer/insComment/user-install-guide',
    //uninstall page
    userUnInstallGuide: 'app/web-transfer/insComment/user-uninstall-guide',
    //save feedback
    saveFeedBack: 'app/feedback/insComment/saveFeedback',
	//save rating
	saveRating: 'app/rating/saveRatingCws',
	//check has five rating
	checkFiveRating: 'app/rating/checkFiveRating',
    //get price info
    PRICE_LIST: 'app/price/getPriceSettingList',
    //jump stripe PAY URL
    GET_PAY_URL: 'app/stripe/create-checkout-session',
	// get memberinfo
	getMemberInfo: 'app/userRights/insComment/getUserMemberInfo',
	//extension login
	extensionLogin: "app/user-reg/insComment/extensionLogin",
	//extension login
	logout: "app/user-reg/insComment/logout",
	//get share template list
	getShareTemplateList: 'app/shareTemplate/getShareTemplateList',
}

export const INS_API_URLS = {
    //Check ins login status or Retrieve specified user information
    checkStatus: 'api/v1/users/web_profile_info/',
    //get current login user
    getCurrentUserName: 'api/v1/accounts/edit/web_form_data/',
    //Get current login information
    getCurrentUser: 'data/shared_data/',
    //auto follow
    autoFollow: 'web/friendships/{userId}/follow/',
    //Unfollow
    unfollow: 'api/v1/friendships/destroy/',
    //get comments
    queryComments: 'graphql/query/'
}
