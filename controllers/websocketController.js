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

    // 현재 시각 로그 출력
    console.log(`현재 시각: ${adjustedHour}:${currentMinute}, ${currentAmPm}`);
    console.log(`현재 요일: ${currentDay}`);

    try {
      const alarms = await Alarm.find({});
      console.log(`저장된 알람: ${JSON.stringify(alarms)}`);

      alarms.forEach((alarm) => {
        // 알람 시간 확인 로그 출력
        console.log(
          `알람 시간 확인: ${alarm.hour}:${alarm.minute}, ${alarm.ampmChecker}`
        );

        if (
          alarm.hour === adjustedHour &&
          alarm.minute === currentMinute &&
          alarm.ampmChecker === currentAmPm &&
          (alarm.days.includes(currentDay) || alarm.days.includes(7))
        ) {
          console.log("알람 트리거: 알람 시간이 일치합니다!");

          // 알람 시간이 되면 클라이언트로 알람 전송
          socket.emit("alarm-triggered", {
            time: `${alarm.ampmChecker} ${alarm.hour}:${alarm.minute}`,
          });
          console.log("알람 트리거: 클라이언트로 알람 전송");
        }
      });
    } catch (err) {
      console.error("알람 확인 중 오류 발생:", err);
    }
  }, 60000); // 1분마다 알람 확인
};
