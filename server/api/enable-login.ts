import process from "node:process"

export default defineEventHandler(async () => {
  return {
    enable: Boolean(process.env.JWT_SECRET),
  }
})
