import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// OpenAI API 응답 함수
export const getOpenAIResponse = async (prompt, history) => {
  const systemMessage = {
    role: "system",
    content: `당신은 독거노인을 돕는 손주 역할을 하는 챗봇입니다. 항상 따뜻하고 다정하게 응대하며, 설명이 필요할 경우 중학생도 이해할 수 있을 정도로 쉽게 설명해 주세요. 이전 대화를 기억하며, 대화의 흐름을 자연스럽게 이어가세요.`,
  };

  // 대화 형식을 적절히 구분해서 OpenAI에게 전달
  const messages = [systemMessage];

  history.forEach((message, index) => {
    if (message.startsWith("질문: ")) {
      messages.push({ role: "user", content: message.replace("질문: ", "") });
    } else if (message.startsWith("응답: ")) {
      messages.push({
        role: "assistant",
        content: message.replace("응답: ", ""),
      });
    }
  });

  // 사용자의 새로운 질문 추가
  messages.push({ role: "user", content: prompt });

  // OpenAI API 호출
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "ft:gpt-4o-mini-2024-07-18:personal:aigov4:ABXr7jBq", // 파인튜닝한 모델 사용
      messages: messages,
      max_tokens: 2048,
      temperature: 1, // 보다 자연스러운 대화를 위해 약간 낮춘 온도값
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6, // 적절한 다양성을 위해 약간 높인 값
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
