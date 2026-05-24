import type { NewsItem, PrimitiveMetadata, SourceID } from "@shared/types"
import { getters } from "#/getters"
import { UserTable } from "#/database/user"

async function pushToFeishu(webhook: string, content: string) {
  const result = await myFetch.raw(webhook, {
    method: "POST",
    body: {
      msg_type: "markdown",
      content: { text: content },
    },
    headers: { "Content-Type": "application/json" },
    baseURL: undefined,
  })
  const body = await result._data
  return result.status === 200 && (!body || body.code === 0)
}

async function pushToDingtalk(webhook: string, content: string) {
  const result = await myFetch.raw(webhook, {
    method: "POST",
    body: {
      msgtype: "markdown",
      markdown: { title: "NewsNow 推送", text: content },
    },
    headers: { "Content-Type": "application/json" },
    baseURL: undefined,
  })
  const body = await result._data
  return result.status === 200 && (!body || body.errcode === 0)
}

async function pushToBark(webhook: string, content: string) {
  const result = await myFetch.raw(webhook, {
    method: "POST",
    body: {
      title: "NewsNow 推送",
      body: content,
      group: "newsnow",
    },
    headers: { "Content-Type": "application/json" },
    baseURL: undefined,
  })
  const body = await result._data
  return result.status === 200 && (!body || body.code === 200)
}

function buildMarkdown(items: Array<{ source: SourceID, item: NewsItem }>) {
  const lines = ["# NewsNow 推送", ""]
  for (const { source, item } of items) {
    lines.push(`- **${sources[source]?.name || source}** [${item.title}](${item.url})`)
  }
  return lines.join("\n")
}

function pickSourceIds(syncData?: PrimitiveMetadata["data"]): SourceID[] {
  const focus = syncData?.focus || []
  if (focus.length) return focus
  const hottest = syncData?.hottest || []
  if (hottest.length) return hottest
  return []
}

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  if (!db) throw createError({ statusCode: 500, message: "db is not defined" })
  const userTable = new UserTable(db)
  if (process.env.INIT_TABLE !== "false") await userTable.init()

  const { id } = event.context.user
  if (!id) throw createError({ statusCode: 401, message: "JWT verification failed" })

  const config = await userTable.getConfig(id)
  if (!config.push_enabled || !config.push_webhook) {
    throw createError({ statusCode: 400, message: "未启用推送或未配置 webhook" })
  }

  const syncDataRow = await userTable.getData(id)
  const syncData = syncDataRow.data ? JSON.parse(syncDataRow.data) as PrimitiveMetadata["data"] : undefined
  const sourceIds = pickSourceIds(syncData)
  if (!sourceIds.length) {
    throw createError({ statusCode: 400, message: "没有可推送的数据源" })
  }

  const keywords = config.keywords.map(k => k.toLowerCase())
  const blocked = config.blocked_keywords.map(k => k.toLowerCase())
  const pushed: Array<{ source: SourceID, item: NewsItem }> = []

  for (const id of sourceIds.slice(0, 10)) {
    const getter = getters[id]
    if (!getter) continue
    const items = (await getter()).slice(0, 10)
    for (const item of items) {
      const title = item.title.toLowerCase()
      if (blocked.some(k => title.includes(k))) continue
      if (keywords.length && !keywords.some(k => title.includes(k))) continue
      pushed.push({ source: id, item })
      if (pushed.length >= 20) break
    }
    if (pushed.length >= 20) break
  }

  if (!pushed.length) {
    throw createError({ statusCode: 400, message: "没有匹配到可推送内容" })
  }

  const content = buildMarkdown(pushed)
  let ok = false
  if (config.push_channel === "feishu") ok = await pushToFeishu(config.push_webhook, content)
  else if (config.push_channel === "dingtalk") ok = await pushToDingtalk(config.push_webhook, content)
  else if (config.push_channel === "bark") ok = await pushToBark(config.push_webhook, content)
  else throw createError({ statusCode: 400, message: "不支持的推送渠道" })

  if (!ok) throw createError({ statusCode: 502, message: "推送失败" })

  return {
    success: true,
    count: pushed.length,
  }
})
