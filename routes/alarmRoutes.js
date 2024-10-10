import express from "express";
import { Alarm } from "../models/alarm.js"; // 알람 스키마

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newAlarm = new Alarm(req.body);
    await newAlarm.save();
    res.status(201).json({ success: true, data: newAlarm });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const alarms = await Alarm.find({});
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAlarm = await Alarm.findByIdAndDelete(id);
    if (!deletedAlarm) {
      return res
        .status(404)
        .json({ success: false, message: "알람을 찾을 수 없습니다." });
    }
    res.status(200).json({ success: true, message: "알람이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export const alarmRoutes = router;
