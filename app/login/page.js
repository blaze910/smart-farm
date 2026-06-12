"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await loginUser({ identifier, password });

    if (!result.success) {
      setLoading(false);
      setError(result.message);
      if (result.shouldRedirect) {
        setRedirecting(true);
        setTimeout(() => window.location.assign("/signup"), 600);
      }
      return;
    }

    setRedirecting(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 900);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 farm-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/75" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="glass-card glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/25 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-3xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Login to FarmPulse</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Sign in to your account</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Access the dashboard with your registered email and password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {loading ? (
              <div className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-emerald-200">Please wait while we sign you in...</div>
            ) : null}

            <label className="block text-sm text-slate-300">
              Email or Username
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Password
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  maxLength={16}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 pr-24 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-emerald-300 transition hover:bg-slate-800"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5C7 19.5 3.11 16.36 1.5 12a10.94 10.94 0 0 1 2.26-3.94" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3.5 3.5 0 0 0 14.47 14.47" />
                      <path d="M9.88 5.12A10.94 10.94 0 0 1 12 4.5c5 0 8.89 3.14 10.5 7.5a10.94 10.94 0 0 1-1.77 3.05" />
                      <path d="M15 12a3 3 0 0 0-4.24-2.76" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
                    <path d="M21 12a9 9 0 0 1-9 9" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-400">
            <Link href="/forgot-password" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Forgot password?
            </Link>
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Join us today.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
