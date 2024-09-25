// WebSocket 연결 (서버의 3001 포트)
const socket = io("http://localhost:3000"); // WebSocket 연결

const alarmSound = new Audio("/music/medicine.mp3"); // 알람 소리 파일

// 서버에서 알람 트리거를 받으면 실행
socket.on("alarm-triggered", (data) => {
  alarmSound.play(); // 알람 소리 재생

  // 알람 확인 메시지 표시, 확인 누르면 알람 소리 중지
  if (alert(`알람 시간: ${data.time}. 알람을 멈추시겠습니까?`)) {
    alarmSound.pause(); // 알람 소리 중지
  }
});

let inactivityTimeout;

function pageRollbackTimer() {
  inactivityTimeout = setTimeout(() => {
    history.back();
  }, 20000);
}

function resetTimer() {
  clearTimeout(inactivityTimeout);
  pageRollbackTimer();
}

window.addEventListener("touchstart", resetTimer);
window.addEventListener("mousemove", resetTimer);

window.addEventListener("load", pageRollbackTimer);

const DEFAULT_LAT = 37.46369169; // 인천 미추홀구의 위도
const DEFAULT_LON = 126.6502972; // 인천 미추홀구의 경도

async function fetchWeather(lat, lon) {
  const url = `/api/weather/current?lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
    }
    const data = await response.json();
    console.log("날씨 데이터 가져오기 성공", data);
    displayCurrentWeather(data);
  } catch (error) {
    console.error("날씨 데이터를 가져오는 중 오류가 발생했습니다.", error);
    showErrorMessage("날씨 데이터를 가져오는 데 실패했습니다.");
  }
}

async function fetchAirQuality(lat, lon) {
  const url = `/api/weather/air_quality?lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
    }
    const data = await response.json();
    console.log("미세먼지 데이터 가져오기 성공", data);
    displayAirQuality(data.list[0].components.pm2_5);
  } catch (error) {
    console.error("미세먼지 데이터를 가져오는 중 오류가 발생했습니다.", error);
    showErrorMessage("미세먼지 데이터를 가져오는 데 실패했습니다.");
  }
}

