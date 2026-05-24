import process from "node:process"

export default defineEventHandler(async () => {
  throw createError({ statusCode: 410, message: "GitHub OAuth has been removed" })
})
