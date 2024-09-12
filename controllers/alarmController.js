import { Alarm } from "../models/alarm.js";

const daysMap = {
  0: "일요일",
  1: "월요일",
  2: "화요일",
  3: "수요일",
  4: "목요일",
  5: "금요일",
  6: "토요일",
  7: "매일",
};

// 알람 저장
export const createAlarm = async (req, res) => {
  const { hour, minute, ampmChecker, days } = req.body;
  const daysArray = days.length === 0 ? [7] : days;
  const daysString = daysArray.map((day) => daysMap[day]).join(", ");
  const newAlarm = new Alarm({ hour, minute, ampmChecker, days: daysString });

  try {
    console.log(newAlarm);
    await newAlarm.save();
    console.log("알람 저장 완료");
    res.status(201).json({ success: true, data: newAlarm });
  } catch (err) {
    console.log("알람 저장 실패");
    res.status(400).json({ success: false, message: err.message });
  }
};

// 알람 조회
export const getAlarms = async (req, res) => {
  try {
    console.log("알람 조회");
    const alarms = await Alarm.find({});
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 알람 삭제
export const deleteAlarm = async (req, res) => {
  try {
    const alarmId = req.params.id;
    const deletedAlarm = await Alarm.findByIdAndDelete(alarmId);
    if (!deletedAlarm) {
      return res
        .status(404)
        .json({ success: false, message: "알람을 찾을 수 없습니다." });
    }
    res.status(200).json({ success: true, message: "알람 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "알람 삭제 오류", error: err });
  }
};
