import { sendCharToSerialPort } from "./serialPortController.js";
import { Alarm } from "../models/alarm.js"; // Alarm 모델 불러오기

// WebSocket 연결 설정 및 이벤트 처리
export const setupWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("유저가 연결되었습니다.");

    // 알람 체크 및 전송
    startAlarmCheck(socket);

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
};

// 알람 체크 함수
const startAlarmCheck = (socket) => {
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
          // 알람 시간이 되면 클라이언트로 알람 전송
          socket.emit("alarm-triggered", {
            time: `${alarm.ampmChecker} ${alarm.hour}:${alarm.minute}`,
          });
        }
      });
    } catch (err) {
      console.error("알람 확인 중 오류 발생:", err);
    }
  }, 60000); // 1분마다 알람 확인
};
