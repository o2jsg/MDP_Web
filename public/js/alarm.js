document.addEventListener("DOMContentLoaded", () => {
  let alarmSound = new Audio("/music/medicine.mp3"); // 알람 소리 파일
  let alarmPlaying = false; // 알람이 재생 중인지 확인하는 변수

  const socket = io("http://localhost:3000");

  // WebSocket 연결 상태 확인
  socket.on("connect", () => {
    console.log("WebSocket 연결 성공");
  });

  socket.on("disconnect", () => {
    console.log("WebSocket 연결 해제");
  });

  // 오디오 파일 로드 확인
  alarmSound.addEventListener("canplaythrough", () => {
    console.log("오디오 파일이 로드되었습니다.");
  });

  alarmSound.addEventListener("error", (e) => {
    console.error("오디오 파일 로드 중 오류 발생:", e);
  });

  // 서버에서 알람 트리거 이벤트 수신
  socket.on("alarm-triggered", (data) => {
    console.log("알람이 트리거되었습니다:", data);

    // 오디오 재생 함수
    const playAlarm = () => {
      if (!alarmPlaying) {
        alarmSound.currentTime = 0; // 알람 소리 처음부터 재생
        alarmSound.loop = true; // 알람 소리를 계속 반복
        alarmSound
          .play()
          .then(() => {
            console.log("알람 소리 재생 시작");
            alarmPlaying = true;
          })
          .catch((error) => {
            console.error("알람 소리 재생 중 오류 발생:", error);
          });
      }
    };

    // 알람 소리 재생
    playAlarm();

    // alert 창 표시
    if (alert(`알람 시간: ${data.time}. 알람을 멈추시겠습니까?`)) {
      // 사용자가 확인을 누르면 알람 중지
      console.log("사용자가 알람을 멈췄습니다.");
      alarmSound.pause();
      alarmSound.currentTime = 0;
      alarmPlaying = false;
    }
  });

  // '뒤로가기' 버튼 처리
  document.getElementById("backButton").addEventListener("click", () => {
    window.history.back();
  });

  // 알람 설정 버튼 처리
  document.querySelector("#setAlarmButton").addEventListener("click", () => {
    const ampmPicker = document.querySelector("#ampmPicker ul li.selected");
    const hourPicker = document.querySelector("#hourPicker ul li.selected");
    const minutePicker = document.querySelector("#minutePicker ul li.selected");
    const alarmDays = document.querySelectorAll("#alarmDays input:checked");

    if (!ampmPicker || !hourPicker || !minutePicker) {
      console.error("필요한 요소가 선택되지 않았습니다.");
      alert("시간과 분을 선택해주세요.");
      return;
    }

    const ampmChecker = ampmPicker.textContent;
    const hour = hourPicker.textContent;
    const minute = minutePicker.textContent;
    const days = Array.from(alarmDays).map((day) => day.value);

    // 아무 요일도 선택되지 않았을 경우 "매일"을 기본값으로 설정
    if (days.length === 0) {
      days.push("7");
    }

    fetch("/api/alarms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hour, minute, ampmChecker, days }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("알람 저장 완료:", data);
          alert("알람이 저장되었습니다.");
          loadAlarms(); // 알람 목록 갱신
        } else {
          alert("알람 저장에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("알람 저장 중 오류가 발생했습니다.");
      });
  });

  function loadAlarms() {
    fetch("/api/alarms")
      .then((response) => response.json())
      .then((alarms) => {
        console.log("저장된 알람 목록:", alarms);
        displayAlarms(alarms);
      });
  }

  function deleteAlarm(id) {
    fetch(`/api/alarms/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("알람 삭제에 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("알람 삭제 완료:", data);
          alert("알람이 삭제되었습니다.");
          loadAlarms(); // 알람 목록 갱신
        } else {
          alert("알람 삭제에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("알람 삭제 중 오류가 발생했습니다.");
      });
  }

  function displayAlarms(alarms) {
    const alarmList = document.getElementById("alarmItems");
    alarmList.innerHTML = ""; // 기존 알람 목록 초기화
    alarms.forEach((alarm) => {
      const li = document.createElement("li");
      li.textContent = `${alarm.ampmChecker} ${alarm.hour}:${alarm.minute} - ${alarm.days}`;
      const deleteButton = document.createElement("button");
      deleteButton.className = "deleteButton";
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", () => {
        deleteAlarm(alarm._id);
      });
      li.appendChild(deleteButton);
      alarmList.appendChild(li);
    });
  }

  loadAlarms(); // 페이지 로드 시 알람 목록 불러오기

  const hourSettings = document.querySelector("#hourSettings");
  const minuteSettings = document.querySelector("#minuteSettings");

  for (let i = 1; i < 13; i++) {
    const hourItem = document.createElement("li");
    hourItem.textContent = i.toString();
    hourSettings.appendChild(hourItem);
  }

  for (let i = 0; i < 60; i++) {
    const minuteItem = document.createElement("li");
    minuteItem.textContent = i.toString().padStart(2, "0");
    minuteSettings.appendChild(minuteItem);
  }

  function initPicker(pickerId, initialIndex) {
    const picker = document.getElementById(pickerId);
    const ul = picker.querySelector("ul");
    const liElements = ul.querySelectorAll("li");

    let selectedIndex = initialIndex;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    ul.style.top = `-${selectedIndex * 50}px`;

    picker.addEventListener("wheel", (event) => {
      event.preventDefault();
      handleScroll(event.deltaY > 0 ? 1 : -1);
    });

    picker.addEventListener("touchstart", (event) => {
      startY = event.touches[0].clientY;
      isDragging = true;
    });

    picker.addEventListener("touchmove", (event) => {
      if (!isDragging) return;
      currentY = event.touches[0].clientY;
      const deltaY = startY - currentY;

      if (Math.abs(deltaY) > 10) {
        // 최소 움직임을 10px로 설정
        handleScroll(deltaY > 0 ? 1 : -1);
        startY = currentY; // 새 위치로 시작 지점을 갱신
      }
    });

    picker.addEventListener("touchend", () => {
      isDragging = false;
    });

    function handleScroll(direction) {
      if (
        selectedIndex + direction >= 0 &&
        selectedIndex + direction < liElements.length
      ) {
        selectedIndex += direction;
        ul.style.top = `-${selectedIndex * 50}px`;
        updateSelectedClass(liElements, selectedIndex);
      }
    }

    function updateSelectedClass(elements, selectedIndex) {
      elements.forEach((li, index) => {
        li.classList.toggle("selected", index === selectedIndex);
      });
    }

    updateSelectedClass(liElements, selectedIndex);
  }

  initPicker("hourPicker", 0); // 오전 1시부터 설정
  initPicker("minutePicker", 0); // 00분부터 설정
  initPicker("ampmPicker", 0); // 오전부터 설정
});

function displayAlarms(alarms) {
  const alarmList = document.getElementById("alarmItems");
  alarmList.innerHTML = ""; // 기존 알람 목록 초기화

  alarms.forEach((alarm) => {
    const li = document.createElement("li");
    li.textContent = `${alarm.hour}:${alarm.minute} ${alarm.ampmChecker}`;
    alarmList.appendChild(li);
  });
}

document.querySelectorAll(".picker ul li").forEach((item) => {
  item.addEventListener("click", () => {
    item.parentElement
      .querySelectorAll("li")
      .forEach((li) => li.classList.remove("selected"));
    item.classList.add("selected");
  });
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
