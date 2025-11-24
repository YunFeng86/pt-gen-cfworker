import { createApp } from '../app.js'
import { CloudflareKVStorage } from '../storage/cloudflare.js'
import page from '../../index.html'

/**
 * Cloudflare Workers 入口
 */

// 缓存应用实例（按环境变量哈希）
let cachedApp = null
let cachedEnvHash = null

function getEnvHash(env) {
  return `${env.APIKEY}-${env.DISABLE_SEARCH}-${env.CACHE_TTL}-${env.TMDB_API_KEY}`
}

export default {
  async fetch(request, env, ctx) {
    const envHash = getEnvHash(env)

    // 如果环境变量未变化，复用缓存的应用实例
    if (!cachedApp || cachedEnvHash !== envHash) {
      const storage = new CloudflareKVStorage(env.PT_GEN_STORE)
      cachedApp = createApp(storage, {
        apikey: env.APIKEY,
        disableSearch: env.DISABLE_SEARCH === 'true',
        cacheTTL: env.CACHE_TTL ? Number(env.CACHE_TTL) : undefined,
        htmlPage: page,
        tmdbApiKey: env.TMDB_API_KEY,
        doubanCookie: env.DOUBAN_COOKIE,
        indienovaCookie: env.INDIENOVA_COOKIE
      })
      cachedEnvHash = envHash
    }

    return cachedApp.fetch(request, env, ctx)
  }
}
