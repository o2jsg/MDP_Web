// utils/safeFetch.js
import axios from "axios";
import { RequestQueue } from "./requestQueue.js";

const requestQueue = new RequestQueue(60); // 분당 60 요청 제한

// 안전한 API 호출 함수
export function safeFetch(options) {
  return new Promise((resolve, reject) => {
    requestQueue.enqueue(async () => {
      try {
        console.log(
          `Fetching URL: ${options.url} with params:`,
          options.params
        );
        const response = await axios.get(options.url, {
          params: options.params,
          timeout: 30000, // 타임아웃 30초로 증가
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  });
}
