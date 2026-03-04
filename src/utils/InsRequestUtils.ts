import { INS_API_URLS } from './ApiUrls';
import { getStorage, setStorage, sleep } from './functions';
import { storageName } from "~utils/consts";

const INS_BASE_URL = process.env.PLASMO_PUBLIC_INS_BASE_URL;
const INS_PICTURE_BASE_URL = process.env.PLASMO_PUBLIC_INS_PICTURE_BASE_URL;

const defaultHeader = {
    'x-ig-app-id': '936619743392459',
    'x-requested-with': 'XMLHttpRequest'
}

type InsCsrfTokenCache = {
    /**
     * 用途：Instagram csrftoken。
     * 类型：string
     * 可选性：必填
     */
    token: string;

    /**
     * 用途：过期时间戳（毫秒）。
     * 类型：number
     * 可选性：必填
     */
    expireAt: number;
};

export class InsRequestUtils{
    /**
     * 用途：csrftoken 缓存 TTL（毫秒）。
     * 类型：number
     * 可选性：必填
     * 默认值：30 分钟
     */
    private static readonly csrfTokenCacheTtlMs: number = 30 * 60 * 1000;

    /**
     * 用途：并发去重（同一时间只允许一次 token 获取请求）。
     * 类型：Promise<void> | null
     * 可选性：必填
     * 默认值：null
     */
    private static csrfTokenInFlight: Promise<void> | null = null;

    /**
     * 用途：从 storage 读取 csrftoken 缓存。
     *
     * 返回值：
     * - Promise<InsCsrfTokenCache | null>
     */
    private static async loadCsrfTokenCache(): Promise<InsCsrfTokenCache | null> {
        try {
            const raw = await getStorage(storageName.insCsrfTokenCacheStorageName);
            const token = typeof raw?.token === "string" ? raw.token : "";
            const expireAt = typeof raw?.expireAt === "number" ? raw.expireAt : 0;
            if (!token || !Number.isFinite(expireAt)) return null;
            return { token, expireAt };
        } catch {
            return null;
        }
    }

    /**
     * 用途：写入 csrftoken 缓存到 storage。
     *
     * 参数：
     * - cache：InsCsrfTokenCache
     */
    private static async saveCsrfTokenCache(cache: InsCsrfTokenCache): Promise<void> {
        try {
            await setStorage(storageName.insCsrfTokenCacheStorageName, cache);
        } catch {
            // swallow
        }
    }

    /**
     * 获取并设置 Instagram csrftoken。
     *
     * 用途：
     * - 按当前业务要求：在调用某些接口前（例如 fetchPostLikers）先获取 csrftoken，保证请求头携带最新的 x-csrftoken。
     * - 与 autoFollow / unfollowUser 的实现方式保持一致。
     *
     * 参数：
     * - 无
     *
     * 返回值：
     * - Promise<void>
     *
     * 异常：
     * - 获取失败时不抛异常（避免影响主流程），仅保持 defaultHeader 原状.
     */
    static async ensureCsrfToken(): Promise<void> {
        const cached = await InsRequestUtils.loadCsrfTokenCache();
        if (cached && cached.token && cached.expireAt > Date.now()) {
            defaultHeader["x-csrftoken"] = cached.token;
            return;
        }

        if (InsRequestUtils.csrfTokenInFlight) {
            await InsRequestUtils.csrfTokenInFlight;
            return;
        }

        InsRequestUtils.csrfTokenInFlight = (async () => {
            try {
                const csrfResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.getCurrentUser}`, {
                    method: "GET",
                    credentials: "include",
                    headers: defaultHeader
                });
                const csrfData = await csrfResponse.json();
                const csrftoken = csrfData?.config?.csrf_token;
                if (csrftoken) {
                    defaultHeader["x-csrftoken"] = csrftoken;
                    await InsRequestUtils.saveCsrfTokenCache({
                        token: csrftoken,
                        expireAt: Date.now() + InsRequestUtils.csrfTokenCacheTtlMs
                    });
                }
            } catch {
                // swallow
            } finally {
                InsRequestUtils.csrfTokenInFlight = null;
            }
        })();

        await InsRequestUtils.csrfTokenInFlight;
    }

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
            const url = `${INS_BASE_URL}${INS_API_URLS.queryApi}?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify(variables))}`;
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

    /**
     * 通过 Instagram 用户名查询用户信息（包含 userId）。
     *
     * 用途：
     * - 自动关注任务的第一步：由用户名拿到 userId，再用于 followers/following、follow、unfollow 等后续接口。
     * - 该方法使用 web_profile_info 接口（INS_API_URLS.checkStatus）。
     *
     * 参数：
     * - username：string；Instagram 用户名，可包含或不包含前缀 '@'。
     *
     * 返回值：
     * - { success: boolean; data?: { userId: string; username: string; fullName: string; profileImage: string; followers: number; following: number } }
     *
     * 异常：
     * - 网络请求或解析异常时返回 { success: false }。
     */
    static async getUserByUsername(username: string) {
        try {
            const normalized = (username || '').trim().replace(/^@/, '');
            if (!normalized) {
                return { success: false };
            }

            const profileResponse = await fetch(
                INS_BASE_URL + INS_API_URLS.checkStatus + `?username=${encodeURIComponent(normalized)}`,
                { method: 'GET', credentials: 'include', headers: defaultHeader }
            );
            if (!profileResponse.ok) throw new Error('Failed to fetch profile data');

            const profileData = await profileResponse.json();
            const user = profileData?.data?.user;
            if (!user?.id) {
                return { success: false };
            }

            const originalProfileUrl = user.profile_pic_url;
            const proxiedProfileUrl = INS_PICTURE_BASE_URL + `${originalProfileUrl}`;

            return {
                success: true,
                data: {
                    userId: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    profileImage: proxiedProfileUrl,
                    followers: user.edge_followed_by?.count || 0,
                    following: user.edge_follow?.count || 0
                }
            };
        } catch (error) {
            console.log('Error getting user by username:', error);
            return { success: false };
        }
    }

    /**
     * 获取帖子点赞者列表。
     *
     * 用途：
     * - “根据帖子链接查询点赞者”任务的数据源。
     * - 需要先将 Post/Reel URL 解析为 mediaId（项目内已有解析方法时可复用）。
     *
     * 参数：
     * - mediaId：string；Instagram 媒体 id。
     *
     * 返回值：
     * - { success: boolean; users: any[] }
     *
     * 说明：
     * - 该接口在不同账号/不同帖子上返回结构可能存在差异，目前采取“尽可能兼容”的解析方式。
     * - 若后续确认存在分页字段（如 next_max_id），再扩展分页入参。
     *
     * 异常：
     * - 网络请求或解析异常时返回 success=false。
     */
    static async fetchPostLikers(mediaId: string) {
        try {
            if (!mediaId) return { success: false, users: [] };
            await InsRequestUtils.ensureCsrfToken();
            const url = `${INS_BASE_URL}${INS_API_URLS.postLikes.replace('{mediaId}', mediaId)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: defaultHeader,
                credentials: 'include'
            });

