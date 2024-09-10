const socket = io("http://localhost:3001");
const alarmSound = new Audio("/music/medicine.mp3");

socket.on("alarm-triggered", (data) => {
  alarmSound.play();
  if (confirm(`알람 시간: ${data.time}. 알람을 멈추시겠습니까?`)) {
    alarmSound.pause();
  }
});

document.getElementById("backButton").addEventListener("click", () => {
  window.history.back();
});

// Web Speech API 설정
window.addEventListener("DOMContentLoaded", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    // OpenAI API 호출
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: transcript,
        history: conversationHistory,
      }),
    });
    const data = await response.json();
    const aiResponse = data.response;

    // TTS로 응답 출력
    const utterance = new SpeechSynthesisUtterance(aiResponse);
    speechSynthesis.speak(utterance);
  };

  recognition.start();
});
