import { Alarm } from "../models/alarm.js";
import dotenv from "dotenv";

// 알람 저장
export const createAlarm = async (req, res) => {
  const { hour, minute, ampmChecker, days } = req.body;
  const newAlarm = new Alarm({ hour, minute, ampmChecker, days });

  try {
    await newAlarm.save();
    res.status(201).json({ success: true, data: newAlarm });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 알람 조회
export const getAlarms = async (req, res) => {
  try {
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
    await Alarm.findByIdAndDelete(alarmId);
    res.status(200).json({ message: "알람 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "알람 삭제 오류", error: err });
  }
};
