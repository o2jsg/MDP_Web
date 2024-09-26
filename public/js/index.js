// WebSocket 연결 (서버의 3000 포트)
const socket = io("http://localhost:3000"); // WebSocket 연결
const alarmSound = new Audio("/music/medicine.mp3"); // 알람 소리 파일
alarmSound.loop = true; // 알람 소리를 계속 반복
const conversationHistory = [];

// WebSocket 연결 성공 여부 확인
socket.on("connect", () => {
  console.log("WebSocket 연결 성공");
});

// WebSocket 연결 실패 시
socket.on("connect_error", (error) => {
  console.error("WebSocket 연결 실패:", error);
});

// 서버에서 알람 트리거를 받으면 실행
socket.on("alarm-triggered", (data) => {
  console.log("알람 트리거 발생: ", data);

  // 알람 소리 재생
  alarmSound.currentTime = 0; // 알람 소리 처음부터 재생
  alarmSound
    .play()
    .then(() => {
      console.log("알람 소리 재생 시작");
    })
    .catch((error) => {
      console.error("알람 소리 재생 중 오류 발생:", error);
    });

  // SweetAlert 모달 표시 (아이콘을 'info'로 변경, 확인 버튼만)
  Swal.fire({
    title: "알람",
    text: `알람 시간: ${data.time}. 알람을 멈추시겠습니까?`,
    icon: "info", // 아이콘을 'info'로 변경
    confirmButtonText: "알람 멈추기",
    showCancelButton: false, // 취소 버튼 숨기기
    allowOutsideClick: false, // 모달 외부 클릭 방지
    allowEscapeKey: false, // ESC 키 방지
    heightAuto: false, // 높이를 자동으로 조정하지 않음
    backdrop: `
      rgba(0,0,123,0.4)
      left top
      no-repeat
    `, // 모달 배경 설정 (선택 사항)
  }).then((result) => {
    if (result.isConfirmed) {
      // 사용자가 확인을 누르면 알람 중지
      console.log("사용자가 알람을 멈췄습니다.");
      alarmSound.pause();
      alarmSound.currentTime = 0;
    }
  });
});

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
    // App Inventor로 신호 보내기
    if (/도와 줘|살려줘|도와 주세요|살려주세요/.test(transcript)) {
      try {
        // App Inventor로 HTTP 요청 전송
        await fetch("http://192.168.0.32:6381/api/app_inventor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: transcript,
            timestamp: new Date().toISOString(),
          }),
        });
        console.log("App Inventor로 신호 전송 완료");
      } catch (error) {
        console.error("App Inventor로 신호 전송 실패:", error);
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
        utterance.rate = 1.5; // 속도를 약간 낮춤
        utterance.pitch = 1.8; // 음 높이를 조절

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
    setTimeout(() => {
      recognition.start();
    }, 100);
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

/*
  const displayGPTResponse = (response) => {
    const responseContainer = document.getElementById("gpt-response");
    responseContainer.innerHTML = ""; // 이전 응답 초기화
    responseContainer.innerText = response; // 새 응답 표시
  };
*/
