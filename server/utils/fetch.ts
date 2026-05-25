import { AsyncLocalStorage } from "node:async_hooks"
import { ProxyAgent } from "undici"
import { $fetch } from "ofetch"

type FetchProxyContext = {
  useProxy: boolean
  proxyUrl: string
}

const fetchProxyContext = new AsyncLocalStorage<FetchProxyContext>()
const proxyAgents = new Map<string, ProxyAgent>()

function getProxyAgent(proxyUrl: string) {
  let agent = proxyAgents.get(proxyUrl)
  if (!agent) {
    agent = new ProxyAgent(proxyUrl)
    proxyAgents.set(proxyUrl, agent)
  }
  return agent
}

export async function withFetchProxyContext<T>(context: FetchProxyContext, fn: () => Promise<T>) {
  return await fetchProxyContext.run(context, fn)
}

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
  async onRequest({ options }) {
    const context = fetchProxyContext.getStore()
    if (!context?.useProxy || !context.proxyUrl) return
    options.dispatcher = getProxyAgent(context.proxyUrl)
  },
})
