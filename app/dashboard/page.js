"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout, markUserAsReturning } from "../lib/auth";
import GlobalMapSection from "../Components/GlobalMapSection";
import TinyBoxGrid from "../Components/TinyBoxGrid";

export default function DashboardPage() {
  const [user] = useState(() => getCurrentUser());
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.isNew) {
      markUserAsReturning(user);
    }
  }, [router, user]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-center shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Checking session...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8">
        <div className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30 backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Dashboard</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {user.isNew ? `Welcome, ${user.name}` : `Welcome back, ${user.name}`}
              </h1>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                You are signed in as {user.email}. Use the dashboard to explore weather updates, crop forecasts, market pricing, and pest risk alerts.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 shadow-lg shadow-slate-950/20">
                <h2 className="text-xl font-semibold text-white">Farm intelligence at a glance</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Monitor geography, climate, soil, and pest risk from a single dashboard built for modern farming.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 shadow-lg shadow-slate-950/20">
                <h2 className="text-xl font-semibold text-white">Quick actions</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use the map search, jump into sections, and keep your farm operations moving with premium hover interactions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 sm:w-auto"
              >
                Sign Out
              </button>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15 sm:w-auto"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <GlobalMapSection />
        <TinyBoxGrid />
      </div>
    </main>
  );
}
