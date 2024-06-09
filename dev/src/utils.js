"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheDB = void 0;
const lru_cache_1 = require("lru-cache");
const options = {
    max: 50, // number of cache entries to keep
    ttl: 1000 * 60 * 60, // how long to live in ms | 1 hour
};
const _Hour = 1000 * 60 * 60;
const cacheDB = () => {
    const cache = new lru_cache_1.LRUCache(options);
    return {
        raw: cache,
        size: () => cache.size,
        get: (key) => cache.get(key),
        set: (value) => {
            const nextKey = Math.random().toString(31).slice(3);
            cache.set(nextKey, value);
            return nextKey;
        },
        setWithCustomTTL: (value, hours) => {
            const nextKey = Math.random().toString(31).slice(3);
            cache.set(nextKey, value, { ttl: _Hour * 24 * hours });
            return nextKey;
        },
        delete: (key) => cache.delete(key),
        has: (key) => cache.has(key),
        entries: () => {
            return [...cache.keys()];
        },
        clear: () => cache.clear()
    };
};
exports.cacheDB = cacheDB;
