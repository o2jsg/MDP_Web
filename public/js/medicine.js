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
