import { motion } from "framer-motion"
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
        <span>当前：{isDark ? "深色" : "浅色"}</span>
      </li>
    </>
  )
}

function promptPasswordLogin(title: string, action: (username: string, password: string) => Promise<void>) {
  const username = window.prompt(`${title}：请输入用户名`)
  if (!username) return
  const password = window.prompt(`${title}：请输入密码`)
  if (!password) return
  action(username, password).catch((e: any) => {
    window.alert(e?.data?.message || e?.message || `${title}失败`)
  })
}

function ConfigPanel({ onClose }: { onClose: () => void }) {
  const { defaultConfig, loadConfig, saveConfig, pushNow } = useUserConfig()
  const [form, setForm] = useState<UserPushConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    try {
      const config = await saveConfig(form)
      setForm(config)
      window.alert("配置已保存")
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || "保存失败")
    } finally {
      setSaving(false)
    }
  }

  const push = async () => {
    try {
      const res = await pushNow()
      window.alert(`推送成功，共 ${res.count} 条`)
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || "推送失败")
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex justify-center bg-black/30 py-4" onClick={onClose}>
      <div className="w-full max-w-lg self-start rounded-xl bg-base shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto px-4 pb-4 pt-3">
          <div className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b border-gray/15 bg-base px-0 pb-3 pt-1">
            <h3 className="text-lg font-semibold">账号与推送配置</h3>
            <button type="button" className="btn i-ph:x" onClick={onClose} />
          </div>
          {loading
          ? <div className="py-8 text-center text-sm opacity-70">加载中...</div>
          : (
              <div className="space-y-4 px-1 pb-1 text-sm">
                <label className="block space-y-1">
                  <span>关键词（逗号分隔）</span>
                  <textarea className="min-h-[88px] w-full rounded-xl border border-gray/20 bg-white/70 px-3 py-2.5 outline-none dark:bg-black/10" rows={2} value={form.keywords.join(", ")} onChange={e => update("keywords", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} />
                </label>
                <label className="block space-y-1">
                  <span>屏蔽词（逗号分隔）</span>
                  <textarea className="min-h-[88px] w-full rounded-xl border border-gray/20 bg-white/70 px-3 py-2.5 outline-none dark:bg-black/10" rows={2} value={form.blocked_keywords.join(", ")} onChange={e => update("blocked_keywords", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} />
                </label>
                <label className="block space-y-1">
                  <span>标签映射（JSON）</span>
                  <textarea className="min-h-[112px] w-full rounded-xl border border-gray/20 bg-white/70 px-3 py-2.5 font-mono outline-none dark:bg-black/10" rows={3} value={JSON.stringify(form.keyword_tags)} onChange={e => {
                    try {
                      update("keyword_tags", e.target.value ? JSON.parse(e.target.value) : {})
                    } catch {}
                  }} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gray/15 bg-white/45 px-3 py-2.5 dark:bg-black/10">
                  <span className="text-sm">手动刷新时通过代理抓取新闻源</span>
                  <input type="checkbox" className="h-4 w-4 accent-current" checked={form.fetch_use_proxy} onChange={e => update("fetch_use_proxy", e.target.checked)} />
                </label>
                <label className="block space-y-1">
                  <span>代理地址</span>
                  <input className="h-11 w-full rounded-xl border border-gray/20 bg-white/70 px-3 outline-none disabled:opacity-60 dark:bg-black/10" value={form.fetch_proxy_url} onChange={e => update("fetch_proxy_url", e.target.value)} placeholder="http://127.0.0.1:7890" disabled={!form.fetch_use_proxy} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gray/15 bg-white/45 px-3 py-2.5 dark:bg-black/10">
                  <span className="text-sm">启用推送</span>
                  <input type="checkbox" className="h-4 w-4 accent-current" checked={form.push_enabled} onChange={e => update("push_enabled", e.target.checked)} />
                </label>
                <label className="block space-y-1">
                  <span>推送渠道</span>
                  <select className="h-11 w-full rounded-xl border border-gray/20 bg-white/70 px-3 outline-none dark:bg-black/10" value={form.push_channel} onChange={e => update("push_channel", e.target.value)}>
                    <option value="feishu">Feishu</option>
                    <option value="dingtalk">Dingtalk</option>
                    <option value="bark">Bark</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span>Webhook</span>
                  <input className="h-11 w-full rounded-xl border border-gray/20 bg-white/70 px-3 outline-none dark:bg-black/10" value={form.push_webhook} onChange={e => update("push_webhook", e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span>推送 Cron</span>
                  <input className="h-11 w-full rounded-xl border border-gray/20 bg-white/70 px-3 outline-none dark:bg-black/10" value={form.push_cron} onChange={e => update("push_cron", e.target.value)} />
                </label>
                <div className="mt-1 flex flex-wrap gap-3 border-t border-gray/15 pt-4">
                  <button type="button" className="h-11 rounded-xl bg-primary px-4 text-white disabled:opacity-60" disabled={saving} onClick={save}>{saving ? "保存中..." : "保存配置"}</button>
                  <button type="button" className="h-11 rounded-xl border border-gray/20 px-4" onClick={push}>立即推送</button>
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
                        <li onClick={() => promptPasswordLogin("本地登录", loginLocal)}>
                          <span className="i-ph:sign-in-duotone inline-block" />
                          <span>本地账号登录</span>
                        </li>
                        <li onClick={() => promptPasswordLogin("注册账号", registerLocal)}>
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
    </>
  )
}
