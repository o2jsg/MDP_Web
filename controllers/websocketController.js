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
const startAlarmCheck = (io) => {
  setInterval(async () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSecond = currentDate.getSeconds(); // 현재 초 단위 추가
    const currentDay = currentDate.getDay();
    let currentAmPm = currentHour >= 12 ? "PM" : "AM"; // 오전/오후 계산
    const adjustedHour = currentHour % 12 || 12; // 12시간제로 변경

    console.log(
      `현재 시각: ${adjustedHour}:${currentMinute}:${currentSecond}, ${currentAmPm}`
    );
    console.log(`현재 요일: ${currentDay}`);

    try {
      const alarms = await Alarm.find({});
      console.log(`저장된 알람 목록: ${JSON.stringify(alarms)}`);

      if (!alarms || alarms.length === 0) {
        console.log("저장된 알람이 없습니다.");
        return;
      }

      alarms.forEach((alarm) => {
        console.log(
          `알람 시간 확인: ${alarm.hour}:${alarm.minute} ${alarm.ampmChecker}, 요일: ${alarm.days}`
        );

        // AM/PM을 비교할 때 "오전"을 "AM"으로, "오후"를 "PM"으로 매핑
        const normalizedAmPm = alarm.ampmChecker === "오전" ? "AM" : "PM";

        // 조건별 로그 추가
        if (alarm.hour === adjustedHour) {
          console.log("시간 일치");
        } else {
          console.log("시간 불일치");
        }
        if (normalizedAmPm === currentAmPm) {
          console.log("AM/PM 일치");
        } else {
          console.log("AM/PM 불일치");
        }

        // 요일 조건 처리 (7은 "매일"을 의미)
        const isDayMatch =
          alarm.days.includes(currentDay) || alarm.days.includes(7); // 7일 경우 매일로 간주
        if (isDayMatch) {
          console.log("요일 일치");
        } else {
          console.log("요일 불일치");
        }

        // ±30초 차이를 고려한 트리거 조건
        if (
          alarm.hour === adjustedHour &&
          normalizedAmPm === currentAmPm && // 정상적으로 매핑된 값 비교
          isDayMatch && // 요일 비교 로직에 매일 포함
          Math.abs(alarm.minute * 60 - (currentMinute * 60 + currentSecond)) <=
            30 // 분과 초 비교
        ) {
          console.log("알람 트리거: 알람 시간이 일치합니다!");
          io.emit("alarm-triggered", {
            time: `${alarm.ampmChecker} ${alarm.hour}:${alarm.minute}`,
          });
          console.log("알람 트리거: 클라이언트로 알람 전송");
        }
      });
    } catch (err) {
      console.error("알람 확인 중 오류 발생:", err);
    }
  }, 60000); // 1분마다 체크
};
