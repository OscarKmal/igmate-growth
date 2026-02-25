import { INS_API_URLS } from './ApiUrls';
import { parseInstagramUrl } from './commonFunction';
import { sleep } from './functions';
import type { PostInfo } from '~modles/extension';

const INS_BASE_URL = process.env.PLASMO_PUBLIC_INS_BASE_URL;
const INS_PICTURE_BASE_URL = process.env.PLASMO_PUBLIC_INS_PICTURE_BASE_URL;

const defaultHeader = {
    'x-ig-app-id': '936619743392459',
    'x-requested-with': 'XMLHttpRequest'
}

export class InsRequestUtils{

    //check ins login sattus
    static async checkInstagramLogin(showLoading: Function) {
        const attemptFetch = async () => {
            try {
                const userResponse = await fetch(
                    INS_BASE_URL + INS_API_URLS.getCurrentUserName, 
                    { method: 'GET', credentials: 'include', headers: defaultHeader }
                );
                if (!userResponse.ok) throw new Error('Failed to fetch user data');
    
                const userData = await userResponse.json();
                const username = userData.form_data.username;
    
                const profileResponse = await fetch(
                    INS_BASE_URL + INS_API_URLS.checkStatus + `?username=${username}`, 
                    { method: 'GET', credentials: 'include', headers: defaultHeader }
                );
                if (!profileResponse.ok) throw new Error('Failed to fetch profile data');
    
                const profileData = await profileResponse.json();
                const user = profileData.data.user;
    
                const originalProfileUrl = user.profile_pic_url;
                const proxiedProfileUrl = INS_PICTURE_BASE_URL + `${originalProfileUrl}`;
    
                return {
                    success: true,
                    data: {
                        isLoggedIn: true,
                        email: userData.form_data.email,
                        userId: user.id,
                        username: user.username,
                        fullName: user.full_name,
                        followers: user.edge_followed_by.count.toLocaleString(),
                        following: user.edge_follow.count.toLocaleString(),
                        profileImage: proxiedProfileUrl
                    }
                };
            } catch (error) {
                console.log('Attempt failed:', error);
                return {success: false, data: {}};
            }
        };
    
        showLoading?.(true);
    
        try {
            let result = await attemptFetch();
            if (!result.success) {
				await sleep(300);
                console.log('Retrying...');
                result = await attemptFetch();
            }
            return result || { success: false, data: {}};
        } finally {
            showLoading?.(false);
        }
    }

	static async fetchComments(shortcode: string, queryHash: string, first=parseInt(process.env.PLASMO_PUBLIC_INS_PAGESIZE), after = '') {
        try {
            const variables = {
                shortcode: shortcode,
                first: first,
                after: after
            };
            const url = `${INS_BASE_URL}${INS_API_URLS.queryComments}?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify(variables))}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: defaultHeader,
                credentials: 'include'
            });
            const data = await response.json();
			const count = data.data?.shortcode_media?.edge_media_to_comment?.count || 0;
            const edges = data.data?.shortcode_media?.edge_media_to_comment?.edges || [];
            const pageInfo = data.data?.shortcode_media?.edge_media_to_comment?.page_info || {};
            const comments = edges.map((edge: any) => edge.node);
			const success = !!data?.data?.shortcode_media?.edge_media_to_comment;
            return {
				success: success,
				count,
                comments,
                endCursor: pageInfo.end_cursor || null,
                hasNextPage: !!pageInfo.has_next_page
            };
        } catch (error) {
            console.log(error);
            return {
				success: false,
				count: 0,
                comments: [],
                endCursor: null,
                hasNextPage: false
            };
        }
    }
    
	static async getCurrentUser() {
	    try {
	        const response = await fetch(`${INS_BASE_URL}${INS_API_URLS.getCurrentUser}`);
	        const data = await response.json();
			const viewer = data.config.viewer;
			if(viewer.id){
				const originalProfileUrl = viewer.profile_pic_url;
				const proxiedProfileUrl = INS_PICTURE_BASE_URL+`${originalProfileUrl}`;
				const userInfo = {
				    userId: viewer.id,
				    username: viewer.username,
				    fullName: viewer.full_name,
				    profileImage: proxiedProfileUrl
				};
				return {success: true, data: userInfo};
			}else{
				return {success: false};
			}
	    } catch (error) {
	        console.log('Error getting user ID:', error);
	        return {success: false};
	    }
	}
	
	static async getInsUserInfo(userId: string) {
	    try {
	        const url = `https://i.instagram.com/api/v1/users/${userId}/info/`;
			const response = await fetch(url, {
	            method: 'GET',
	            headers: defaultHeader,
	            credentials: 'include'
	        });
	        const data = await response.json();
			const user = data.user;
			if(user){
				const originalProfileUrl = user.profile_pic_url;
				const proxiedProfileUrl = INS_PICTURE_BASE_URL+`${originalProfileUrl}`;
				const userInfo = {
				    id: userId,
				    username: user.username,
				    fullName: user.full_name,
				    profileImage: proxiedProfileUrl,
					follower: user.follower_count||user.edge_followed_by?.count||0,
					following: user.following_count||user.edge_follow?.count||0,
					post: user.media_count||user.edge_owner_to_timeline_media?.count||0,
					email: user.public_email||user.email||'',
					phone: user.public_phone_number||user.phone_number||''
				};
				return {success: true, data: userInfo};
			}else{
				return {success: false};
			}
	    } catch (error) {
	        console.log('Error getting user info:', error);
	        return {success: false};
	    }
	}

	static async autoFollow(userId: string) {
		try {
			const csrfResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.getCurrentUser}`);
			const csrfData = await csrfResponse.json();
			const csrftoken = csrfData.config.csrf_token;
			defaultHeader['x-csrftoken'] = csrftoken;
			const autofollowResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.autoFollow.replace("{userId}", userId)}`, {
				method: 'POST',
				headers: defaultHeader,
				credentials: 'include',
				body: ''
			});

			if (!autofollowResponse.ok) {
				const errorData = await autofollowResponse.json();
				throw new Error(`Autofollow request failed: ${errorData.message || autofollowResponse.status}`);
			}

			const result = await autofollowResponse.json();
			return {success: result.status === 'ok', data: result.result};
		} catch (error) {
			console.log('Error unfollowing user:', error);
			return {success: false, data: null};
		}
	}

	static async unfollowUser(userId: string) {
		try {
			const csrfResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.getCurrentUser}`);
			const csrfData = await csrfResponse.json();
			const csrftoken = csrfData.config.csrf_token;
			defaultHeader['x-csrftoken'] = csrftoken;
			const unfollowResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.unfollow}${userId}/`, {
				method: 'POST',
				headers: defaultHeader,
				credentials: 'include',
				body: ''
			});

			if (!unfollowResponse.ok) {
				const errorData = await unfollowResponse.json();
				throw new Error(`Unfollow request failed: ${errorData.message || unfollowResponse.status}`);
			}

			const result = await unfollowResponse.json();
			return {success: result.status === 'ok'};
		} catch (error) {
			console.log('Error unfollowing user:', error);
			return {success: false};
		}
	}
}