"use client";

import Link from "next/link";
import { Bug, CloudSun, Seedling, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPestRisk, fetchWeather, fetchMarketPrices } from "../lib/data";

const defaultTemperature = 24;
const defaultHumidity = 55;
const riskStyles = {
  High: { badge: "bg-rose-500/10 text-rose-300", label: "Warning: Aphids" },
  Medium: { badge: "bg-amber-500/10 text-amber-300", label: "Alert: Mites" },
  Low: { badge: "bg-emerald-500/10 text-emerald-300", label: "Healthy field" },
};

const rawCardData = [
  {
    id: "crop-suitability",
    href: "#crop-suitability",
    title: "Crop Suitability",
    description: "See which crops thrive in your selected zone and soil type.",
    accent: "emerald",
    icon: Seedling,
    detail: "Best for corn, beans, and leafy greens.",
  },
  {
    id: "weather-forecast",
    href: "#weather-forecast",
    title: "Weather Forecast",
    description: "Forecast charts for rain, sun, and wind across the next 7 days.",
    accent: "sky",
    icon: CloudSun,
    detail: "Cloudy mornings with clearing afternoons.",
  },
  {
    id: "market-prices",
    href: "#market-prices",
    title: "Market Prices",
    description: "Real-time commodity pricing with currency and unit details.",
    accent: "cyan",
    icon: Tag,
    detail: "USD / kg · Fresh produce trending higher.",
  },
  {
    id: "pest-alerts",
    href: "#pest-alerts",
    title: "Pest Alerts",
    description: "Risk detector powered by Pest Prophet logic for humidity and heat.",
    accent: "rose",
    icon: Bug,
    detail: `${defaultTemperature}°C · ${defaultHumidity}% humidity`,
  },
];

export default function TinyBoxGrid() {
  const [temp, setTemp] = useState(defaultTemperature);
  const [humidity, setHumidity] = useState(defaultHumidity);
  const [riskLevel, setRiskLevel] = useState("Low");

  useEffect(() => {
    async function loadData() {
      // Example: try to fetch market prices and pest risk for a demo location (lat/lon)
      const demoLat = 0;
      const demoLon = 0;

      const [pestRes, weatherRes, marketRes] = await Promise.all([
        fetchPestRisk({ lat: demoLat, lon: demoLon }),
        fetchWeather({ lat: demoLat, lon: demoLon }),
        fetchMarketPrices({ commodity: 'produce' }),
      ]);

      if (weatherRes && weatherRes.ok && weatherRes.data) {
        const w = weatherRes.data;
        // read example fields safely
        const t = w?.current?.temp ?? w?.temp ?? defaultTemperature;
        const h = w?.current?.humidity ?? w?.humidity ?? defaultHumidity;
        setTemp(t);
        setHumidity(h);
      }

      if (pestRes && pestRes.ok && pestRes.data) {
        const risk = pestRes.data?.riskLevel || pestRes.data?.risk || null;
        if (risk === "high" || risk === "High") setRiskLevel("High");
        else if (risk === "medium" || risk === "Medium") setRiskLevel("Medium");
        else {
          const heuristic = (t, h) => (t > 30 && h > 80 ? "High" : t > 25 && h > 75 ? "Medium" : "Low");
          setRiskLevel(heuristic(temp, humidity));
        }
      } else {
        const heuristic = (t, h) => (t > 30 && h > 80 ? "High" : t > 25 && h > 75 ? "Medium" : "Low");
        setRiskLevel(heuristic(temp, humidity));
      }
    }

    loadData().catch((e) => console.error("TinyBoxGrid loadData", e));
  }, []);

  const cardData = rawCardData.map((c) => {
    if (c.id === 'pest-alerts') {
      return { ...c, detail: `${temp}°C · ${humidity}% humidity`, riskLevel };
    }
    return c;
  });

  return (
    <section className="glass-card w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-3xl sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Dashboard shortcuts</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Tiny performance boxes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Click any box to jump to its section. Each card is designed with high contrast and premium hover motion so farmers can scan at a glance.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
          Farmers use these cards to move faster through crop, weather, market, and pest insights.
        </div>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          const isPest = card.id === "pest-alerts";
          return (
            <Link key={card.id} href={card.href} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-800/80">
              <div className="relative h-full min-h-[16rem]">
                {isPest ? (
                  <div className="relative h-40 overflow-hidden bg-slate-800">
                    <img
                      src={
                        card.riskLevel === "High" || riskLevel === "High"
                          ? "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80"
                          : "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={riskStyles[card.riskLevel]?.label || riskStyles[riskLevel].label}
                      className="h-full w-full object-cover"
                    />
                    <div className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${riskStyles[card.riskLevel || riskLevel].badge}`}>
                      {riskStyles[card.riskLevel || riskLevel].label}
                    </div>
                  </div>
                ) : null}

                <div className="flex h-full flex-col justify-between p-5">
                  <div className="space-y-4">
                    <span className={`inline-flex items-center gap-2 rounded-3xl px-3 py-2 text-sm font-semibold ${card.accent === "rose" ? "bg-rose-500/10 text-rose-300" : card.accent === "emerald" ? "bg-emerald-500/10 text-emerald-300" : card.accent === "sky" ? "bg-sky-500/10 text-sky-300" : "bg-cyan-500/10 text-cyan-300"}`}>
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                      {" "}{card.title}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">{card.detail}</p>
                    <span className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-300 transition group-hover:bg-cyan-400/10">
                      View
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="sr-only">
        <div id="crop-suitability">Hidden crop suitability destination section</div>
        <div id="weather-forecast">Hidden weather forecast destination section</div>
        <div id="market-prices">Hidden market prices destination section</div>
        <div id="pest-alerts">Hidden pest alerts destination section</div>
      </div>
    </section>
  );
}
