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

export const alarmRoutes = router;
