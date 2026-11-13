import { getWeatherDescription } from "./weather.js";

const elements = {
  form: document.querySelector("#search-form"),
  searchButton: document.querySelector("#search-button"),
  initialPanel: document.querySelector("#initial-panel"),
  loadingPanel: document.querySelector("#loading-panel"),
  loadingTitle: document.querySelector("#loading-title"),
  loadingCopy: document.querySelector("#loading-copy"),
  errorPanel: document.querySelector("#error-panel"),
  errorMessage: document.querySelector("#error-message"),
  retryButton: document.querySelector("#retry-button"),
  placesPanel: document.querySelector("#places-panel"),
  placesList: document.querySelector("#places-list"),
  noResultsPanel: document.querySelector("#no-results-panel"),
  dashboard: document.querySelector("#weather-dashboard"),
  currentWeather: document.querySelector("#current-weather"),
  cityPhoto: document.querySelector("#city-photo"),
  cityPhotoImage: document.querySelector("#city-photo-image"),
  cityPhotoCredit: document.querySelector("#city-photo-credit"),
  locationName: document.querySelector("#location-name"),
  currentDate: document.querySelector("#current-date"),
  currentIcon: document.querySelector("#current-icon"),
  currentTemperature: document.querySelector("#current-temperature"),
  currentCondition: document.querySelector("#current-condition"),
  currentFootnote: document.querySelector("#current-footnote"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#wind-speed"),
  forecastGrid: document.querySelector("#forecast-grid"),
  statusMessage: document.querySelector("#status-message")
};

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric"
});
const forecastDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric"
});

export function showInitial() {
  setVisiblePanel("initial");
  setBusy(false);
  setStatus("");
}

export function showLoading(title, detail) {
  setVisiblePanel("loading");
  elements.loadingTitle.textContent = title;
  elements.loadingCopy.textContent = detail;
  setBusy(true);
  setStatus(`${title} ${detail}`);
}

export function showError(message) {
  setVisiblePanel("error");
  elements.errorMessage.textContent = message;
  setBusy(false);
  setStatus(message);
}

export function showNoResults(cityName) {
  setVisiblePanel("no-results");
  document.querySelector("#no-results-title").textContent = `No places found for “${cityName}”`;
  setBusy(false);
  setStatus(`No places found for ${cityName}. Try checking the spelling or searching for a nearby city.`);
}

export function showPlaces(places, onChoose) {
  const fragment = document.createDocumentFragment();

  for (const place of places) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const icon = document.createElement("span");
    const copy = document.createElement("span");
    const name = document.createElement("span");
    const region = document.createElement("span");
    const arrow = document.createElement("span");

    button.className = "place-option";
    button.type = "button";
    button.addEventListener("click", () => onChoose(place));

    icon.className = "place-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⌖";

    copy.className = "place-copy";
    name.className = "place-name";
    name.textContent = place.name;
    region.className = "place-region";
    region.textContent = [place.admin1, place.country].filter(Boolean).join(", ");
    copy.append(name, region);

    arrow.className = "place-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    button.append(icon, copy, arrow);
    item.append(button);
    fragment.append(item);
  }

  elements.placesList.replaceChildren(fragment);
  setVisiblePanel("places");
  setBusy(false);
  setStatus(`${places.length} matching places found. Choose one to load its forecast.`);
}

export function showWeather(place, forecast) {
  showCityPhoto(null);
  renderCurrentWeather(place, forecast);
  renderForecast(forecast);
  setVisiblePanel("dashboard");
  setBusy(false);
  setStatus(`Forecast loaded for ${formatPlaceName(place)}.`);
}

export function showCityPhoto(photo, locationName) {
  if (!photo) {
    elements.currentWeather.classList.remove("has-city-photo");
    elements.cityPhoto.hidden = true;
    elements.cityPhotoImage.removeAttribute("src");
    elements.cityPhotoCredit.removeAttribute("href");
    elements.cityPhotoCredit.textContent = "";
    return;
  }

  elements.cityPhotoImage.alt = `City view of ${locationName}`;
  elements.cityPhotoImage.onerror = () => showCityPhoto(null);
  elements.cityPhotoImage.src = photo.url;
  elements.cityPhotoCredit.href = photo.pageUrl;
  elements.cityPhotoCredit.textContent = `Photo · ${photo.creator} · ${photo.license}`;
  elements.cityPhotoCredit.title = `${photo.title} — ${photo.creator}, ${photo.license}`;
  elements.cityPhoto.hidden = false;
  elements.currentWeather.classList.add("has-city-photo");
}

