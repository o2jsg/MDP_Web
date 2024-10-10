import express from "express";
import alarmRoutes from "./alarmRoutes.js";
import openaiRoutes from "./openaiRoutes.js";

const router = express.Router();

router.use("/api", alarmRoutes);
router.use("/api", openaiRoutes);

export default router;
