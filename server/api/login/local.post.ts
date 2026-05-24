import { SignJWT } from "jose"
import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  if (!db) throw createError({ statusCode: 500, message: "db is not defined" })
  const userTable = new UserTable(db)
  if (process.env.INIT_TABLE !== "false") await userTable.init()

  const body = await readBody<{ username?: string, password?: string }>(event)
  const username = body?.username?.trim()
  const password = body?.password?.trim()
  if (!username || !password) {
    throw createError({ statusCode: 400, message: "用户名和密码不能为空" })
  }

  const user = await userTable.verifyLocalUser(username, password)
  if (!user) {
    throw createError({ statusCode: 401, message: "用户名或密码错误" })
  }

  const jwtToken = await new SignJWT({
    id: user.id,
    type: user.type,
  })
    .setExpirationTime("60d")
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

  return {
    success: true,
    jwt: jwtToken,
    user: {
      name: user.username,
      avatar: "",
      type: user.type,
    },
  }
})
