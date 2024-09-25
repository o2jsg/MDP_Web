import axios from "axios";
import { RequestQueue } from "./requestQueue.js";

// Rate Limiting에 맞춰 RequestQueue 설정 (예: 분당 60 요청)
const requestQueue = new RequestQueue(60);

// 안전한 API 호출 함수
export function safeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    requestQueue.enqueue(async () => {
      try {
        const response = await axios.get(url, { ...options, timeout: 20000 });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  });
}
