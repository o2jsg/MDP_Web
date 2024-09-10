import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
export const getOpenAIResponse = async (prompt, history) => {
  const fullPrompt = `
    다음 대화 내용을 바탕으로 질문에 대해 답해주세요: 
    ${history.join("\n")}
    
    질문: ${prompt}
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: fullPrompt }],
      max_tokens: 500,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI API 에러: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
