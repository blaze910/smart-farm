"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetOtp } from "../lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await sendPasswordResetOtp(email);
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Unable to send verification code. Please try again.");
      return;
    }

    setMessage(result.message || "If an account exists, a code was sent.");
    setTimeout(() => {
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim())}`);
    }, 1200);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 farm-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/75" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="glass-card glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/25 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-3xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Forgot Password</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Reset your access</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Enter your email and we will send a secure 6-digit one-time code if your account exists.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}

            <label className="block text-sm text-slate-300">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send verification code"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
