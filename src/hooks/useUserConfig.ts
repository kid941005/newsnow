export interface UserPushConfig {
  keywords: string[]
  blocked_keywords: string[]
  keyword_tags: Record<string, string[]>
  push_enabled: boolean
  push_channel: string
  push_webhook: string
  push_cron: string
  fetch_use_proxy: boolean
  fetch_proxy_url: string
  updated?: number
}

const defaultConfig: UserPushConfig = {
  keywords: [],
  blocked_keywords: [],
  keyword_tags: {},
  push_enabled: false,
  push_channel: "feishu",
  push_webhook: "",
  push_cron: "0 */4 * * *",
  fetch_use_proxy: false,
  fetch_proxy_url: "",
}

function authHeader(): Record<string, string> {
  const jwt = safeParseString(localStorage.getItem("jwt"))
  return jwt ? { Authorization: `Bearer ${jwt}` } : {}
}

export function useUserConfig() {
  const loadConfig = useCallback(async () => {
    const res = await myFetch("/me/config", {
      headers: authHeader(),
    }) as {
      success: boolean
      config: UserPushConfig
    }
    return {
      ...defaultConfig,
      ...res.config,
    }
  }, [])

  const saveConfig = useCallback(async (config: UserPushConfig) => {
    const res = await myFetch("/me/config", {
      method: "POST",
      headers: authHeader(),
      body: config,
    }) as {
      success: boolean
      config: UserPushConfig
    }
    return {
      ...defaultConfig,
      ...res.config,
    }
  }, [])

  const pushNow = useCallback(async () => {
    return await myFetch("/me/push", {
      method: "POST",
      headers: authHeader(),
    }) as {
      success: boolean
      count: number
    }
  }, [])

  return {
    defaultConfig,
    loadConfig,
    saveConfig,
    pushNow,
  }
}
