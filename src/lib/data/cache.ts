// Simple in-memory cache for data adapters
// Prevents redundant fetches during the same session/lifetime

type CacheEntry<T> = {
    timestamp: number;
    data: T;
};

// 10 minutes default TTL
const DEFAULT_TTL = 1000 * 60 * 10;

class InMemoryCache {
    private cache = new Map<string, CacheEntry<any>>();

    get<T>(key: string, ttl = DEFAULT_TTL): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T) {
        this.cache.set(key, {
            timestamp: Date.now(),
            data
        });
    }

    clear() {
        this.cache.clear();
    }
}

export const dataCache = new InMemoryCache();
