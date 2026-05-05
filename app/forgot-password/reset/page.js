"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, getResetSession } from "../../lib/auth";

// 1. All your logic and HTML go here
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = getResetSession();
    if (!email || !session || session.email !== email || session.expiresAt < Date.now()) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await resetPassword({ email, password });
    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 farm-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/75" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="glass-card glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/25 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-3xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">New Password</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Choose a secure password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Set a new password for {email}. This code is valid only for a short time.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}

            <label className="block text-sm text-slate-300">
              New password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                required
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Reset password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

// 2. The main page component wraps the content in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
