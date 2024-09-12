document.addEventListener("DOMContentLoaded", () => {
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
        const alarmItems = document.querySelector("#alarmItems");
        alarmItems.innerHTML = ""; // 기존 알람 목록 초기화
        alarms.forEach((alarm) => {
          const li = document.createElement("li");
          li.textContent = `${alarm.hour}:${alarm.minute} ${alarm.ampmChecker} - ${alarm.days}`;
          const deleteButton = document.createElement("button");
          deleteButton.className = "deleteButton";
          deleteButton.textContent = "삭제";
          deleteButton.addEventListener("click", () => {
            deleteAlarm(alarm._id);
          });
          li.appendChild(deleteButton);
          alarmItems.appendChild(li);
        });
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

  function initPicker(pickerId) {
    const picker = document.getElementById(pickerId);
    const ul = picker.querySelector("ul");
    const liElements = ul.querySelectorAll("li");

    let selectedIndex = Math.floor(liElements.length / 2);
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

  initPicker("hourPicker");
  initPicker("minutePicker");
  initPicker("ampmPicker");
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
