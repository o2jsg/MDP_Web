import express from "express";
import { getOpenAIResponse } from "../controllers/openaiController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const aiResponse = await getOpenAIResponse(prompt, history);
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "OpenAI API 호출 에러" });
  }
});

export const openaiRoutes = router;
