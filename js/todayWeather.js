require("dotenv").config();
const API_KEY = "2496a945d5aba6b1ae5b53ddecb57bcd";
const button = document.querySelector(".button");

button.addEventListener("click", () => {
  console.log(button);
});

button.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(success);
});

const success = (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  getWeather(latitude, longitude);
};

const getWeather = (lat, lon) => {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
  )
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);
    });
};

const fail = () => {
  alert("좌표를 받아올 수 없음");
};
