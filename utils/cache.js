// utils/cache.js
import { WeatherCache } from "../models/weatherCache.js";

const CACHE_TTL = 1800000; // 30분 (밀리초 단위)

export async function getCachedData(lat, lon, type) {
  try {
    const cache = await WeatherCache.findOne({ lat, lon, type });
    if (cache) {
      const now = Date.now();
      const cacheAge = now - cache.timestamp.getTime();
      if (cacheAge < CACHE_TTL) {
        // 캐시가 유효한 경우
        return cache.data;
      } else {
        // 캐시가 만료된 경우
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("캐시 조회 오류:", error);
    return null;
  }
}

export async function setCachedData(lat, lon, type, data) {
  try {
    await WeatherCache.findOneAndUpdate(
      { lat, lon, type },
      { data, timestamp: Date.now() },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("캐시 업데이트 오류:", error);
  }
}
