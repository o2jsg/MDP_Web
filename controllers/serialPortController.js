// controllers/serialPortController.js
import { SerialPort } from "serialport";

const portName = process.env.SERIAL_PORT || "COM7";
const baudRate = parseInt(process.env.BAUD_RATE) || 9600;

export const serialPort = new SerialPort({
  path: portName,
  baudRate: baudRate,
});

serialPort.on("error", (err) => {
  console.error("시리얼 포트 에러:", err.message);
});

export const sendCharToSerialPort = (data) => {
  serialPort.write(data, (err) => {
    if (err) {
      console.error("시리얼 포트 전송 에러:", err.message);
    } else {
      console.log("데이터 전송 성공:", data);
    }
  });
};
