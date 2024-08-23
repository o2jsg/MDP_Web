const conversationHistory = [];

window.addEventListener("DOMContentLoaded", () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("이 브라우저에서는 Web Speech API를 지원하지 않습니다.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("transcript").textContent = transcript;

    conversationHistory.push(`질문: ${transcript}`);
    const recentHistory = conversationHistory.slice(-5);

    try {
      const response = await fetch("http://localhost:3000/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: transcript,
          history: recentHistory, // 대화 히스토리 전송
        }),
      });

      const data = await response.json();
      const aiResponse = data.response;
      document.getElementById("openai-response").textContent = aiResponse;

      conversationHistory.push(`응답: ${aiResponse}`);

      // TTS 설정 및 실행
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.lang = "ko-KR";
      utterance.volume = 1; // 음량 설정 (0.0 ~ 1.0)
      utterance.rate = 1; // 속도 설정 (0.1 ~ 10)
      utterance.pitch = 1; // 음높이 설정 (0 ~ 2)

      // 한국어에 맞는 음성 선택
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find((voice) => voice.lang === "ko-KR");
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error during API call:", error);
      document.getElementById("openai-response").textContent =
        "Error: OpenAI API에서 응답을 가져올 수 없습니다.";
    }
  };

  recognition.onerror = (event) => {
    console.error("음성 인식 오류가 발생하였습니다: ", event.error);
  };

  recognition.onend = () => {
    console.log("음성 인식 종료. 다시 시작합니다...");
    recognition.start();
  };

  recognition.onaudioend = () => {
    console.log("오디오 캡쳐가 종료되었습니다");
  };

  recognition.onnomatch = () => {
    console.log("음성이 인식되지 않았습니다");
  };

  recognition.onspeechend = () => {
    console.log("음성이 감지되지 않았습니다");
  };

  console.log("음성 인식 시작");
  recognition.start();
});
