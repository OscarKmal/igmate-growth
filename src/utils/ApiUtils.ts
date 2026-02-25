import { getNormalBI } from './device'
import { getOrCreateUserInfo } from './functions'
import { appInfo } from './AppInfo'

export class ApiUtils {

    static async fetchWithFallback(path: string, options: RequestInit) {
        const baseUrls = appInfo.baseUrls || [appInfo.baseUrl]
        let lastError = null
        for (const base of baseUrls) {
            const fullUrl = base + path
            try {
                const res = await fetch(fullUrl, options)
                if (!res.ok) {
                    lastError = new Error(`HTTP ${res.status} @ ${fullUrl}`)
                    continue
                }
                return res
            } catch (e) {
                lastError = new Error(`Network error @ ${fullUrl}: ${e}`)
                continue
            }
        }
        throw lastError
    }

    static async getRequest(url: string, params?: Record<string, string>, callback?: any) {
        const normalBI = getNormalBI()
        const userInfo = await getOrCreateUserInfo()
        params = {
            ...params,
            userId: userInfo.userId,
            appId: appInfo.appId,
            version: appInfo.version
        }

        const qs = new URLSearchParams(params).toString()
        const path = `${url}?${qs}`

        try {
            const res = await ApiUtils.fetchWithFallback(path, {
                method: "GET",
                headers: {
                    "Authorization": userInfo.token,
                    "timeZone": normalBI['timeZone']
                }
            })

            callback && callback(res)
            return res.json()

        } catch (err) {
            console.log(err)
            return null
        }
    }

    static async postRequest(url: string, params?: Record<string, any>, callback?: any, headers?: Record<string, string>) {
        const normalBI = getNormalBI()
        const userInfo = await getOrCreateUserInfo()
        const formData = new FormData()

        for (const key in normalBI) formData.append(key, normalBI[key])
        formData.append("userId", userInfo.userId)
        formData.append("appId", appInfo.appId)
        formData.append("version", appInfo.version)

        if (params) {
            for (const key in params) formData.append(key, params[key])
        }

        try {
            const res = await ApiUtils.fetchWithFallback(url, {
                method: "POST",
                body: formData,
                headers: {
                    ...headers,
                    "Authorization": headers?.token || userInfo.token,
                    "timeZone": normalBI['timeZone']
                }
            })

            callback && callback(res)
            return res.json()

        } catch (err) {
            console.log(err)
            return null
        }
    }
}
