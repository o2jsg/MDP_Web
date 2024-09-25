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
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
            break;
          case "air_quality":
            url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            break;
          case "weekly_forecast":
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
            break;
          default:
            console.warn(`알 수 없는 타입: ${type}`);
            continue;
        }

        try {
          const data = await fetchWithRetry(url);
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
        }
      }
      console.log("배치 작업: 데이터 업데이트 완료");
    } catch (error) {
      console.error("배치 작업 중 오류 발생:", error.message);
    }
  });
};
