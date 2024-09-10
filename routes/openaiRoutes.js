import express from "express";
import { handleOpenAIRequest } from "../controllers/openaiController.js";

const router = express.Router();

// OpenAI API
router.post("/openai", handleOpenAIRequest);

export default router;
