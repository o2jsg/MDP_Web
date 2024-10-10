// utils/requestQueue.js
export class RequestQueue {
  constructor(maxRequestsPerMinute) {
    this.queue = [];
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.interval = 60000; // 1분
    this.currentRequests = 0;

    setInterval(() => {
      this.currentRequests = 0;
      this.processQueue();
    }, this.interval);
  }

  enqueue(request) {
    this.queue.push(request);
    this.processQueue();
  }

  async processQueue() {
    while (
      this.queue.length > 0 &&
      this.currentRequests < this.maxRequestsPerMinute
    ) {
      const request = this.queue.shift();
      this.currentRequests++;
      try {
        await request();
      } catch (error) {
        console.error("요청 처리 중 오류 발생:", error);
      }
    }
  }
}
