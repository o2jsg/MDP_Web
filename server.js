import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { resolve } from "path";
import { fileURLToPath } from "url";
import path from "path";
console.log("Current directory:", resolve());
import { createAlarm, getAlarms } from "./controllers/alarmController.js"; // 알람 컨트롤러 임포트
import { sendCharToSerialPort } from "./controllers/serialPortController.js";
import { connectMongoDB } from "./config/config.js"; // DB 설정
import { setupWebSocket } from "./controllers/websocketController.js"; // WebSocket 설정
import { alarmRoutes } from "./routes/alarmRoutes.js"; // 알람 관련 라우트
import { openaiRoutes } from "./routes/openaiRoutes.js"; // OpenAI API 라우트

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
connectMongoDB();

// 라우트 설정
app.use("/api/alarms", alarmRoutes); // 알람 관련 API
app.use("/api/openai", openaiRoutes); // OpenAI API

// WebSocket 설정
setupWebSocket(io);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 서버 시작
const apiPort = process.env.API_PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;

// WebSocket 설정 부분에 추가
io.on("connection", (socket) => {
  console.log("클라이언트가 연결되었습니다.");

  // 강제 트리거 테스트
  setTimeout(() => {
    io.emit("alarm-triggered", { time: "10:00 AM" });
    console.log("강제 알람 트리거 발생");
  }, 5000); // 5초 후에 알람 트리거

  // 클라이언트로부터 문자 수신
  socket.on("send-char", (char) => {
    console.log("클라이언트로부터 문자 수신:", char);
    sendCharToSerialPort(char); // Serial Port로 문자 전송
  });

  // 연결 해제 처리
  socket.on("disconnect", () => {
    console.log("유저 연결 해제");
  });
});

server.listen(apiPort, () => {
  console.log(`Server is running on http://localhost:${apiPort}`);
});

io.listen(wsPort, () => {
  console.log(`WebSocket Server is running on http://localhost:${wsPort}`);
});
