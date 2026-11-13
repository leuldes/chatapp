import { fetchForecast, searchCities, searchCityPhoto } from "./weather.js";
import {
  showError,
  showInitial,
  showLoading,
  showNoResults,
  showCityPhoto,
  showPlaces,
  showWeather
} from "./ui.js";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const retryButton = document.querySelector("#retry-button");

let activeController = null;
let lastSearchName = "";

form.addEventListener("submit", handleSearch);
retryButton.addEventListener("click", handleRetry);

async function handleSearch(event) {
  event.preventDefault();
  const cityName = cityInput.value.trim();

  if (!cityName) {
    activeController?.abort();
    activeController = null;
    cityInput.setCustomValidity("Enter a city name to search.");
    cityInput.reportValidity();
    lastSearchName = "";
    showError("Enter a city name to search for its weather.");
    return;
  }

  cityInput.setCustomValidity("");
  lastSearchName = cityName;
  const controller = startRequest();
  showLoading("Finding your city…", "Searching places around the world.");

  try {
    const places = await searchCities(cityName, { signal: controller.signal });
    if (!isCurrentRequest(controller)) {
      return;
    }

    if (places.length === 0) {
      showNoResults(cityName);
      return;
    }

    if (places.length === 1) {
      await loadPlaceForecast(places[0], controller);
      return;
    }

    showPlaces(places, (place) => loadPlaceForecast(place, controller));
  } catch (error) {
    if (!isAbortError(error) && isCurrentRequest(controller)) {
      showError(getErrorMessage(error));
    }
  }
}

async function loadPlaceForecast(place, controller) {
  if (!isCurrentRequest(controller)) {
    return;
  }

  showLoading("Checking the skies…", `Getting the forecast for ${place.name}.`);

  try {
    const forecast = await fetchForecast(place, { signal: controller.signal });
    if (isCurrentRequest(controller)) {
      showWeather(place, forecast);
      loadCityPhoto(place, controller);
    }
  } catch (error) {
    if (!isAbortError(error) && isCurrentRequest(controller)) {
      showError(getErrorMessage(error));
    }
  }
}

async function loadCityPhoto(place, controller) {
  try {
    const photo = await searchCityPhoto(place, { signal: controller.signal });
    if (isCurrentRequest(controller)) {
      showCityPhoto(photo, photo?.location ?? place.name);
    }
  } catch (error) {
    if (!isAbortError(error) && isCurrentRequest(controller)) {
      showCityPhoto(null);
    }
  }
}

function handleRetry() {
  if (!lastSearchName) {
    cityInput.focus();
    return;
  }

  cityInput.value = lastSearchName;
  form.requestSubmit();
}

function startRequest() {
  activeController?.abort();
  activeController = new AbortController();
  return activeController;
}

function isCurrentRequest(controller) {
  return activeController === controller && !controller.signal.aborted;
}

function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError";
}

function getErrorMessage(error) {
  if (error instanceof TypeError) {
    return "We couldn’t reach the weather service. Check your internet connection and try again.";
  }
  return error instanceof Error ? error.message : "Something unexpected happened. Please try again.";
}

cityInput.addEventListener("input", () => {
  if (cityInput.value.trim()) {
    cityInput.setCustomValidity("");
  }
});

showInitial();
