# Weather Outlook

A beginner-friendly, responsive weather dashboard built with HTML, CSS, and vanilla JavaScript ES modules. City search uses the Open-Meteo Geocoding API, forecasts use the Open-Meteo Forecast API, and a matching city photo is looked up on Wikimedia Commons. No API key, backend, package manager, or build step is required.

## Run with VS Code Live Server

1. Open the `weather-forecast-app` folder in Visual Studio Code.
2. Install the **Live Server** extension if needed.
3. Open `index.html` and select **Go Live** in the status bar (or right-click the file and choose **Open with Live Server**).
4. Search for a city, such as **Addis Ababa**, **Tokyo**, or **Lisbon**.

The app uses JavaScript ES modules and should be served over HTTP by Live Server. If the forecast cannot load, check your internet connection and try again.

## How the files work

- `index.html` defines the semantic page structure, accessible search form, live status regions, and links the stylesheet and JavaScript module.
- `assets/css/style.css` styles the dashboard, weather details, loading and error states, and responsive layouts for small and large screens.
- `assets/js/app.js` validates the city form, coordinates city lookup and forecast requests, handles city selection and retry, and prevents stale requests from replacing newer results.
- `assets/js/weather.js` calls the Open-Meteo geocoding and forecast APIs, checks HTTP responses, and maps WMO weather codes to descriptions and icons.
- `assets/js/ui.js` renders the search states, city choices, current conditions, city photo credit, and five-day forecast using DOM elements and `textContent`.
- `assets/images/` is available for optional local images; city photos are loaded on demand from Wikimedia Commons.

## Features

- Search city names and choose between matching locations.
- Current temperature and readable condition with feels-like temperature, humidity, and wind speed.
- Daily high/low temperatures and precipitation probability for five days.
- Initial, loading, no-results, and recoverable error states.
- Responsive weather cards, accessible labels, visible keyboard focus, and screen-reader status updates.
- Weather descriptions and icons for common WMO weather codes.
- A city-and-country-matched photo (for example, London, England, United Kingdom) with a visible creator/license credit link when Commons has a suitable image.
- Open-Meteo attribution and links to the API documentation.

## Data and limitations

- Geocoding: [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com/v1/search)
- Forecasts: [Open-Meteo Forecast API](https://api.open-meteo.com/v1/forecast)
- City photos: [Wikimedia Commons API](https://commons.wikimedia.org/wiki/Commons:API)
- Images are displayed from Wikimedia Commons, credited to the contributor and license listed on each image's Commons file page.
- Documentation: [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)
- Open-Meteo provides weather data under its published [terms and attribution guidance](https://open-meteo.com/en/terms).
- The app requires an internet connection and a browser that supports JavaScript ES modules and `fetch`.
- Units use the API's default metric values. Forecasts are retrieved for the selected place's local timezone.
- This educational project does not provide weather alerts or guarantee forecast accuracy.

## Test checklist

- [ ] Search for **Addis Ababa** and confirm current conditions and five forecast days display.
- [ ] Search for a different city, such as **Tokyo**, and confirm the displayed place updates.
- [ ] Confirm a city photo and its credit appear on the current weather card when Wikimedia Commons has a matching image.
- [ ] Search for a common name such as **Springfield** and choose the intended matching location.
- [ ] Submit an empty search and confirm validation asks for a city name.
- [ ] Search for a made-up city and confirm the no-results state appears.
- [ ] Disconnect from the network or block the API and confirm a helpful error and retry option appear.
- [ ] Confirm the forecast shows five daily cards with condition, high/low, and precipitation chance.
- [ ] Test at desktop, tablet, and mobile widths; confirm the search form and cards remain usable.
- [ ] Block the Commons API and confirm the weather forecast still renders without a city photo.
- [ ] Navigate with the keyboard and confirm buttons, input labels, focus indicators, and status announcements work.
