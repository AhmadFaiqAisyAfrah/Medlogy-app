// app/api/owid/cache.ts
type CacheEntry<T> = {
    timestamp: number
    data: T
}

const CACHE_TTL = 1000 * 60 * 10 // 10 menit
const cache = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | null {
    const entry = cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key)
        return null
    }

    return entry.data as T
}

export function setCache<T>(key: string, data: T) {
    cache.set(key, {
        timestamp: Date.now(),
        data,
    })
}
