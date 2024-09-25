// utils/cache.js
import { WeatherCache } from "../models/weatherCache.js";

// 캐시 조회 함수
export async function getCachedData(lat, lon, type) {
  try {
    const cache = await WeatherCache.findOne({ lat, lon, type });
    return cache ? cache.data : null;
  } catch (error) {
    console.error("캐시 조회 오류:", error);
    return null;
  }
}

// 캐시 저장 함수
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
