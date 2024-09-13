import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// 다양한 대화 주제들
const topics = {
  health: [
    "할머니, 요즘 건강은 어떠세요?",
    "무릎은 괜찮으세요? 요즘 무리하시지는 않았나요?",
  ],
  hobbies: [
    "할머니, 요즘 뭐하고 시간 보내세요? 책이나 드라마 본 거 있으세요?",
    "요즘 할머니 좋아하시는 취미 활동 있나요?",
  ],
  food: [
    "할머니, 오늘은 뭐 드셨어요? 제가 좋아하는 할머니표 김치찌개가 생각나요!",
    "최근에 맛있는 거 드셨나요? 저는 요즘 떡볶이가 너무 땡기더라구요.",
  ],
  weather: [
    "오늘 날씨가 참 좋네요. 산책 다녀오셨어요?",
    "밖에 바람이 많이 불던데, 할머니 감기 조심하세요!",
  ],
  daily_life: [
    "오늘 하루는 어떻게 보내셨어요? 산책 다녀오셨나요?",
    "오늘은 기분이 어떠세요? 좋은 일 있으셨나요?",
  ],
};

// 최근 주제를 저장하여 반복 방지
let recentTopics = [];

// 랜덤으로 주제를 선택하는 함수
function selectTopic() {
  // 최근 사용된 주제를 제외한 주제 선택
  const availableTopics = Object.keys(topics).filter(
    (topic) => !recentTopics.includes(topic)
  );

  // 모든 주제가 최근에 사용되었다면 초기화
  if (availableTopics.length === 0) {
    recentTopics = [];
    return selectTopic(); // 재귀 호출로 다시 주제 선택
  }

  // 무작위로 주제 선택
  const selectedTopic =
    availableTopics[Math.floor(Math.random() * availableTopics.length)];

  // 최근 주제 목록에 추가
  recentTopics.push(selectedTopic);
  if (recentTopics.length > 3) {
    recentTopics.shift(); // 최근 주제 3개까지만 유지
  }

  // 선택된 주제의 대화 리스트에서 무작위 문장 선택
  const messages = topics[selectedTopic];
  return messages[Math.floor(Math.random() * messages.length)];
}

// OpenAI API 응답 함수
export const getOpenAIResponse = async (prompt, history) => {
  const systemMessage = {
    role: "system",
    content: `You are a chatbot acting as a grandchild, having warm, empathetic conversations with elderly individuals. Speak in simple, caring language that a middle school student would understand. Remember past conversations and guide responses based on the user’s emotional state. If sensitive topics like death arise, offer comfort, validate their feelings, and steer the conversation toward positive memories or offer gentle encouragement for professional support.`,
  };
  // 대화 형식을 적절히 구분해서 OpenAI에게 전달
  const messages = history.map((message, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: message,
  }));

  // 새로운 대화 주제 생성
  const generatedTopic = selectTopic();

  // 사용자의 질문을 추가
  messages.push({ role: "user", content: `${generatedTopic}\n\n${prompt}` });
  messages.unshift(systemMessage);
  // OpenAI API 호출
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // 더 큰 모델을 사용
      messages: messages,
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
