
export const API_URLS = {
    //Initial installation
    userReg: 'app/user-reg/insGrowth/userReg',
    // get user info 
    GET_USER_INFO: 'app/user-reg/insGrowth/getUserInfo',
    // google login callback
    APP_LOGIN: `app/thirdParty/google/googleExtLogin`,
    //log
    LOG_ACTION: 'app/user-action/insGrowth/log-action',
    //get config info
    configUrl: 'app/user-action/insGrowth/getConfig',
    //install page
    userInstallGuide: 'app/web-transfer/insGrowth/user-install-guide',
    //uninstall page
    userUnInstallGuide: 'app/web-transfer/insGrowth/user-uninstall-guide',
    //save feedback
    saveFeedBack: 'app/feedback/insGrowth/saveFeedback',
	//save rating
	saveRating: 'app/rating/saveRatingCws',
	//check has five rating
	checkFiveRating: 'app/rating/checkFiveRating',
    //get price info
    PRICE_LIST: 'app/price/getPriceSettingList',
    //jump stripe PAY URL
    GET_PAY_URL: 'app/stripe/create-checkout-session',
	// get memberinfo
	getMemberInfo: 'app/userRights/insGrowth/getUserMemberInfo',
	//extension login
	extensionLogin: "app/user-reg/insGrowth/extensionLogin",
	//extension login
	logout: "app/user-reg/insGrowth/logout",
	//get share template list
	getShareTemplateList: 'app/shareTemplate/getShareTemplateList',
    //addFollow
    addFollow: 'app/follow/insGrowth/addFollow',
    //followerStats
    followerStats: 'app/follow/insGrowth/followerStats',
    //distinctFollowerUserIdsLast30Days
    distinctFollowerUserIdsLast30Days: 'app/follow/insGrowth/distinctFollowerUserIdsLast30Days'

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
    //Get follow or unfollow information,get comments
    queryApi: 'graphql/query/',
    //get post likes
    postLikes: 'api/v1/media/{mediaId}/likers/',
}
