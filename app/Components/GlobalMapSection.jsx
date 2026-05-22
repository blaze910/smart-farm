"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, MapPin } from "lucide-react";

const tileUrl = process.env.NEXT_PUBLIC_LEAFLET_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution = process.env.NEXT_PUBLIC_LEAFLET_ATTRIBUTION || "&copy; OpenStreetMap contributors";
const geocodeUrl = process.env.NEXT_PUBLIC_GEOCODE_API_URL || "https://nominatim.openstreetmap.org/search";

export default function GlobalMapSection() {
  const rootRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [zoneLabel, setZoneLabel] = useState("Global farm zone");
  const [searchState, setSearchState] = useState("Search up a particular zone on Earth to fetch data and preview layers.");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayer, setSelectedLayer] = useState("Soil");

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current || mapRef.current) return;

    let mounted = true;

    async function initMap() {
      try {
        await import('leaflet/dist/leaflet.css');
        const leafletMod = await import('leaflet');
        const L = leafletMod?.default || leafletMod;

        if (!mounted || !rootRef.current) return;

        const map = L.map(rootRef.current, {
          center: [20, 0],
          zoom: 2,
          scrollWheelZoom: false,
          zoomControl: true,
        });

        L.tileLayer(tileUrl, {
          attribution,
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
      } catch (err) {
        console.error('Failed to load Leaflet on client:', err);
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
      }
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setSearchState("Type a region name to reveal climate and soil data.");
      return;
    }

    setSearchState(`Searching for ${query}...`);

    try {
      const response = await fetch(
        `${geocodeUrl}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=0`
      );
      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        setSearchState(`No zone found for "${query}". Try another region.`);
        return;
      }

      const place = results[0];
      const latitude = parseFloat(place.lat);
      const longitude = parseFloat(place.lon);
      setZoneLabel(place.display_name);
      setSearchState(`Zone data loaded for ${place.display_name}.`);

      if (mapRef.current) {
        mapRef.current.flyTo([latitude, longitude], 5, { duration: 1.4 });
        if (markerRef.current) {
          markerRef.current.remove();
        }
        markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      }
    } catch (error) {
      console.error(error);
      setSearchState("Unable to resolve that zone right now. Please try again later.");
    }
  };

  return (
    <section className="glass-card w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-3xl sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200">
            <MapPin className="h-4 w-4" /> Global Engine
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Global Map Intelligence</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore an interactive Leaflet map with zone search, soil and rain layers, and a live preview of the farm area you want to monitor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Soil', 'Rain', 'Crop', 'Climate'].map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setSelectedLayer(layer)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedLayer === layer
                    ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-4 w-4" /> {layer} layer
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-4 text-slate-300 shadow-lg shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Current view</p>
          <div className="rounded-3xl bg-slate-900/80 p-4 text-slate-100">
            <p className="text-sm text-slate-400">Selected zone</p>
            <p className="mt-2 text-lg font-semibold text-white">{zoneLabel}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Layer</p>
              <p className="mt-2 text-sm font-semibold text-white">{selectedLayer}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-semibold text-white">{searchState.includes('loaded') ? 'Ready' : 'Idle'}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <label className="sr-only" htmlFor="zone-search">
          Search zone
        </label>
        <input
          id="zone-search"
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search up a particular zone"
          className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="submit"
          className="rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Search zone
        </button>
      </form>

      <p className="mt-4 text-sm leading-6 text-slate-400">{searchState}</p>
      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80">
        <div ref={rootRef} className="h-[420px] min-h-[20rem] w-full" />
      </div>
    </section>
  );
}
