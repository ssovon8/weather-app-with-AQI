// Select DOM Elements
let searchBox = document.querySelector(".searchBox");
let searchBtn = document.querySelector(".searchBtn");

let weatherImg = document.querySelector(".weatherImg");
let weather = document.querySelector(".weather");
let temp = document.querySelector(".temp");
let cityName = document.querySelector(".cityName");
let humidity = document.querySelector(".humidity");
let wind = document.querySelector(".wind");

let aqi = document.querySelector(".aqi");
let aqiComponents = document.querySelector(".aqiSec");

let apiKey = "YOUR_API_KEY_HERE";

// Convert City Name to Latitude & Longtitude
async function convertCity(city) {
  try {
    const responseCity = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`,
    );
    if (!responseCity.ok) {
      throw new Error("Geocoding API error");
    }
    const cityData = await responseCity.json();
    // If no City found
    if (!cityData.length) {
      throw new Error("City not found");
    }

    let lat = cityData[0].lat;
    let lon = cityData[0].lon;

    return { lat, lon };
  } catch (error) {
    alert(error.message);
    return null;
  }
}

// Fetch Weather Data
async function checkWeather(city) {
  try {
    // Get Latitude & Longtitude
    let location = await convertCity(city);
    if (!location) return;

    const responseWeather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`,
    );
    if (!responseWeather.ok) {
      throw new Error("Weather API error");
    }
    const data = await responseWeather.json();

    // Update UI with weather data
    weather.innerHTML = data.weather[0].description;
    temp.innerHTML = Math.round(data.main.temp) + "°C";
    cityName.innerHTML = data.name;
    humidity.innerHTML = data.main.humidity + "%";
    // Convert wind speed m/s to km/h
    let windSpeed = (data.wind.speed * 3.6).toFixed(1);
    wind.innerHTML = windSpeed + " km/h";

    // Show Weather Image Based on Condition
    if (data.weather[0].main == "Clear") {
      weatherImg.src = "images/clear.png";
    } else if (data.weather[0].main == "Clouds") {
      weatherImg.src = "images/clouds.png";
    } else if (data.weather[0].main == "Drizzle") {
      weatherImg.src = "images/drizzle.png";
    } else if (data.weather[0].main == "Mist") {
      weatherImg.src = "images/mist.png";
    } else if (data.weather[0].main == "Rain") {
      weatherImg.src = "images/rain.png";
    } else if (data.weather[0].main == "Snow") {
      weatherImg.src = "images/snow.png";
    }

    // Call AQI
    checkAqi(location.lat, location.lon);
  } catch (error) {
    alert(error.message);
  }
}

// Fetch AQI Data
async function checkAqi(lat, lon) {
  try {
    const responseAqi = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    );
    if (!responseAqi.ok) {
      throw new Error("AQI QPI error");
    }
    const aqiData = await responseAqi.json();

    // Clear previous AQI data
    aqiComponents.innerHTML = "";

    // Show AQI Level
    let aqiVal = aqiData.list[0].main.aqi; // AQI Index (1-5)

    // AQI color Logic
    const aqiStat = {
      1: { text: "Good", color: "#00e400" },
      2: { text: "Fair", color: "#ffff00" },
      3: { text: "Moderate", color: "#ff7e00" },
      4: { text: "Poor", color: "#ff0000" },
      5: { text: "Very Poor", color: "#8f3f97" },
    };

    // Set AQI & Color
    aqi.innerHTML = `AQI: ${aqiVal} - ${aqiStat[aqiVal].text} `;
    aqi.style.backgroundColor = aqiStat[aqiVal].color;

    // Show AQI Components
    let component = aqiData.list[0].components;

    Object.entries(component).forEach(([key, val]) => {
      let para = document.createElement("p");
      para.innerHTML = `${key.toUpperCase()}: ${val}`;
      aqiComponents.appendChild(para);
    });
  } catch (error) {
    alert(error.message);
  }
}

// Event Listeners
// Button Click
searchBtn.addEventListener("click", () => {
  let city = searchBox.value.trim();
  if (city === "") {
    alert("Please enter a city name");
    return;
  }
  checkWeather(city);
});

// Press enter key
searchBox.addEventListener("keydown", (evt) => {
  if (evt.key === "Enter") {
    checkWeather(searchBox.value);
  }
});

// Add default city on page load
window.addEventListener("DOMContentLoaded", () => {
  checkWeather("gobardanga");
});
