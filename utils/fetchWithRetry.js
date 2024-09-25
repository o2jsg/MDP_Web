import { safeFetch } from "./safeFetch.js"; // 올바른 경로로 수정

export default async function fetchWithRetry(url, retries = 3, backoff = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await safeFetch(url);
      return response.data;
    } catch (error) {
      console.error(`API 호출 실패 (시도 ${attempt}):`, error.message);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, backoff * Math.pow(2, attempt - 1))
      );
    }
  }
}
