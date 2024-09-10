import { SerialPort } from "serialport";

const portName = "COM5"; // 실제 사용 중인 포트 이름
const baudRate = 9600; // 보드레이트 설정
const serialPort = new SerialPort({ path: portName, baudRate: baudRate });

serialPort.on("error", (err) => {
  console.error("시리얼 포트 에러:", err.message);
});

// 시리얼 데이터를 보낼 함수
export const sendCharToSerialPort = (char) => {
  serialPort.write(char, (err) => {
    if (err) {
      return console.error("시리얼 포트 쓰기 오류:", err.message);
    }
    console.log("시리얼 포트에 데이터 전송 완료:", char);
  });
};
