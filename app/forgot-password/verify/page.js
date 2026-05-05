"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendPasswordResetOtp, verifyPasswordResetOtp } from "../../lib/auth";

// 1. ALL LOGIC AND UI MOVED HERE
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const inputRefs = useRef([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(120);
  const [isSending, setIsSending] = useState(false);
  const [resendKey, setResendKey] = useState(0);

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendKey]);

  const formattedCode = useMemo(() => code.join(""), [code]);

  const focusInput = (index) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleInputChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...code];
    updated[index] = value;
    setCode(updated);

    if (value && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (formattedCode.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    const result = await verifyPasswordResetOtp({ email, code: formattedCode });
    if (!result.success) {
      setError(result.message);
      return;
    }

    router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsSending(true);
    const result = await sendPasswordResetOtp(email);
    setIsSending(false);

    if (!result.success) {
      setError(result.message || "Unable to resend verification code. Please try again.");
      return;
    }

    setMessage(result.message || "If an account exists, a code was sent.");
    setResendKey((current) => current + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 farm-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/75" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="glass-card glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/25 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-3xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Verify code</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Enter your 6-digit code</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              We sent a verification code to {email}. It will expire in 2 minutes.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}

            <div className="grid grid-cols-6 gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChange={(event) => handleInputChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="h-16 rounded-3xl border border-slate-700 bg-slate-950/80 text-center text-2xl font-semibold text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Resend available in {timer}s</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isSending}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Resending..." : "Resend Code"}
              </button>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Verify code
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

// 2. THE MAIN EXPORT WRAPS IT IN SUSPENSE
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
