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

document.querySelector("#backButton").addEventListener("click", () => {
  window.history.back();
});
document.querySelector("#backButton").addEventListener("tourhstrat", () => {
  window.history.back();
});
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
      handleScroll(deltaY > 0 ? 1 : -1);
      startY = currentY;
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

initPicker("hourPicker", 0); // 1시가 첫 번째 항목이므로 0
initPicker("minutePicker", 0); // 00분이 첫 번째 항목이므로 0
initPicker("ampmPicker", 0); // 오전이 첫 번째 항목이므로 0

document
  .getElementById("setAlarmButton")
  .addEventListener("click", function () {
    const alarmDays = Array.from(
      document.querySelectorAll("#alarmDays input:checked")
    ).map((input) => parseInt(input.value));

    let alarmDaysText;
    if (alarmDays.length === 0) {
      alarmDays.push(0, 1, 2, 3, 4, 5, 6);
      alarmDaysText = "매일";
    } else {
      alarmDaysText = alarmDays
        .map((day) => ["일", "월", "화", "수", "목", "금", "토"][day])
        .join(", ");
    }

    const selectedAmPm = document
      .querySelector("#ampmPicker .selected")
      .textContent.trim();
    const selectedHour = document
      .querySelector("#hourPicker .selected")
      .textContent.trim();
    const selectedMinute = document
      .querySelector("#minutePicker .selected")
      .textContent.trim();

    const alarmTime = `${selectedAmPm} ${selectedHour}:${selectedMinute}`;
    const alarmText = `시간: ${alarmTime}, 요일: ${alarmDaysText}`;

    addAlarm(alarmText);
  });

function saveAlarmsToLocalStorage() {
  const alarmItems = document.getElementById("alarmItems");
  const alarms = [];
  alarmItems.querySelectorAll("li").forEach((alarm) => {
    alarms.push(alarm.textContent);
  });
  localStorage.setItem("alarms", JSON.stringify(alarms));
}

function loadAlarmsFromLocalStorage() {
  const alarms = JSON.parse(localStorage.getItem("alarms")) || [];
  const alarmItems = document.getElementById("alarmItems");
  alarms.forEach((alarmText) => {
    const listItem = document.createElement("li");
    listItem.textContent = alarmText;

    // 삭제 버튼 추가
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener("click", () => {
      alarmItems.removeChild(listItem);
      saveAlarmsToLocalStorage(); // 알람 삭제 후 로컬 스토리지 업데이트
    });

    listItem.appendChild(deleteButton);
    alarmItems.appendChild(listItem);
  });
}

// 페이지 로드 시 알람 데이터 불러오기
document.addEventListener("DOMContentLoaded", loadAlarmsFromLocalStorage);

function addAlarm(alarmText) {
  const alarmItems = document.getElementById("alarmItems");

  let isDuplicate = false;
  const existingAlarms = alarmItems.querySelectorAll("li");
  existingAlarms.forEach((alarm) => {
    if (alarm.textContent === alarmText) {
      isDuplicate = true;
    }
  });

  if (isDuplicate) {
    alert("이미 동일한 시간과 요일로 알람이 설정되어 있습니다.");
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = alarmText;

    // 삭제 버튼 추가
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener("click", () => {
      alarmItems.removeChild(listItem);
      saveAlarmsToLocalStorage(); // 알람 삭제 후 로컬 스토리지 업데이트
    });

    listItem.appendChild(deleteButton);
    alarmItems.appendChild(listItem);
    saveAlarmsToLocalStorage(); // 알람 추가 후 로컬 스토리지 업데이트
  }
}

function checkAlarms() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentAmPm = currentHour >= 12 ? "오후" : "오전";
  const adjustedHour = currentHour % 12 || 12;

  const currentTimeText = `${currentAmPm} ${adjustedHour}:${currentMinute
    .toString()
    .padStart(2, "0")}`;

  const alarmItems = document
    .getElementById("alarmItems")
    .querySelectorAll("li");
  alarmItems.forEach((alarm) => {
    if (alarm.textContent.includes(currentTimeText)) {
      if (
        alarm.textContent.includes("매일") ||
        alarm.textContent.includes(
          ["일", "월", "화", "수", "목", "금", "토"][currentDay]
        )
      ) {
        console.log(`알람: ${alarm.textContent}`);
        document.getElementById("alarmSound").play();
      }
    }
  });
}

setInterval(checkAlarms, 60000); // 1분마다 체크
