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
  ul.style.top = `-${selectedIndex * 50}px`;

  picker.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    if (
      selectedIndex + direction >= 0 &&
      selectedIndex + direction < liElements.length
    ) {
      selectedIndex += direction;
      ul.style.top = `-${selectedIndex * 50}px`;
      updateSelectedClass(liElements, selectedIndex);
    }
  });

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
