import { LRUCache } from 'lru-cache'

const options = {
  max: 50, // number of cache entries to keep
  
  ttl: 1000 * 60 * 60,// how long to live in ms | 1 hour
};

const _Hour = 1000 * 60 * 60;

export const cacheDB = ()=>{
    const cache = new LRUCache(options);
    
    return {
        raw : cache,
        size : () => cache.size,
        get : (key : string | number) => cache.get(key),
        set : ( value : any) => {
            const nextKey = Math.random().toString(31).slice(3);
            cache.set(nextKey, value);
            return nextKey;
        },
        setWithCustomTTL : (value : any,hours : number) => {
            const nextKey = Math.random().toString(31).slice(3);
            cache.set(nextKey, value, {ttl :  _Hour *  24 * hours});
            return nextKey;
        },
        delete : (key : string) => cache.delete(key),
        has: (key : string) => cache.has(key),
        entries : () => {
            return [...cache.keys()]
        },
        clear : () => cache.clear()
    }

}

