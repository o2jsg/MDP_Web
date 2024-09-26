// routes/weatherRoutes.js
import express from "express";
import fetchWithRetry from "../utils/fetchWithRetry.js";
import { getCachedData, setCachedData } from "../utils/cache.js";
import { WeatherCache } from "../models/weatherCache.js"; // 추가

const router = express.Router();
const API_KEY = process.env.OPENWEATHER_API_KEY;

// 현재 날씨 라우트
router.get("/current", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return res
      .status(400)
      .json({ error: "위도(lat)와 경도(lon)이 필요합니다." });

  try {
    // 캐시 조회
    const cachedData = await getCachedData(lat, lon, "current");
    if (cachedData) {
      console.log("캐시된 현재 날씨 데이터 제공");
      return res.json(cachedData);
    }

    // API 호출
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const params = {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      lang: "kr",
    };
    const data = await fetchWithRetry({ url, params });

    // 캐시 업데이트
    await setCachedData(lat, lon, "current", data);

    res.json(data);
  } catch (error) {
    console.error("현재 날씨 데이터 제공 실패:", error.message);

    // 캐시된 데이터가 있는지 다시 확인하여 응답
    try {
      const fallbackCache = await WeatherCache.findOne({
        lat,
        lon,
        type: "current",
      });
      if (fallbackCache && fallbackCache.data) {
        console.warn("새로운 API 호출 실패. 기존 캐시된 데이터 제공.");
        return res.json(fallbackCache.data);
      }
    } catch (cacheError) {
      console.error("캐시 조회 중 오류 발생:", cacheError.message);
    }

    res
      .status(500)
      .json({ error: "현재 날씨 데이터를 가져오는 데 실패했습니다." });
  }
});

// 미세먼지 (Air Quality) 라우트
router.get("/air_quality", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return res
      .status(400)
      .json({ error: "위도(lat)와 경도(lon)이 필요합니다." });

  try {
    // 캐시 조회
    const cachedData = await getCachedData(lat, lon, "air_quality");
    if (cachedData) {
      console.log("캐시된 미세먼지 데이터 제공");
      return res.json(cachedData);
    }

    // API 호출
    const url = `https://api.openweathermap.org/data/2.5/air_pollution`;
    const params = {
      lat,
      lon,
      appid: API_KEY,
    };
    const data = await fetchWithRetry({ url, params });

    // 캐시 업데이트
    await setCachedData(lat, lon, "air_quality", data);

    res.json(data);
  } catch (error) {
    console.error("미세먼지 데이터 제공 실패:", error.message);

    // 캐시된 데이터가 있는지 다시 확인하여 응답
    try {
      const fallbackCache = await WeatherCache.findOne({
        lat,
        lon,
        type: "air_quality",
      });
      if (fallbackCache && fallbackCache.data) {
        console.warn("새로운 API 호출 실패. 기존 캐시된 데이터 제공.");
        return res.json(fallbackCache.data);
      }
    } catch (cacheError) {
      console.error("캐시 조회 중 오류 발생:", cacheError.message);
    }

    res
      .status(500)
      .json({ error: "미세먼지 데이터를 가져오는 데 실패했습니다." });
  }
});

// 주간 날씨 라우트
router.get("/weekly_forecast", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return res
      .status(400)
      .json({ error: "위도(lat)와 경도(lon)이 필요합니다." });

  try {
    // 캐시 조회
    const cachedData = await getCachedData(lat, lon, "weekly_forecast");
    if (cachedData) {
      console.log("캐시된 주간 날씨 데이터 제공");
      return res.json(cachedData);
    }

    // API 호출
    const url = `https://api.openweathermap.org/data/2.5/forecast`;
    const params = {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      lang: "kr",
    };
    const data = await fetchWithRetry({ url, params });

    // 캐시 업데이트
    await setCachedData(lat, lon, "weekly_forecast", data);

    res.json(data);
  } catch (error) {
    console.error("주간 날씨 데이터 제공 실패:", error.message);

    // 캐시된 데이터가 있는지 다시 확인하여 응답
    try {
      const fallbackCache = await WeatherCache.findOne({
        lat,
        lon,
        type: "weekly_forecast",
      });
      if (fallbackCache && fallbackCache.data) {
        console.warn("새로운 API 호출 실패. 기존 캐시된 데이터 제공.");
        return res.json(fallbackCache.data);
      }
    } catch (cacheError) {
      console.error("캐시 조회 중 오류 발생:", cacheError.message);
    }

    res
      .status(500)
      .json({ error: "주간 날씨 데이터를 가져오는 데 실패했습니다." });
  }
});

export default router;
