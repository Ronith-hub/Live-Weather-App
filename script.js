// Open-Meteo API endpoints.
const GEOCODING_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

// Get references to the HTML elements.
const cityInput = document.querySelector("#city-input");
const getWeatherButton = document.querySelector("#get-weather");

const cityName = document.querySelector("#city-name");
const temperature = document.querySelector("#temperature");
const weatherIcon = document.querySelector("#weather-icon");
const description = document.querySelector("#description");
const windSpeed = document.querySelector("#wind-speed");
const statusMessage = document.querySelector("#status-message");
const forecastContainer = document.querySelector("#forecast-container");

// Convert Open-Meteo WMO weather codes into descriptions and emojis.
function getWeatherDetails(weatherCode) {
  const weatherDetails = {
    0: ["Sunny", "☀️"],
    1: ["Mainly sunny", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Cloudy", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "❄️"],
    77: ["Snow grains", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Heavy rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],
    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Severe thunderstorm with hail", "⛈️"]
  };

  return weatherDetails[weatherCode] || [
    "Unknown weather",
    "🌡️"
  ];
}

// Show a normal status or error message.
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#fee2e2" : "";
}

// Find a city using Open-Meteo's geocoding API.
async function findCity(city) {
  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json"
  });

  const response = await fetch(`${GEOCODING_API}?${params}`);

  if (!response.ok) {
    throw new Error("The city search failed.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Try another city name.");
  }

  return data.results[0];
}

// Get current weather and a three-day daily forecast.
async function getWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,

    // Current weather values.
    current: "temperature_2m,wind_speed_10m,weather_code",

    // Daily forecast values.
    daily: "weather_code,temperature_2m_max,temperature_2m_min",

    temperature_unit: "celsius",
    wind_speed_unit: "kmh",

    // Use the location's local timezone.
    timezone: "auto",

    // Request today plus the next two days.
    forecast_days: "3"
  });

  const response = await fetch(`${WEATHER_API}?${params}`);

  if (!response.ok) {
    throw new Error("The weather service is unavailable.");
  }

  return response.json();
}

// Format a date such as "2026-03-15" as "Sunday".
function formatDayName(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short"
  }).format(date);
}

// Display the current weather.
function displayCurrentWeather(location, weatherData) {
  const current = weatherData.current;

  const [weatherDescription, weatherEmoji] =
    getWeatherDetails(current.weather_code);

  const readableLocation = [
    location.name,
    location.admin1,
    location.country
  ]
    .filter(Boolean)
    .join(", ");

  cityName.textContent = readableLocation;

  temperature.textContent =
    `${Math.round(current.temperature_2m)}°C`;

  weatherIcon.textContent = weatherEmoji;
  weatherIcon.setAttribute("aria-label", weatherDescription);

  description.textContent = weatherDescription;

  windSpeed.textContent =
    `Wind: ${Math.round(current.wind_speed_10m)} km/h`;
}

// Display the three-day forecast.
function displayForecast(weatherData) {
  const daily = weatherData.daily;

  // Clear the placeholder or previous forecast.
  forecastContainer.innerHTML = "";

  for (let index = 0; index < 3; index += 1) {
    const date = daily.time[index];
    const weatherCode = daily.weather_code[index];
    const maximumTemperature = daily.temperature_2m_max[index];
    const minimumTemperature = daily.temperature_2m_min[index];

    const [weatherDescription, weatherEmoji] =
      getWeatherDetails(weatherCode);

    // Create the forecast card.
    const forecastCard = document.createElement("article");
    forecastCard.className = "forecast-card";

    const dayElement = document.createElement("h3");
    dayElement.className = "forecast-day";
    dayElement.textContent = formatDayName(date);

    const iconElement = document.createElement("div");
    iconElement.className = "forecast-icon";
    iconElement.textContent = weatherEmoji;
    iconElement.setAttribute("aria-label", weatherDescription);

    const temperaturesElement = document.createElement("div");
    temperaturesElement.className = "forecast-temperatures";

    const highElement = document.createElement("span");
    highElement.className = "forecast-high";
    highElement.textContent =
      `High: ${Math.round(maximumTemperature)}°C`;

    const lowElement = document.createElement("span");
    lowElement.className = "forecast-low";
    lowElement.textContent =
      `Low: ${Math.round(minimumTemperature)}°C`;

    temperaturesElement.append(highElement, lowElement);
    forecastCard.append(
      dayElement,
      iconElement,
      temperaturesElement
    );

    forecastContainer.appendChild(forecastCard);
  }
}

// Fetch and display weather for the typed city.
async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showStatus("Please enter a city name.", true);
    cityInput.focus();
    return;
  }

  // Show loading feedback while the requests are running.
  getWeatherButton.disabled = true;
  getWeatherButton.textContent = "Loading...";
  showStatus("Loading weather...");

  try {
    // Step 1: Convert the city name into coordinates.
    const location = await findCity(city);

    // Step 2: Request current and daily weather data.
    const weatherData = await getWeatherData(
      location.latitude,
      location.longitude
    );

    // Step 3: Update both the main card and forecast section.
    displayCurrentWeather(location, weatherData);
    displayForecast(weatherData);

    showStatus("Weather updated successfully.");
  } catch (error) {
    console.error("Weather request failed:", error);

    if (error instanceof TypeError) {
      showStatus(
        "Unable to connect. Please check your internet connection.",
        true
      );
    } else {
      showStatus(
        error.message || "Something went wrong. Please try again.",
        true
      );
    }
  } finally {
    // Re-enable the button after the request finishes.
    getWeatherButton.disabled = false;
    getWeatherButton.textContent = "Get Weather";
  }
}

// Search when the button is clicked.
getWeatherButton.addEventListener("click", getWeather);

// Search when Enter is pressed in the input box.
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});
