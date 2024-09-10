import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import http from "http";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { SerialPort } from "serialport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const apiPort = 3000;
const wsPort = 3001;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

console.log("MongoDB URI:", mongoUri); // 환경 변수 출력
if (!mongoUri) {
  throw new Error("MongoDB URI가 설정되지 않았습니다. .env 파일을 확인하세요.");
}
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB에 성공적으로 연결되었습니다.");
  })
  .catch((err) => {
    console.error("MongoDB 연결 중 오류 발생:", err);
  });
// MongoDB 연결
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB에 성공적으로 연결되었습니다.");
  })
  .catch((err) => {
    console.error("MongoDB 연결 중 오류 발생:", err);
  });
// 알람 스키마 정의
const alarmSchema = new mongoose.Schema({
  hour: Number,
  minute: Number,
  ampmChecker: String,
  days: [Number],
});

const Alarm = mongoose.model("Alarm", alarmSchema);

// 알림 저장 API (POST)
app.post("/api/alarms", async (req, res) => {
  const { hour, minute, ampmChecker, days } = req.body;
  const newAlarm = new Alarm({ hour, minute, ampmChecker, dasys });
  try {
    await newAlarm.save();
    res.status(201).json({ success: true, data: newAlarm });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
// 저장된 알람 불러오기 API (GET)
app.get("/api/alarms", async (req, res) => {
  try {
    const alarms = await Alarm.find({});
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 알람 삭제 API
app.delete("/api/alarms/:id", async (req, res) => {
  try {
    const alarmId = req.params.id;
    await Alarm.findByIdAndDelete(alarmId);
    res.status(200).json({ message: "알람 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "알람 삭제 오류", error: err });
  }
});
// WebSocket을 사용해 알람을 실시간 전송
io.on("connection", (socket) => {
  console.log("유저가 연결되었습니다.");

  checkAlarms(socket); // 유저 연결 시 알람 체크 시작

  socket.on("disconnect", () => {
    console.log("유저가 연결을 끊었습니다.");
  });
});
// 알람 시간 체크 함수 (MongoDB에서 알람 불러와 확인)
function checkAlarms(socket) {
  setInterval(async () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentDay = currentDate.getDay();
    const currentAmPm = currentHour >= 12 ? "PM" : "AM";
    const adjustedHour = currentHour % 12 || 12;

    try {
      const alarms = await Alarm.find({});
      alarms.forEach((alarm) => {
        if (
          alarm.hour === adjustedHour &&
          alarm.minute === currentMinute &&
          alarm.ampmChecker === currentAmPm &&
          alarm.days.includes(currentDay)
        ) {
          // 알람 시간이 되면 모든 클라이언트로 알람 전송
          socket.emit("alarm-triggered", {
            time: `${alarm.ampmChecker} ${alarm.hour}:${alarm.minute}`,
          });
        }
      });
    } catch (err) {
      console.error("알람 확인 중 오류 발생:", err);
    }
  }, 60000); // 1분마다 알람 확인
}

// OPENAI API 호출
app.post("/api/openai", async (req, res) => {
  const { prompt, history } = req.body;

  const fullPrompt = `
    당신은 독거노인을 도와주는 손주입니다. 다음은 최근 대화 요약입니다:
    ${history.join("\n")}
    
    할아버지(또는 할머니)는 요즘 건강이 조금 좋지 않으시니, 부드럽고 친절한 어조로 대답해주세요. 

    다음 질문에 대해 대답해주세요: ${prompt}

    어린아이가 할아버지에게 이야기하듯, 유쾌하고 밝게 대답해주세요.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer sk-proj-wrfIcUSCevzGuCOPPilMT3BlbkFJa1GnlHpdKeDVi9r1roKY`,
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: fullPrompt }],
        max_tokens: 500,
        temperature: 1,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.6,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error during API call:", error);
    res
      .status(500)
      .json({ error: "Could not fetch response from OpenAI API." });
  }
});

app.listen(apiPort, () => {
  console.log(`Server is running on http://localhost:${apiPort}`);
});

// 시리얼 포트 설정 (포트 이름과 보드레이트를 실제 값으로 변경)
const portName = "COM5"; // 실제 사용 중인 포트 이름
const baudRate = 9600; // 보드레이트
const serialPort = new SerialPort({ path: portName, baudRate: baudRate });

// 시리얼 포트 에러 처리
serialPort.on("error", (err) => {
  console.error("시리얼 포트 에러", err.message);
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 클라이언트가 연결되었을 때
io.on("connection", (socket) => {
  console.log("유저와 연결되었습니다");

  socket.on("send-char", (char) => {
    console.log(`Sending character: ${char}`);
    serialPort.write(char, (err) => {
      if (err) {
        return console.log("Error on write: ", err.message);
      }
      console.log("message written");
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// 서버 시작
server.listen(wsPort, () => {
  console.log(`WebSocket Server started on http://localhost:${wsPort}`);
});
