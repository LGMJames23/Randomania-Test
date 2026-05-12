const cityOptions = [
  { name: "New York, USA", latitude: 40.7128, longitude: -74.006, timeZone: "America/New_York" },
  { name: "Los Angeles, USA", latitude: 34.0522, longitude: -118.2437, timeZone: "America/Los_Angeles" },
  { name: "Chicago, USA", latitude: 41.8781, longitude: -87.6298, timeZone: "America/Chicago" },
  { name: "Erie, PA, USA", latitude: 42.1292, longitude: -80.0851, timeZone: "America/New_York" },
  { name: "London, UK", latitude: 51.5072, longitude: -0.1276, timeZone: "Europe/London" },
  { name: "Paris, France", latitude: 48.8566, longitude: 2.3522, timeZone: "Europe/Paris" },
  { name: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503, timeZone: "Asia/Tokyo" },
  { name: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093, timeZone: "Australia/Sydney" },
  { name: "Sao Paulo, Brazil", latitude: -23.5505, longitude: -46.6333, timeZone: "America/Sao_Paulo" },
  { name: "Toronto, Canada", latitude: 43.6532, longitude: -79.3832, timeZone: "America/Toronto" },
  { name: "Cape Town, South Africa", latitude: -33.9249, longitude: 18.4241, timeZone: "Africa/Johannesburg" }
];

let activeLocation = cityOptions[0];
let clockTimer = null;
const ACCOUNT_STORAGE_KEY = "randomaniaAccounts";
const ACTIVE_ACCOUNT_STORAGE_KEY = "randomaniaActiveAccount";
let activeAccount = "Guest";

const locationSelect = document.getElementById("locationSelect");
const randomLocationBtn = document.getElementById("randomLocationBtn");
const useMyLocationBtn = document.getElementById("useMyLocationBtn");
const homeLocationLabel = document.getElementById("homeLocationLabel");
const homeTimeLabel = document.getElementById("homeTimeLabel");
const homeDateLabel = document.getElementById("homeDateLabel");
const homeWeatherLabel = document.getElementById("homeWeatherLabel");
const accountSelect = document.getElementById("accountSelect");
const newAccountInput = document.getElementById("newAccountInput");
const createAccountBtn = document.getElementById("createAccountBtn");
const randomAccountBtn = document.getElementById("randomAccountBtn");
const switchAccountBtn = document.getElementById("switchAccountBtn");
const accountStatusLabel = document.getElementById("accountStatusLabel");
const activeAccountLabel = document.getElementById("activeAccountLabel");
const homeGreetingLabel = document.getElementById("homeGreetingLabel");

function populateLocationSelect() {
  cityOptions.forEach((city, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = city.name;
    locationSelect.appendChild(option);
  });
}

function formatClock(date, timeZone) {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
  return { time, day };
}

function greetingFromHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (_err) {
    // Use defaults when local data is invalid.
  }
  return ["Guest"];
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

function updateGreeting(timeZone) {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false
  }).formatToParts(new Date());
  const hourPart = dateParts.find((part) => part.type === "hour");
  const hour = Number(hourPart?.value ?? "12");
  homeGreetingLabel.textContent = `${greetingFromHour(hour)}, ${activeAccount}!`;
}

function setActiveAccount(name) {
  activeAccount = name;
  localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, name);
  activeAccountLabel.textContent = `Current account: ${name}`;
  updateGreeting(activeLocation.timeZone);
}

function renderAccountSelect(accounts) {
  accountSelect.innerHTML = "";
  accounts.forEach((accountName) => {
    const option = document.createElement("option");
    option.value = accountName;
    option.textContent = accountName;
    accountSelect.appendChild(option);
  });
}

function initAccounts() {
  const accounts = loadAccounts();
  renderAccountSelect(accounts);
  const savedActive = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
  const initialActive = savedActive && accounts.includes(savedActive) ? savedActive : accounts[0];
  accountSelect.value = initialActive;
  setActiveAccount(initialActive);
}