function renderCurrentWeather(place, forecast) {
  const current = forecast.current;
  const weather = getWeatherDescription(current.weather_code);
  const temperatureUnit = forecast.current_units?.temperature_2m ?? "°C";
  const apparentUnit = forecast.current_units?.apparent_temperature ?? temperatureUnit;
  const windUnit = forecast.current_units?.wind_speed_10m ?? "km/h";
  const roundedTemperature = formatNumber(current.temperature_2m);

  elements.locationName.textContent = formatPlaceName(place);
  elements.currentDate.textContent = formatDate(current.time);
  elements.currentIcon.textContent = weather.icon;
  elements.currentIcon.dataset.tone = weather.tone;
  elements.currentTemperature.textContent = roundedTemperature === "—"
    ? "—"
    : `${roundedTemperature}°`;
  elements.currentTemperature.setAttribute(
    "aria-label",
    roundedTemperature === "—" ? "Temperature unavailable" : `${roundedTemperature} ${temperatureUnit}`
  );
  elements.currentCondition.textContent = weather.description;
  elements.currentFootnote.textContent = `Feels like ${formatWithUnit(current.apparent_temperature, apparentUnit)} · Local time ${formatClock(current.time)}`;
  elements.feelsLike.textContent = formatWithUnit(current.apparent_temperature, apparentUnit);
  elements.humidity.textContent = formatWithUnit(current.relative_humidity_2m, "%");
  elements.windSpeed.textContent = formatWithUnit(current.wind_speed_10m, windUnit);
}

function renderForecast(forecast) {
  const daily = forecast.daily;
  const forecastDays = daily.time.slice(0, 5).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index],
    maximum: daily.temperature_2m_max?.[index],
    minimum: daily.temperature_2m_min?.[index],
    precipitation: daily.precipitation_probability_max?.[index]
  }));
  const fragment = document.createDocumentFragment();

  for (const [index, day] of forecastDays.entries()) {
    fragment.append(createForecastCard(day, index));
  }
  elements.forecastGrid.replaceChildren(fragment);
}

function createForecastCard(day, index) {
  const article = document.createElement("article");
  const name = document.createElement("p");
  const icon = document.createElement("span");
  const condition = document.createElement("p");
  const temperatures = document.createElement("p");
  const high = document.createElement("strong");
  const low = document.createElement("span");
  const precipitation = document.createElement("p");
  const weather = getWeatherDescription(day.weatherCode);

  article.className = "forecast-card";
  if (index === 0) {
    article.classList.add("is-today");
  }
  name.className = "forecast-day";
  name.textContent = index === 0 ? "Today" : formatForecastDate(day.date);

  icon.className = "forecast-icon";
  icon.dataset.tone = weather.tone;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = weather.icon;

  condition.className = "forecast-condition";
  condition.textContent = weather.description;

  temperatures.className = "forecast-temperatures";
  high.textContent = formatTemperature(day.maximum);
  low.textContent = formatTemperature(day.minimum);
  temperatures.append(high, low);

  precipitation.className = "precipitation";
  precipitation.textContent = Number.isFinite(day.precipitation)
    ? `Rain ${numberFormatter.format(day.precipitation)}%`
    : "Rain —";

  article.append(name, icon, condition, temperatures, precipitation);
  return article;
}

function formatPlaceName(place) {
  return [place.name, place.admin1, place.country]
    .filter((part, index, parts) => Boolean(part) && parts.indexOf(part) === index)
    .join(", ");
}

function formatDate(value) {
  const date = value ? new Date(`${String(value).slice(0, 10)}T12:00:00`) : new Date();
  return Number.isNaN(date.getTime()) ? "Local forecast" : dateFormatter.format(date);
}

function formatForecastDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Coming up" : forecastDateFormatter.format(date);
}

function formatClock(value) {
  const match = typeof value === "string" ? value.match(/T(\d{2}):(\d{2})/) : null;
  if (!match) {
    return "now";
  }
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatNumber(value) {
  return Number.isFinite(value) ? numberFormatter.format(value) : "—";
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${numberFormatter.format(value)}°` : "—";
}

function formatWithUnit(value, unit) {
  return Number.isFinite(value) ? `${numberFormatter.format(value)} ${unit}` : `— ${unit}`;
}

function setVisiblePanel(panelName) {
  const panels = [
    ["initial", elements.initialPanel],
    ["loading", elements.loadingPanel],
    ["error", elements.errorPanel],
    ["places", elements.placesPanel],
    ["no-results", elements.noResultsPanel],
    ["dashboard", elements.dashboard]
  ];

  for (const [name, element] of panels) {
    element.hidden = name !== panelName;
  }
}

function setBusy(isBusy) {
  elements.form.setAttribute("aria-busy", String(isBusy));
  elements.searchButton.disabled = isBusy;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}
