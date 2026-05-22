const PEST_API = process.env.NEXT_PUBLIC_PEST_PROPHET_API_URL || "https://api.pestprophet.example.com/v1";
const PEST_KEY = process.env.NEXT_PUBLIC_PEST_PROPHET_API_KEY || "";
const WEATHER_API = process.env.NEXT_PUBLIC_WEATHER_API_URL || "https://api.weather.example.com/v1";
const WEATHER_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
const MARKET_API = process.env.NEXT_PUBLIC_MARKET_PRICES_API_URL || "https://api.marketprices.example.com/v1";
const MARKET_KEY = process.env.NEXT_PUBLIC_MARKET_PRICES_API_KEY || "";

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("safeFetch error", error);
    return { ok: false, status: 0, data: null };
  }
}

export async function fetchPestRisk({ lat, lon }) {
  if (!PEST_API) return { ok: false, message: "Pest API not configured" };
  const url = `${PEST_API}/risk?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const headers = PEST_KEY ? { Authorization: `Bearer ${PEST_KEY}` } : {};
  return safeFetch(url, { headers });
}

export async function fetchWeather({ lat, lon }) {
  if (!WEATHER_API) return { ok: false, message: "Weather API not configured" };
  const url = `${WEATHER_API}/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&days=7`;
  const headers = WEATHER_KEY ? { Authorization: `Bearer ${WEATHER_KEY}` } : {};
  return safeFetch(url, { headers });
}

export async function fetchMarketPrices({ commodity = "produce" }) {
  if (!MARKET_API) return { ok: false, message: "Market API not configured" };
  const url = `${MARKET_API}/prices?commodity=${encodeURIComponent(commodity)}`;
  const headers = MARKET_KEY ? { Authorization: `Bearer ${MARKET_KEY}` } : {};
  return safeFetch(url, { headers });
}