function randomAccountName() {
  const firstNames = [
    "Avery", "Jordan", "Maya", "Noah", "Sofia", "Liam", "Isabella", "Ethan", "Amelia", "Kai",
    "Harper", "Elijah", "Zoe", "Micah", "Aria", "Briar", "Cade", "Daisy", "Ethan", "Finn", "Gia", "Henry", "Ivy", "Jack", "Kai", "Liam", "Mia", "Noah", "Olivia", "Paisley", "Quinn", "Riley", "Sam", "Tessa", "Uma", "Violet", "William", "Xander", "Yara", "Zane"
  ];
  const lastNames = [
    "Anderson", "Bennett", "Carter", "Diaz", "Edwards", "Foster", "Garcia", "Hughes", "Jackson", "King", "Lewis", "Martinez", "Nelson", "Perez", "Roberts", "Scott", "Thompson", "Walker", "White", "Williams", "Wilson", "Young", "Iverson", "Johnson", "Kim", "Lopez", "Morgan", "Nguyen", "Patel", "Quinn", "Reed", "Smith", "Taylor", "Upton", "Vargas", "Walker", "Xavier", "Young"
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function weatherTextFromCode(code) {
  const weatherCodes = {
    0: "Clear",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm"
  };
  return weatherCodes[code] || "Unknown";
}

async function updateWeather(location) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
    `&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=auto`;
  homeWeatherLabel.textContent = "Weather: Loading...";
  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error("Weather request failed");
    const data = await response.json();
    const tempC = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    const weather = weatherTextFromCode(code);
    if (typeof tempC === "number") {
      const tempF = (tempC * 9) / 5 + 32;
      homeWeatherLabel.textContent =
        `Weather: ${weather}, ${tempF.toFixed(1)}°F (${tempC.toFixed(1)}°C)`;
    } else {
      homeWeatherLabel.textContent = `Weather: ${weather}`;
    }
  } catch (_err) {
    homeWeatherLabel.textContent = "Weather: Unable to load right now";
  }
}

function startClock(location) {
  if (clockTimer) clearInterval(clockTimer);
  const tick = () => {
    const now = new Date();
    const formatted = formatClock(now, location.timeZone);
    homeTimeLabel.textContent = `Time: ${formatted.time}`;
    homeDateLabel.textContent = `Date: ${formatted.day}`;
    updateGreeting(location.timeZone);
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}

function setActiveLocation(location) {
  activeLocation = location;
  homeLocationLabel.textContent = `Location: ${location.name}`;
  startClock(location);
  updateWeather(location);
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    homeWeatherLabel.textContent = "Weather: Geolocation is not supported on this browser";
    return;
  }
  homeLocationLabel.textContent = "Location: Getting your location...";
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const location = {
        name: `Your Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        latitude,
        longitude,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      };
      setActiveLocation(location);
    },
    () => {
      homeLocationLabel.textContent = "Location: Permission denied or unavailable";
      setActiveLocation(activeLocation);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

locationSelect.addEventListener("change", () => {
  const idx = Number(locationSelect.value);
  setActiveLocation(cityOptions[idx]);
});

randomLocationBtn.addEventListener("click", () => {
  const idx = Math.floor(Math.random() * cityOptions.length);
  locationSelect.value = String(idx);
  setActiveLocation(cityOptions[idx]);
});

useMyLocationBtn.addEventListener("click", useCurrentLocation);
accountSelect.addEventListener("change", () => setActiveAccount(accountSelect.value));
createAccountBtn.addEventListener("click", () => {
  const nextName = newAccountInput.value.trim();
  if (!nextName) return;
  const accounts = loadAccounts();
  if (!accounts.includes(nextName)) {
    accounts.push(nextName);
    saveAccounts(accounts);
    renderAccountSelect(accounts);
  }
  accountSelect.value = nextName;
  setActiveAccount(nextName);
  newAccountInput.value = "";
  accountStatusLabel.textContent = `Logged in as ${nextName}.`;
});
switchAccountBtn.addEventListener("click", () => {
  const selected = accountSelect.value;
  if (!selected) return;
  setActiveAccount(selected);
  accountStatusLabel.textContent = `Switched to ${selected}.`;
});
randomAccountBtn.addEventListener("click", () => {
  const generated = randomAccountName();
  const accounts = loadAccounts();
  if (!accounts.includes(generated)) {
    accounts.push(generated);
    saveAccounts(accounts);
    renderAccountSelect(accounts);
  }
  accountSelect.value = generated;
  setActiveAccount(generated);
  accountStatusLabel.textContent = `Random login: ${generated}.`;
});

populateLocationSelect();
initAccounts();
locationSelect.value = "0";
setActiveLocation(cityOptions[0]);
function getSuggestions() {
  getSuggestionsBtn.addEventListener("click", () => {
    let suggestions = [];
    suggestions = JSON.parse(localStorage.getItem("Randomania Suggestions"));
    suggestions.push(document.getElementById("suggestionsInput").textContent);
    suggestions = suggestion + suggestions;
    localStorage.setItem("Randomania Suggestions", JSON.stringify(suggestions));
});
}
