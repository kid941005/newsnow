import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useDark } from "~/hooks/useDark"
import type { UserPushConfig } from "~/hooks/useUserConfig"
import { useUserConfig } from "~/hooks/useUserConfig"

function ThemeToggle() {
  const { isDark, setDark } = useDark()
  return (
    <>
      <li onClick={() => setDark("auto")} className="cursor-pointer [&_*]:cursor-pointer transition-all">
        <span className="i-ph:desktop-duotone inline-block" />
        <span>跟随系统</span>
      </li>
      <li onClick={() => setDark("light")} className="cursor-pointer [&_*]:cursor-pointer transition-all">
        <span className="i-ph:sun-dim-duotone inline-block" />
        <span>浅色模式</span>
      </li>
      <li onClick={() => setDark("dark")} className="cursor-pointer [&_*]:cursor-pointer transition-all">
        <span className="i-ph:moon-stars-duotone inline-block" />
        <span>深色模式</span>
      </li>
      <li className="pointer-events-none text-xs opacity-70">
        <span className={$("inline-block", isDark ? "i-ph:moon-stars-duotone" : "i-ph:sun-dim-duotone")} />
        <span>
          当前：
          {isDark ? "深色" : "浅色"}
        </span>
      </li>
    </>
  )
}

function AuthPanel({
  initialMode,
  onClose,
  onLogin,
  onRegister,
}: {
  initialMode: "login" | "register"
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<void>
  onRegister: (username: string, password: string) => Promise<void>
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isLogin = mode === "login"
  const title = isLogin ? "本地账号登录" : "注册本地账号"
  const submitText = isLogin ? "登录" : "注册"
  const loadingText = isLogin ? "登录中..." : "注册中..."
  const submitAction = isLogin ? onLogin : onRegister

  const submit = async () => {
    if (!username.trim() || !password) {
      setError("请输入用户名和密码")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await submitAction(username.trim(), password)
      onClose()
    } catch (e: any) {
      setError(e?.data?.message || e?.message || `${title}失败`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/12 bg-base shadow-[0_24px_80px_rgba(0,0,0,0.35)]" onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray/12 bg-linear-to-br from-primary/18 via-white/8 to-transparent px-5 pb-4 pt-5 dark:via-white/3">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/14 to-transparent opacity-70 dark:from-white/6" />
          <div className="pointer-events-none absolute -top-10 left-8 h-24 w-24 rounded-full bg-primary/18 blur-2xl" />
          <div className="pointer-events-none absolute -right-6 top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl dark:bg-white/6" />
          <div className="relative mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <span className="i-ph:user-circle-duotone text-2xl" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] opacity-55">NewsNow Account</div>
                <h3 className="mt-1 text-xl font-semibold leading-none">{title}</h3>
              </div>
            </div>
            <button type="button" className="btn i-ph:x" onClick={onClose} />
          </div>
          <p className="text-sm leading-6 opacity-72">使用本地账号继续，登录后可同步个人配置与推送设置。</p>
        </div>
        <div className="border-b border-gray/10 px-5 py-3">
          <div className="grid grid-cols-2 rounded-2xl bg-black/4 p-1 dark:bg-white/6 relative isolate overflow-hidden">
            <div className={$("pointer-events-none absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all duration-200", isLogin ? "left-1" : "left-[calc(50%+0rem)]")} />
            <button
              type="button"
              className={$("relative z-1 h-10 rounded-xl text-sm font-medium transition-all duration-200", isLogin ? "text-white" : "opacity-70 hover:opacity-100")}
              onClick={() => {
                setMode("login")
                setError("")
              }}
            >
              登录
            </button>
            <button
              type="button"
              className={$("relative z-1 h-10 rounded-xl text-sm font-medium transition-all duration-200", !isLogin ? "text-white" : "opacity-70 hover:opacity-100")}
              onClick={() => {
                setMode("register")
                setError("")
              }}
            >
              注册
            </button>
          </div>
        </div>
        <div className="space-y-4 px-5 pb-5 pt-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium opacity-80">用户名</span>
            <input
              className="h-12 w-full rounded-2xl border border-gray/18 bg-white/75 px-4 shadow-sm outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-primary/45 focus:bg-white focus:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-black/12"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium opacity-80">密码</span>
            <input
              type="password"
              className="h-12 w-full rounded-2xl border border-gray/18 bg-white/75 px-4 shadow-sm outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-primary/45 focus:bg-white focus:shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-black/12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isLogin ? "请输入密码" : "请设置密码"}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </label>
          {error && <div className="rounded-2xl border border-red/15 bg-red/8 px-3 py-2.5 text-sm text-red-5">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" className="h-11 flex-1 rounded-2xl border border-gray/18 bg-white/55 px-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-sm dark:bg-black/8" onClick={onClose}>取消</button>
            <button type="button" className="h-11 flex-1 rounded-2xl bg-primary px-4 text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 hover:opacity-95 disabled:opacity-60" disabled={submitting} onClick={submit}>{submitting ? loadingText : submitText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigPanel({ onClose }: { onClose: () => void }) {
  const { defaultConfig, loadConfig, saveConfig, pushNow } = useUserConfig()
  const [form, setForm] = useState<UserPushConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  useEffect(() => {
    loadConfig().then((config) => {
      setForm(config)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [loadConfig])

  const update = <K extends keyof UserPushConfig>(key: K, value: UserPushConfig[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const config = await saveConfig(form)
      setForm(config)
      setMessage({ type: "success", text: "配置已保存" })
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message || e?.message || "保存失败" })
    } finally {
      setSaving(false)
    }
  }

  const push = async () => {
    setMessage(null)
    try {
      const res = await pushNow()
      setMessage({ type: "success", text: `推送成功，共 ${res.count} 条` })
    } catch (e: any) {
      setMessage({ type: "error", text: e?.data?.message || e?.message || "推送失败" })
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex justify-center bg-black/30 py-4" onClick={onClose}>
      <div className="w-full max-w-lg self-start rounded-2xl border border-white/10 bg-base shadow-[0_24px_80px_rgba(0,0,0,0.28)]" onClick={e => e.stopPropagation()}>
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto px-5 pb-5 pt-4">
          <div className="sticky top-0 z-10 mb-4 border-b border-gray/12 bg-base/95 pb-4 pt-1 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3 rounded-2xl bg-linear-to-br from-primary/12 via-white/6 to-transparent px-4 py-4 dark:via-white/3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] opacity-55">NewsNow Settings</div>
                <h3 className="mt-1 text-xl font-semibold">账号与推送配置</h3>
                <p className="mt-1 text-sm leading-6 opacity-72">统一管理关键词、代理和推送参数。</p>
              </div>
              <button type="button" className="btn i-ph:x" onClick={onClose} />
            </div>
          </div>
          {loading
            ? <div className="py-8 text-center text-sm opacity-70">加载中...</div>
            : (
                <div className="space-y-5 px-1 pb-1 text-sm">
                  <div className="space-y-4 rounded-[28px] border border-gray/12 bg-black/3 p-3 dark:bg-white/4">
                    <div className="px-1">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] opacity-50">内容筛选</div>
                      <div className="mt-1 text-sm opacity-72">管理推送关键词、屏蔽词和标签映射。</div>
                    </div>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">关键词（逗号分隔）</span>
                      <textarea className="min-h-[88px] w-full rounded-2xl border border-gray/18 bg-white/75 px-3 py-2.5 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12" rows={2} value={form.keywords.join(", ")} onChange={e => update("keywords", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} />
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">屏蔽词（逗号分隔）</span>
                      <textarea className="min-h-[88px] w-full rounded-2xl border border-gray/18 bg-white/75 px-3 py-2.5 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12" rows={2} value={form.blocked_keywords.join(", ")} onChange={e => update("blocked_keywords", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} />
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">标签映射（JSON）</span>
                      <textarea
                        className="min-h-[112px] w-full rounded-2xl border border-gray/18 bg-white/75 px-3 py-2.5 font-mono outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12"
                        rows={3}
                        value={JSON.stringify(form.keyword_tags)}
                        onChange={(e) => {
                          try {
                            update("keyword_tags", e.target.value ? JSON.parse(e.target.value) : {})
                          } catch {}
                        }}
                      />
                    </label>
                  </div>
                  <div className="space-y-4 rounded-[28px] border border-gray/12 bg-black/3 p-3 dark:bg-white/4">
                    <div className="px-1">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] opacity-50">抓取与推送</div>
                      <div className="mt-1 text-sm opacity-72">配置代理、渠道和推送计划。</div>
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">手动刷新时通过代理抓取新闻源</span>
                      <input type="checkbox" className="h-4 w-4 accent-current" checked={form.fetch_use_proxy} onChange={e => update("fetch_use_proxy", e.target.checked)} />
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">代理地址</span>
                      <input className="h-11 w-full rounded-2xl border border-gray/18 bg-white/75 px-3 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white disabled:opacity-60 dark:bg-black/12" value={form.fetch_proxy_url} onChange={e => update("fetch_proxy_url", e.target.value)} placeholder="http://127.0.0.1:7890" disabled={!form.fetch_use_proxy} />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">启用推送</span>
                      <input type="checkbox" className="h-4 w-4 accent-current" checked={form.push_enabled} onChange={e => update("push_enabled", e.target.checked)} />
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">推送渠道</span>
                      <select className="h-11 w-full rounded-2xl border border-gray/18 bg-white/75 px-3 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12" value={form.push_channel} onChange={e => update("push_channel", e.target.value)}>
                        <option value="feishu">Feishu</option>
                        <option value="dingtalk">Dingtalk</option>
                        <option value="bark">Bark</option>
                      </select>
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">Webhook</span>
                      <input className="h-11 w-full rounded-2xl border border-gray/18 bg-white/75 px-3 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12" value={form.push_webhook} onChange={e => update("push_webhook", e.target.value)} />
                    </label>
                    <label className="block space-y-1.5 rounded-2xl border border-gray/12 bg-white/45 px-4 py-3 dark:bg-black/10">
                      <span className="text-sm font-medium opacity-80">推送 Cron</span>
                      <input className="h-11 w-full rounded-2xl border border-gray/18 bg-white/75 px-3 outline-none transition-all duration-200 focus:border-primary/45 focus:bg-white dark:bg-black/12" value={form.push_cron} onChange={e => update("push_cron", e.target.value)} />
                    </label>
                    <div className="mt-2 flex flex-wrap gap-3 border-t border-gray/12 pt-4">
                      <button type="button" className="h-11 rounded-2xl bg-primary px-4 text-white shadow-lg shadow-primary/20 disabled:opacity-60" disabled={saving} onClick={save}>{saving ? "保存中..." : "保存配置"}</button>
                      <button type="button" className="h-11 rounded-2xl border border-gray/18 bg-white/55 px-4 transition-all duration-200 hover:bg-white/80 dark:bg-black/8" onClick={push}>立即推送</button>
                    </div>
                    {message && (
                      <div
                        className={$(
                          "rounded-2xl border px-4 py-3 text-sm",
                          message.type === "success"
                            ? "border-green/15 bg-green/8 text-green-6"
                            : "border-red/15 bg-red/8 text-red-5",
                        )}
                      >
                        {message.text}
                      </div>
                    )}
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  )
}

export function Menu() {
  const { loggedIn, logout, loginLocal, registerLocal, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [authMode, setAuthMode] = useState<null | "login" | "register">(null)
  return (
    <>
      <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
        <span className="flex items-center scale-90">
          {
            enableLogin && loggedIn && userInfo.avatar
              ? (
                  <button
                    type="button"
                    className="h-6 w-6 rounded-full bg-cover"
                    style={
                      {
                        backgroundImage: `url(${userInfo.avatar}&s=24)`,
                      }
                    }
                  >
                  </button>
                )
              : <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
          }
        </span>
        {shown && (
          <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
            <motion.div
              id="dropdown-menu"
              className={$([
                "w-220px",
                "bg-primary backdrop-blur-5 bg-op-70! rounded-lg shadow-xl",
              ])}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <ol className="bg-base bg-op-70! backdrop-blur-md p-2 rounded-lg color-base text-base">
                {enableLogin && (loggedIn
                  ? (
                      <>
                        <li className="pointer-events-none text-xs opacity-70">
                          <span className="i-ph:user-circle-duotone inline-block" />
                          <span>{userInfo.name || "已登录"}</span>
                        </li>
                        <li onClick={() => setShowConfig(true)}>
                          <span className="i-ph:sliders-horizontal-duotone inline-block" />
                          <span>账号与推送配置</span>
                        </li>
                        <li onClick={logout}>
                          <span className="i-ph:sign-out-duotone inline-block" />
                          <span>退出登录</span>
                        </li>
                      </>
                    )
                  : (
                      <>
                        <li className="pointer-events-none text-xs opacity-70">
                          <span className="i-ph:info-duotone inline-block" />
                          <span>GitHub OAuth 已移除</span>
                        </li>
                        <li onClick={() => setAuthMode("login")}>
                          <span className="i-ph:sign-in-duotone inline-block" />
                          <span>本地账号登录</span>
                        </li>
                        <li onClick={() => setAuthMode("register")}>
                          <span className="i-ph:user-plus-duotone inline-block" />
                          <span>注册本地账号</span>
                        </li>
                      </>
                    ))}
                <ThemeToggle />
                <li onClick={() => window.open(Homepage)} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                  <span className="i-ph:github-logo-duotone inline-block" />
                  <span>Star on Github </span>
                </li>
                <li className="flex gap-2 items-center">
                  <a href="https://github.com/ourongxing/newsnow">
                    <img alt="GitHub stars badge" src="https://img.shields.io/github/stars/ourongxing/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447" />
                  </a>
                  <a href="https://github.com/ourongxing/newsnow/fork">
                    <img alt="GitHub forks badge" src="https://img.shields.io/github/forks/ourongxing/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447" />
                  </a>
                </li>
              </ol>
            </motion.div>
          </div>
        )}
      </span>
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
      {authMode && (
        <AuthPanel
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onLogin={loginLocal}
          onRegister={registerLocal}
        />
      )}
    </>
  )
}