async function fetchWeeklyForecast(lat, lon) {
  const url = `/api/weather/weekly_forecast?lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
    }
    const data = await response.json();
    console.log("주간 날씨 데이터 가져오기 성공", data);
    processWeeklyForecast(data.list);
  } catch (error) {
    console.error("주간 날씨 데이터를 가져오는 중 오류가 발생했습니다.", error);
    showErrorMessage("주간 날씨 데이터를 가져오는 데 실패했습니다.");
  }
}

function getCoordinatesAndFetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`현재 위치: 위도 ${lat}, 경도 ${lon}`);
        fetchWeather(lat, lon);
        fetchAirQuality(lat, lon); // 미세먼지 데이터 가져오기
        fetchWeeklyForecast(lat, lon); // 주간 날씨 데이터 가져오기
      },
      (error) => {
        console.error("위치 정보를 가져오는 중 오류가 발생했습니다.", error);
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        fetchAirQuality(DEFAULT_LAT, DEFAULT_LON); // 기본 위치에서 미세먼지 데이터 가져오기
        fetchWeeklyForecast(DEFAULT_LAT, DEFAULT_LON); // 기본 위치에서 주간 날씨 데이터 가져오기
      }
    );
  } else {
    console.error("브라우저에서 위치 정보를 지원하지 않습니다.");
    fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    fetchAirQuality(DEFAULT_LAT, DEFAULT_LON); // 기본 위치에서 미세먼지 데이터 가져오기
    fetchWeeklyForecast(DEFAULT_LAT, DEFAULT_LON); // 기본 위치에서 주간 날씨 데이터 가져오기
  }
}

function processWeeklyForecast(list) {
  const dailyData = {};

  list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const day = date.toLocaleDateString("ko-KR", { weekday: "long" });

    if (!dailyData[day]) {
      dailyData[day] = {
        temp: entry.main.temp,
        icon: entry.weather[0].icon,
        count: 1,
        date: date, // 날짜를 저장합니다.
      };
    } else {
      dailyData[day].temp += entry.main.temp;
      dailyData[day].count += 1;
    }
  });

  const forecastContainer = document.getElementById("forecast-list");
  forecastContainer.innerHTML = "";

  Object.keys(dailyData).forEach((day, index) => {
    if (index > 0 && index < 6) {
      // 오늘 이후부터 5일간의 데이터만 표시
      const avgTemp = (dailyData[day].temp / dailyData[day].count).toFixed(1);
      const icon = dailyData[day].icon;
      const weatherEmoji = mapWeatherIcon(icon);

      // 색상 변경 로직
      let dayStyle = "";
      if (day === "토요일") {
        dayStyle = "color: #4B89DC;"; // 파란색
      } else if (day === "일요일") {
        dayStyle = "color: #F05650;"; // 빨간색
      }

      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.innerHTML = `
        <div class="day" style="${dayStyle}">${day}</div>
        <div class="weather-icon">${weatherEmoji}</div>
        <div class="temp">${avgTemp}°C</div>
      `;
      forecastContainer.appendChild(forecastItem);
    }
  });
}

function displayCurrentWeather(data) {
  const temperature = data.main.temp;
  const weatherDescription = data.weather[0].description;
  const weatherIcon = data.weather[0].icon;
  const humidity = data.main.humidity;

  // 이모지 맵핑
  const weatherEmoji = mapWeatherIcon(weatherIcon);

  document.getElementById("temperature").innerText = `${temperature}°C`;
  document.getElementById("weather-status").innerText = weatherDescription;
  document.getElementById(
    "humidity"
  ).innerHTML = `습도<br /><strong>${humidity}%</strong>`;

  // weather-icon ID를 가진 div에 이모지 배치
  document.getElementById("weather-icon").innerText = weatherEmoji;
}

function mapWeatherIcon(icon) {
  const emojiMap = {
    "01d": "🌞", // 맑음 (낮)
    "02d": "⛅", // 구름 조금 (낮)
    "03d": "☁️", // 구름 많음 (낮)
    "04d": "☁️", // 흐림 (낮)
    "09d": "🌧", // 소나기 (낮)
    "10d": "🌦", // 비 (낮)
    "11d": "⛈", // 천둥번개 (낮)
    "13d": "❄️", // 눈 (낮)
    "50d": "🌫", // 안개 (낮)
    "01n": "🌕", // 맑음 (밤)
    "02n": "☁️", // 구름 조금 (밤)
    "03n": "☁️", // 구름 많음 (밤)
    "04n": "☁️", // 흐림 (밤)
    "09n": "🌧", // 소나기 (밤)
    "10n": "🌧", // 비 (밤)
    "11n": "⛈", // 천둥번개 (밤)
    "13n": "❄️", // 눈 (밤)
    "50n": "🌫", // 안개 (밤)
  };

  return emojiMap[icon] || "🌈"; // 기본 이모지로 무지개
}

function displayAirQuality(pm25) {
  let airQuality = "";

  if (pm25 <= 15) {
    airQuality = "좋음";
  } else if (pm25 <= 35) {
    airQuality = "보통";
  } else if (pm25 <= 75) {
    airQuality = "나쁨";
  } else {
    airQuality = "매우 나쁨";
  }

  document.getElementById(
    "air-quality"
  ).innerHTML = `미세먼지<br /><strong>${pm25} µg/m³ (${airQuality})</strong>`;
}

function showErrorMessage(message) {
  const errorDiv = document.getElementById("error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

// 최초로 날씨 정보와 미세먼지 정보 및 주간 날씨 가져오기
getCoordinatesAndFetchWeather();

// 1시간마다 날씨 및 미세먼지 정보, 주간 날씨 갱신
setInterval(getCoordinatesAndFetchWeather, 3600000);
