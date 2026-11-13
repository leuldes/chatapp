const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";

const WEATHER_CODES = {
  0: { description: "Clear sky", icon: "☀️", tone: "sunny" },
  1: { description: "Mainly clear", icon: "🌤️", tone: "sunny" },
  2: { description: "Partly cloudy", icon: "⛅", tone: "cloudy" },
  3: { description: "Overcast", icon: "☁️", tone: "cloudy" },
  45: { description: "Fog", icon: "🌫️", tone: "foggy" },
  48: { description: "Depositing rime fog", icon: "🌫️", tone: "foggy" },
  51: { description: "Light drizzle", icon: "🌦️", tone: "rainy" },
  53: { description: "Moderate drizzle", icon: "🌦️", tone: "rainy" },
  55: { description: "Dense drizzle", icon: "🌧️", tone: "rainy" },
  56: { description: "Light freezing drizzle", icon: "🌧️", tone: "rainy" },
  57: { description: "Dense freezing drizzle", icon: "🌧️", tone: "rainy" },
  61: { description: "Slight rain", icon: "🌦️", tone: "rainy" },
  63: { description: "Moderate rain", icon: "🌧️", tone: "rainy" },
  65: { description: "Heavy rain", icon: "🌧️", tone: "rainy" },
  66: { description: "Light freezing rain", icon: "🌧️", tone: "rainy" },
  67: { description: "Heavy freezing rain", icon: "🌧️", tone: "rainy" },
  71: { description: "Slight snowfall", icon: "🌨️", tone: "snowy" },
  73: { description: "Moderate snowfall", icon: "🌨️", tone: "snowy" },
  75: { description: "Heavy snowfall", icon: "❄️", tone: "snowy" },
  77: { description: "Snow grains", icon: "❄️", tone: "snowy" },
  80: { description: "Slight rain showers", icon: "🌦️", tone: "rainy" },
  81: { description: "Moderate rain showers", icon: "🌧️", tone: "rainy" },
  82: { description: "Violent rain showers", icon: "⛈️", tone: "stormy" },
  85: { description: "Slight snow showers", icon: "🌨️", tone: "snowy" },
  86: { description: "Heavy snow showers", icon: "❄️", tone: "snowy" },
  95: { description: "Thunderstorm", icon: "⛈️", tone: "stormy" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️", tone: "stormy" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️", tone: "stormy" }
};

export async function searchCities(cityName, { signal } = {}) {
  const params = new URLSearchParams({
    name: cityName,
    count: "5",
    language: "en",
    format: "json"
  });
  const response = await fetch(`${GEOCODING_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`City search failed (HTTP ${response.status}). Please try again.`);
  }

  const data = await response.json();
  return Array.isArray(data.results) ? data.results.filter(isValidPlace) : [];
}

export async function fetchForecast(place, { signal } = {}) {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max"
    ].join(","),
    timezone: "auto",
    forecast_days: "5"
  });
  const response = await fetch(`${FORECAST_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`Weather forecast failed (HTTP ${response.status}). Please try again.`);
  }

  const data = await response.json();
  if (!data.current || !data.daily || !Array.isArray(data.daily.time) || data.daily.time.length === 0) {
    throw new Error("The weather service returned incomplete forecast data. Please try another city.");
  }

  return data;
}

export async function searchCityPhoto(place, { signal } = {}) {
  const searchTerms = [...new Set([place.name, place.admin1, place.country, "city skyline"].filter(Boolean))]
    .join(" ");
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: searchTerms,
    gsrnamespace: "6",
    gsrqiprofile: "classic",
    gsrwhat: "text",
    gsrinfo: "suggestion",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1400",
    format: "json",
    origin: "*"
  });
  const response = await fetch(`${COMMONS_API_URL}?${params}`, { signal });

  if (!response.ok) {
    throw new Error(`City photo search failed (HTTP ${response.status}).`);
  }

  const data = await response.json();
  const pages = Object.values(data.query?.pages ?? {})
    .map((page) => ({
      page,
      relevance: getPhotoRelevance(page.title, place)
    }))
    .filter((result) => result.relevance > 0)
    .sort((first, second) => second.relevance - first.relevance
      || (first.page.index ?? Infinity) - (second.page.index ?? Infinity));

  for (const { page } of pages) {
    const imageInfo = page.imageinfo?.[0];
    const imageUrl = getSafeCommonsUrl(imageInfo?.thumburl);
    const pageUrl = getSafeCommonsPageUrl(imageInfo?.descriptionurl);
    if (!imageUrl || !pageUrl) {
      continue;
    }

    const metadata = imageInfo.extmetadata ?? {};
    return {
      url: imageUrl,
      pageUrl,
      title: page.title?.replace(/^File:/, "") ?? `${place.name} city photo`,
      location: [place.name, place.admin1, place.country]
        .filter((part, index, parts) => Boolean(part) && parts.indexOf(part) === index)
        .join(", "),
      creator: metadata.Artist?.value ? getPlainText(metadata.Artist.value) : "Wikimedia Commons contributor",
      license: metadata.LicenseShortName?.value
        ? getPlainText(metadata.LicenseShortName.value)
        : "Wikimedia Commons"
    };
  }

  return null;
}

export function getWeatherDescription(code) {
  return WEATHER_CODES[code] ?? {
    description: "Conditions unavailable",
    icon: "🌡️",
    tone: "neutral"
  };
}

function getPhotoRelevance(title, place) {
  const normalizedTitle = normalizeSearchText(title?.replace(/^File:/, "") ?? "");
  const city = normalizeSearchText(place.name);
  const region = normalizeSearchText(place.admin1 ?? "");
  const country = normalizeSearchText(place.country ?? "");
  let score = 0;

  if (city && normalizedTitle.includes(city)) {
    score += 100;
  }
  if (region && normalizedTitle.includes(region)) {
    score += 30;
  }
  if (country && normalizedTitle.includes(country)) {
    score += 20;
  }
  if (/\b(skyline|cityscape|landmark|city|bridge|view)\b/.test(normalizedTitle)) {
    score += 8;
  }

  return score;
}

function normalizeSearchText(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

function getSafeCommonsUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".wikimedia.org")
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getSafeCommonsPageUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "commons.wikimedia.org"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getPlainText(value) {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return parsed.body.textContent.trim();
}

function isValidPlace(place) {
  return place
    && typeof place.name === "string"
    && Number.isFinite(place.latitude)
    && Number.isFinite(place.longitude);
}
