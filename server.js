// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import rateLimit from "express-rate-limit";
import { sendCharToSerialPort } from "./controllers/serialPortController.js";
import { connectMongoDB } from "./config/config.js";
import { setupWebSocket } from "./controllers/websocketController.js";
import { alarmRoutes } from "./routes/alarmRoutes.js";
import { openaiRoutes } from "./routes/openaiRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js"; // Weather 라우트 추가
import { setupScheduler } from "./utils/scheduler.js";

const app = express();
const server = http.createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: "*", // 필요 시 특정 도메인으로 제한
    methods: ["GET", "POST"],
  },
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// Rate Limiting 설정 (개발 환경에서는 비활성화 가능)
if (process.env.NODE_ENV === "production") {
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 60, // 최대 60 요청
    message: "1분 동안 너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.",
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res
        .status(429)
        .json({ error: "Too many requests, please try again later." });
    },
  });

  app.use("/api/weather", apiLimiter);
} else {
  console.log("개발 모드: Rate Limiting 비활성화");
}

// MongoDB 연결
connectMongoDB();

// 라우트 설정
app.use("/api/alarms", alarmRoutes);
app.use("/api/openai", openaiRoutes);
app.use("/api/weather", weatherRoutes); // Weather 라우트 추가

// WebSocket 설정
setupWebSocket(io);

// 정적 파일 제공
app.use(express.static(path.join(process.cwd(), "public"))); // __dirname 대신 process.cwd() 사용

// 배치 작업 설정
setupScheduler();

// 서버 시작 (단일 포트 사용)
const apiPort = process.env.API_PORT || 3000;

server.listen(apiPort, () => {
  console.log(`Server is running on http://localhost:${apiPort}`);
});
