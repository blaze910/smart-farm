export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 farm-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/75" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <section className="glass-card w-full rounded-[2rem] p-6 sm:p-10 lg:p-12">
          <div className="flex w-full flex-col gap-8">
            <div className="space-y-4 text-center sm:space-y-5">
              <p className="mx-auto inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200 shadow-sm shadow-emerald-500/10">
                Smart Farming Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Welcome to SmartFarm
              </h1>
              <p className="mx-auto max-w-3xl text-base leading-7 text-slate-300 sm:text-lg lg:text-xl">
                Explore a modern web experience built for precision agriculture, crop insight, and weather-aware farming.
                Discover the power of a responsive dashboard designed for growers, advisors, and sustainable harvests.
              </p>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <a
                href="/login"
                className="inline-flex min-w-[10rem] items-center justify-center rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Login
              </a>
              <a
                href="/signup"
                className="inline-flex min-w-[10rem] items-center justify-center rounded-full border border-emerald-300/30 bg-white/10 px-8 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-white/15"
              >
                Sign Up
              </a>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300 shadow-lg shadow-slate-950/20 sm:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-3xl bg-white/5 p-4 sm:flex-row">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19h16" />
                    <path d="M4 13h16" />
                    <path d="M4 7h16" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-white">Field Intelligence</p>
                  <p className="mt-1 leading-6 text-slate-300">Harvest-ready insights from soil, weather, and crop health.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-3xl bg-white/5 p-4 sm:flex-row">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l2-2 4 4 8-8 4 4" />
                    <path d="M12 20h9" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-white">Sustainable Growth</p>
                  <p className="mt-1 leading-6 text-slate-300">Designed for scalable operations and smarter decisions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel mt-8 w-full rounded-[2rem] px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-5 text-slate-100 sm:grid-cols-2 md:grid-cols-3">
            <article className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-200">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Real-time Alerts</h3>
              <p className="text-sm leading-6 text-slate-300">Stay ahead with weather, pest, and crop warning notifications tailored to your fields.</p>
            </article>
            <article className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-200">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 17h16" />
                  <path d="M7 17V7h3v10" />
                  <path d="M14 17V4h3v13" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Weather Intelligence</h3>
              <p className="text-sm leading-6 text-slate-300">Track sunrise patterns, soil moisture, and forecasts that shape every planting decision.</p>
            </article>
            <article className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-200">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                  <path d="M7 8l5-5 5 5" />
                  <path d="M7 16l5 5 5-5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Yield Forecasts</h3>
              <p className="text-sm leading-6 text-slate-300">Visualize crop performance and plan harvests with confidence using intelligent data summaries.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
