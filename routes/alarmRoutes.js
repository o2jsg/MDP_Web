import express from "express";
import {
  createAlarm,
  getAlarms,
  deleteAlarm,
} from "../controllers/alarmController.js";

const router = express.Router();

// 알람 API
router.post("/alarms", createAlarm);
router.get("/alarms", getAlarms);
router.delete("/alarms/:id", deleteAlarm);

export default router;
