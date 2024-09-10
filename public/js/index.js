// WebSocket 연결 (서버의 3001 포트)
const socket = io("http://localhost:3001"); // WebSocket 연결

const alarmSound = new Audio("/music/medicine.mp3"); // 알람 소리 파일

// 서버에서 알람 트리거를 받으면 실행
socket.on("alarm-triggered", (data) => {
  alarmSound.play(); // 알람 소리 재생

  // 알람 확인 메시지 표시, 확인 누르면 알람 소리 중지
  if (confirm(`알람 시간: ${data.time}. 알람을 멈추시겠습니까?`)) {
    alarmSound.pause(); // 알람 소리 중지
  }
});

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
    console.log("인식된 텍스트:", transcript);

    conversationHistory.push(`질문: ${transcript}`);

    // 특정 단어 감지
    if (/도와줘|살려줘|도와주세요|살려주세요/.test(transcript)) {
      try {
        // React Native Expo 앱으로 신호 보내기
        await fetch("http://localhost:3000/api/expoSignal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: transcript,
            timestamp: new Date().toISOString(),
          }),
        });
        console.log("React Native Expo로 신호 전송 완료");
      } catch (error) {
        console.error("React Native Expo로 신호 전송 실패:", error);
      }
    } else if (/현재 시간|시간 좀 알려줘|몇 시야/.test(transcript)) {
      // 현재 시간 가져오기
      const now = new Date();
      const currentTime = `${now.getHours()}시 ${now.getMinutes()}분입니다.`;

      // TTS로 시간 읽기
      const utterance = new SpeechSynthesisUtterance(currentTime);
      utterance.lang = "ko-KR";
      speechSynthesis.speak(utterance);
      console.log("현재 시간:", currentTime);
    } else {
      // OpenAI API 호출 (모든 대화 기록 전송)
      try {
        const response = await fetch("http://localhost:3000/api/openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: transcript,
            history: conversationHistory, // 전체 대화 히스토리 전송
          }),
        });

        const data = await response.json();
        const aiResponse = data.response;
        console.log("OpenAI 응답:", aiResponse);

        conversationHistory.push(`응답: ${aiResponse}`);

        // TTS 설정 및 실행
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = "ko-KR";
        utterance.volume = 1;
        utterance.rate = 2;
        utterance.pitch = 2;

        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find((voice) => voice.lang === "ko-KR");
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("OpenAI API 호출 중 오류 발생:", error);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("음성 인식 오류 발생:", event.error);
  };

  recognition.onend = () => {
    console.log("음성 인식 종료. 다시 시작합니다...");
    recognition.start();
  };

  recognition.onaudioend = () => {
    console.log("오디오 캡쳐 종료");
  };

  recognition.onnomatch = () => {
    console.log("음성이 인식되지 않았습니다");
  };

  recognition.onspeechend = () => {
    console.log("음성 입력이 종료되었습니다");
  };

  console.log("음성 인식 시작");
  recognition.start();
});
