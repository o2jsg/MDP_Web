// utils/scheduler.js
import cron from "node-cron";
import { WeatherCache } from "../models/weatherCache.js";
import fetchWithRetry from "./fetchWithRetry.js";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

// 배치 작업 설정: 매 시간 정각에 실행
export const setupScheduler = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("배치 작업: 데이터 업데이트 시작");

    try {
      const caches = await WeatherCache.find({});
      for (const cache of caches) {
        const { lat, lon, type } = cache;
        let url = "";

        switch (type) {
          case "current":
            url = `https://api.openweathermap.org/data/2.5/weather`;
            break;
          case "air_quality":
            url = `https://api.openweathermap.org/data/2.5/air_pollution`;
            break;
          case "weekly_forecast":
            url = `https://api.openweathermap.org/data/2.5/forecast`;
            break;
          default:
            console.warn(`알 수 없는 타입: ${type}`);
            continue;
        }

        const params = {
          lat,
          lon,
          appid: API_KEY,
          units: type === "air_quality" ? undefined : "metric",
          lang: type === "air_quality" ? undefined : "kr",
        };

        try {
          console.log(`배치 작업: API 호출 - ${url} with params:`, params);
          const data = await fetchWithRetry({ url, params });
          await WeatherCache.findOneAndUpdate(
            { lat, lon, type },
            { data, timestamp: Date.now() },
            { upsert: true, new: true }
          );
          console.log(`데이터 업데이트 성공: (${lat}, ${lon}, ${type})`);
        } catch (error) {
          console.error(
            `데이터 업데이트 실패: (${lat}, ${lon}, ${type})`,
            error.message
          );
          // API 호출 실패 시, 기존 캐시 데이터는 유지됩니다.
        }
      }
      console.log("배치 작업: 데이터 업데이트 완료");
    } catch (error) {
      console.error("배치 작업 중 오류 발생:", error.message);
    }
  });
};
