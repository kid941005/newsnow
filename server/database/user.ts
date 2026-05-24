import type { Database } from "db0"
import type { UserInfo } from "#/types"
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto"

export interface LocalRegisterInput {
  username: string
  password: string
}

export interface UserConfigData {
  keywords: string[]
  blocked_keywords: string[]
  keyword_tags: Record<string, string[]>
  push_enabled: boolean
  push_channel: string
  push_webhook: string
  push_cron: string
}

export interface UserConfigRow {
  user_id: string
  keywords: string
  blocked_keywords: string
  keyword_tags: string
  push_enabled: number
  push_channel: string
  push_webhook: string
  push_cron: string
  updated: number
}

const DEFAULT_CONFIG: UserConfigData = {
  keywords: [],
  blocked_keywords: [],
  keyword_tags: {},
  push_enabled: false,
  push_channel: "feishu",
  push_webhook: "",
  push_cron: "0 */4 * * *",
}

function hashPassword(password: string) {
  const salt = randomBytes(16)
  const digest = pbkdf2Sync(password, salt, 100000, 32, "sha256")
  return `pbkdf2_sha256$100000$${salt.toString("base64")}$${digest.toString("base64")}`
}

function verifyPassword(password: string, storedHash: string) {
  if (!storedHash.startsWith("pbkdf2_sha256$")) return false
  const [, iterations, saltB64, digestB64] = storedHash.split("$", 4)
  const salt = Buffer.from(saltB64, "base64")
  const expected = Buffer.from(digestB64, "base64")
  const actual = pbkdf2Sync(password, salt, Number(iterations), expected.length, "sha256")
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class UserTable {
  private db
  constructor(db: Database) {
    this.db = db
  }

  async init() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        email TEXT,
        username TEXT,
        password_hash TEXT,
        data TEXT,
        type TEXT,
        created INTEGER,
        updated INTEGER
      );
    `).run()
    await this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);
    `).run()
    await this.db.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON user(username);
    `).run()
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS user_config (
        user_id TEXT PRIMARY KEY,
        keywords TEXT,
        blocked_keywords TEXT,
        keyword_tags TEXT,
        push_enabled INTEGER,
        push_channel TEXT,
        push_webhook TEXT,
        push_cron TEXT,
        updated INTEGER
      );
    `).run()
    logger.success(`init user table`)
  }

  async addUser(id: string, email: string, type: "github") {
    const u = await this.getUser(id)
    const now = Date.now()
    if (!u) {
      await this.db.prepare(`INSERT INTO user (id, email, username, password_hash, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, email, "", "", "", type, now, now)
      await this.ensureUserConfig(id)
      logger.success(`add user ${id}`)
    } else if (u.email !== email && u.type !== type) {
      await this.db.prepare(`UPDATE user SET email = ?, updated = ? WHERE id = ?`).run(email, now, id)
      logger.success(`update user ${id} email`)
    } else {
      logger.info(`user ${id} already exists`)
    }
  }

  async createLocalUser(input: LocalRegisterInput) {
    const username = input.username.trim()
    if (!username || !input.password) throw new Error("用户名和密码不能为空")
    const existed = await this.getUserByUsername(username)
    if (existed) throw new Error("用户名已存在")
    const now = Date.now()
    const id = `local:${username}`
    await this.db.prepare(`INSERT INTO user (id, email, username, password_hash, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, "", username, hashPassword(input.password), "", "local", now, now)
    await this.ensureUserConfig(id)
    return this.getUser(id)
  }

  async verifyLocalUser(username: string, password: string) {
    const user = await this.getUserByUsername(username.trim())
    if (!user || user.type !== "local" || !user.password_hash) return null
    if (!verifyPassword(password, user.password_hash)) return null
    return user
  }

  async getUser(id: string) {
    return (await this.db.prepare(`SELECT id, email, username, password_hash, data, type, created, updated FROM user WHERE id = ?`).get(id)) as UserInfo
  }

  async getUserByUsername(username: string) {
    return (await this.db.prepare(`SELECT id, email, username, password_hash, data, type, created, updated FROM user WHERE username = ?`).get(username)) as UserInfo
  }

  async setData(key: string, value: string, updatedTime = Date.now()) {
    const state = await this.db.prepare(
      `UPDATE user SET data = ?, updated = ? WHERE id = ?`,
    ).run(value, updatedTime, key)
    if (!state.success) throw new Error(`set user ${key} data failed`)
    logger.success(`set ${key} data`)
  }

  async getData(id: string) {
    const row: any = await this.db.prepare(`SELECT data, updated FROM user WHERE id = ?`).get(id)
    if (!row) throw new Error(`user ${id} not found`)
    logger.success(`get ${id} data`)
    return row as {
      data: string
      updated: number
    }
  }

  async ensureUserConfig(userId: string) {
    const existed = await this.db.prepare(`SELECT user_id FROM user_config WHERE user_id = ?`).get(userId)
    if (existed) return
    const now = Date.now()
    await this.db.prepare(`INSERT INTO user_config (user_id, keywords, blocked_keywords, keyword_tags, push_enabled, push_channel, push_webhook, push_cron, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        userId,
        JSON.stringify(DEFAULT_CONFIG.keywords),
        JSON.stringify(DEFAULT_CONFIG.blocked_keywords),
        JSON.stringify(DEFAULT_CONFIG.keyword_tags),
        0,
        DEFAULT_CONFIG.push_channel,
        DEFAULT_CONFIG.push_webhook,
        DEFAULT_CONFIG.push_cron,
        now,
      )
  }

  async getConfig(userId: string): Promise<UserConfigData & { updated: number }> {
    await this.ensureUserConfig(userId)
    const row = await this.db.prepare(`SELECT user_id, keywords, blocked_keywords, keyword_tags, push_enabled, push_channel, push_webhook, push_cron, updated FROM user_config WHERE user_id = ?`).get(userId) as UserConfigRow
    if (!row) throw new Error(`user config ${userId} not found`)
    return {
      keywords: safeJsonParse(row.keywords, []),
      blocked_keywords: safeJsonParse(row.blocked_keywords, []),
      keyword_tags: safeJsonParse(row.keyword_tags, {}),
      push_enabled: Boolean(row.push_enabled),
      push_channel: row.push_channel || DEFAULT_CONFIG.push_channel,
      push_webhook: row.push_webhook || "",
      push_cron: row.push_cron || DEFAULT_CONFIG.push_cron,
      updated: row.updated || Date.now(),
    }
  }

  async updateConfig(userId: string, config: Partial<UserConfigData>) {
    const current = await this.getConfig(userId)
    const next: UserConfigData = {
      keywords: config.keywords ?? current.keywords,
      blocked_keywords: config.blocked_keywords ?? current.blocked_keywords,
      keyword_tags: config.keyword_tags ?? current.keyword_tags,
      push_enabled: config.push_enabled ?? current.push_enabled,
      push_channel: config.push_channel ?? current.push_channel,
      push_webhook: config.push_webhook ?? current.push_webhook,
      push_cron: config.push_cron ?? current.push_cron,
    }
    const updated = Date.now()
    const state = await this.db.prepare(`UPDATE user_config SET keywords = ?, blocked_keywords = ?, keyword_tags = ?, push_enabled = ?, push_channel = ?, push_webhook = ?, push_cron = ?, updated = ? WHERE user_id = ?`)
      .run(
        JSON.stringify(next.keywords),
        JSON.stringify(next.blocked_keywords),
        JSON.stringify(next.keyword_tags),
        next.push_enabled ? 1 : 0,
        next.push_channel,
        next.push_webhook,
        next.push_cron,
        updated,
        userId,
      )
    if (!state.success) throw new Error(`update user config ${userId} failed`)
    return { ...next, updated }
  }

  async deleteUser(key: string) {
    await this.db.prepare(`DELETE FROM user_config WHERE user_id = ?`).run(key)
    const state = await this.db.prepare(`DELETE FROM user WHERE id = ?`).run(key)
    if (!state.success) throw new Error(`delete user ${key} failed`)
    logger.success(`delete user ${key}`)
  }
}