            const data = await response.json();
            const users = data?.users || data?.data?.users || [];
            return { success: Array.isArray(users), users: Array.isArray(users) ? users : [] };
        } catch (error) {
            console.log('Error fetching post likers:', error);
            return { success: false, users: [] };
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
                    isVerified: !!user.is_verified,
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
            await InsRequestUtils.ensureCsrfToken();
            defaultHeader['x-instagram-ajax'] = 1;
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
            await InsRequestUtils.ensureCsrfToken();
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

    /**
     * 分页获取指定用户的 followers / following 列表。
     *
     * 用途：
     * - “通过某个账号，自动关注他的关注者/粉丝”任务的数据源。
     * - 该方法为单页拉取：调用方需基于 `endCursor/hasNextPage` 进行 while 循环分页。
     *
     * 参数：
     * - userId：string；目标账号 userId。
     * - queryHash：string；GraphQL query_hash（followers 与 following 不同）。
     * - edgeType：string；数据路径字段名（例如 edge_followed_by / edge_follow）。
     * - first：number；每页数量。
     * - after：string；游标。
     *
     * 返回值：
     * - { success: boolean; count: number; users: any[]; endCursor: string | null; hasNextPage: boolean }
     *
     * 异常：
     * - 网络请求或解析异常时返回 success=false。
     */
    static async fetchFollowUsers(userId: string, queryHash: string, edgeType: string, first=parseInt(process.env.PLASMO_PUBLIC_INS_PAGESIZE), after = '') {
        try {
            const variables = {
                id: userId,
                first: first,
                after: after,
                include_reel:false,
                fetch_mutual:false
            };

            const url = `${INS_BASE_URL}${INS_API_URLS.queryApi}?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify(variables))}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: defaultHeader,
                credentials: 'include'
            });

            const data = await response.json();
			const count = data.data?.user?.[edgeType]?.count || 0;
            const edges = data.data?.user?.[edgeType]?.edges || [];
            const pageInfo = data.data?.user?.[edgeType]?.page_info || {};

            const users = edges.map((edge: any) => edge.node);
			const success = !!data?.data?.user?.[edgeType];
	
            return {
				success: success,
				count,
                users,
                endCursor: pageInfo.end_cursor || null,
                hasNextPage: !!pageInfo.has_next_page
            };
    
        } catch (error) {
            console.log(error);
            return {
				success: false,
				count: 0,
                users: [],
                endCursor: null,
                hasNextPage: false
            };
        }
    }
	
	static getFollowStatus(data: any) {
		const s = data.friendship_status;
		if (s.blocking) return 'blocking'
		if (s.following) return 'following'
		if (s.outgoing_request) return 'requested'
		if (s.incoming_request) return 'incoming_request'
		return ''
	}

    static async newAutoFollow(userId: string) {
        try {
            await InsRequestUtils.ensureCsrfToken();
            defaultHeader['x-instagram-ajax'] = 1;
            const autofollowResponse = await fetch(`${INS_BASE_URL}${INS_API_URLS.newAutoFollow.replace("{userId}", userId)}`, {
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
            const success = result.status === 'ok';
			let data = '';
			if(success){
				data = this.getFollowStatus(result);
			}
			return {success: success, data: data};
        } catch (error) {
            console.log('Error unfollowing user:', error);
            return {success: false, data: null};
        }
    }
}