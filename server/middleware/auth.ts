import process from "node:process"
import { jwtVerify } from "jose"

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith("/api")) return

  const publicLocalAuthPaths = [
    "/api/register",
    "/api/login/local",
    "/api/enable-login",
    "/api/latest",
    "/api/mcp",
    "/api/s",
    "/api/proxy",
  ]

  const requiresUser = ["/api/me"].some(p => url.pathname.startsWith(p))
  const isPublicLocalAuthPath = publicLocalAuthPaths.some(p => url.pathname.startsWith(p))

  if (!process.env.JWT_SECRET) {
    event.context.disabledLogin = true
    if (!isPublicLocalAuthPath) {
      throw createError({ statusCode: 506, message: "Server not configured, disable login" })
    }
    return
  }

  event.context.disabledLogin = false

  if (requiresUser) {
    const token = getHeader(event, "Authorization")?.replace(/Bearer\s*/, "")?.trim()
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) as { payload?: { id: string, type: string } }
        if (payload?.id) {
          event.context.user = {
            id: payload.id,
            type: payload.type,
          }
        }
      } catch {
        throw createError({ statusCode: 401, message: "JWT verification failed" })
      }
    } else {
      throw createError({ statusCode: 401, message: "JWT verification failed" })
    }
  }
})
