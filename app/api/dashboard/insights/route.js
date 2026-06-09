import { NextResponse } from "next/server";

const cropRecommendationsByRegion = {
  default: [
    { crop: "Maize", suitability: "High", reason: "Warm, well-drained soil" },
    { crop: "Soybean", suitability: "Good", reason: "Stable rainfall forecast" },
    { crop: "Tomato", suitability: "Moderate", reason: "Requires irrigation support" },
  ],
};

const soilProfiles = {
  default: {
    moisture: "42%",
    ph: "6.4",
    nitrogen: "Medium",
    phosphorus: "Good",
    potassium: "Balanced",
    recommendation: "Add compost and maintain irrigation cycles.",
  },
};

const marketPrices = [
  { product: "Tomato", price: "₦184/kg", change: "+3.2%" },
  { product: "Maize", price: "₦95/kg", change: "+1.6%" },
  { product: "Rice", price: "₦320/kg", change: "-0.8%" },
  { product: "Onion", price: "₦210/kg", change: "+4.1%" },
];

const pestAlerts = [
  { type: "Fall Armyworm", severity: "High", message: "Monitor maize fields and use integrated pest management." },
  { type: "Aphids", severity: "Medium", message: "Check tomato and pepper crops for yellowing leaves." },
];

const plantingSuggestionsByRegion = {
  default: [
    { crop: "Maize", when: "Start of rainy season", where: "Well-drained fields", note: "Plant at 60cm spacing; ensure seedbed is moist." },
    { crop: "Tomato", when: "After last frost / warm nights", where: "Irrigated beds or greenhouse", note: "Use stakes and mulching; monitor soil phosphorus." },
    { crop: "Soybean", when: "Early to mid rainy season", where: "Medium to light soils", note: "Inoculate seeds for nitrogen-fixation." },
  ],
};

function getRainfallForecast() {
  const now = new Date();
  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() + index + 1);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      chance: `${35 + index * 10}%`,
      total: `${2 + index * 0.6} mm`,
    };
  });
}

function mapOpenWeatherDaily(daily) {
  return daily.slice(0, 7).map((entry) => ({
    day: new Date(entry.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }),
    minTemp: Math.round(entry.temp.min),
    maxTemp: Math.round(entry.temp.max),
    pop: Math.round((entry.pop ?? 0) * 100),
    condition: entry.weather?.[0]?.main || "Clear",
    description: entry.weather?.[0]?.description || "Clear sky",
  }));
}

async function fetchWeatherForecast(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) return null;

  const geoData = await geoRes.json();
  if (!Array.isArray(geoData) || geoData.length === 0) return null;

  const { lat, lon } = geoData[0];
  if (typeof lat !== "number" || typeof lon !== "number") return null;

  const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) return null;

  const weatherData = await weatherRes.json();
  if (!weatherData || !Array.isArray(weatherData.daily)) return null;

  return mapOpenWeatherDaily(weatherData.daily);
}

export async function GET(request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location")?.trim() || "Your farm";

  const locationKey = location.toLowerCase().includes("lagos") ? "default" : "default";

  const weatherData = (await fetchWeatherForecast(location)) || getWeatherForecast();

  return NextResponse.json({
    location,
    cropRecommendations: cropRecommendationsByRegion[locationKey] || cropRecommendationsByRegion.default,
    soilData: soilProfiles[locationKey] || soilProfiles.default,
    weatherData,
    rainfallData: getRainfallForecast(),
    marketData: marketPrices,
    pestData: pestAlerts,
    plantingSuggestions: plantingSuggestionsByRegion[locationKey] || plantingSuggestionsByRegion.default,
    generatedAt: new Date().toISOString(),
  });
}
