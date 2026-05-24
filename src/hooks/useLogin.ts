const userAtom = atomWithStorage<{
  name?: string
  avatar?: string
  type?: "github" | "local"
}>("user", {})

const jwtAtom = atomWithStorage("jwt", "")

const enableLoginAtom = atomWithStorage<{
  enable: boolean
  url?: string
}>("login", {
  enable: true,
})

enableLoginAtom.onMount = (set) => {
  myFetch("/enable-login").then((r) => {
    set(r)
  }).catch((e) => {
    if (e.statusCode === 506) {
      set({ enable: false })
      localStorage.removeItem("jwt")
    }
  })
}

async function authByPassword(path: "/register" | "/login/local", username: string, password: string) {
  return await myFetch(path, {
    method: "POST",
    body: { username, password },
  }) as {
    success: boolean
    jwt: string
    user: {
      name?: string
      avatar?: string
      type?: "github" | "local"
    }
  }
}

export function useLogin() {
  const userInfo = useAtomValue(userAtom)
  const jwt = useAtomValue(jwtAtom)
  const enableLogin = useAtomValue(enableLoginAtom)

  const login = useCallback(() => {
    window.alert("GitHub OAuth 已移除，请使用本地账号登录")
  }, [])

  const loginLocal = useCallback(async (username: string, password: string) => {
    const res = await authByPassword("/login/local", username, password)
    localStorage.setItem("jwt", JSON.stringify(res.jwt))
    localStorage.setItem("user", JSON.stringify(res.user))
    window.location.reload()
  }, [])

  const registerLocal = useCallback(async (username: string, password: string) => {
    const res = await authByPassword("/register", username, password)
    localStorage.setItem("jwt", JSON.stringify(res.jwt))
    localStorage.setItem("user", JSON.stringify(res.user))
    window.location.reload()
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem("jwt")
    window.localStorage.removeItem("user")
    window.location.reload()
  }, [])

  return {
    loggedIn: !!jwt,
    userInfo,
    enableLogin: !!enableLogin.enable,
    logout,
    login,
    loginLocal,
    registerLocal,
  }
}
