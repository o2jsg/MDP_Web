// utils/fetchWithRetry.js
import { safeFetch } from "./safeFetch.js";

export default async function fetchWithRetry(
  options,
  retries = 3,
  backoff = 1000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await safeFetch(options);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error(
          `API 호출 실패 (시도 ${attempt}): 상태 코드 ${error.response.status}`
        );
      } else if (error.request) {
        console.error(
          `API 호출 실패 (시도 ${attempt}): 응답 없음`,
          error.request
        );
      } else {
        console.error(
          `API 호출 실패 (시도 ${attempt}): 설정 에러`,
          error.message
        );
      }

      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, backoff * Math.pow(2, attempt - 1))
      );
    }
  }
}
