import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  if (!db) throw createError({ statusCode: 500, message: "db is not defined" })
  const userTable = new UserTable(db)
  if (process.env.INIT_TABLE !== "false") await userTable.init()

  const { id } = event.context.user
  if (!id) throw createError({ statusCode: 401, message: "JWT verification failed" })

  if (event.method === "GET") {
    const config = await userTable.getConfig(id)
    return { success: true, config }
  }

  if (event.method === "POST") {
    const body = await readBody(event)
    const config = await userTable.updateConfig(id, body || {})
    return { success: true, config }
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" })
})
