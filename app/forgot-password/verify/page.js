"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendPasswordResetOtp, verifyPasswordResetOtp } from "../../lib/auth";

// 1. ALL LOGIC AND UI 
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const inputRefs = useRef([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showResendCountdown, setShowResendCountdown] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (timer <= 0) {
      if (showResendCountdown) {
        setShowResendCountdown(false);
      }
      return undefined;
    }

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
  }, [timer, showResendCountdown]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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
    setIsVerified(false);

    if (formattedCode.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    setIsVerifying(true);
    setMessage("Please wait while we verify your code...");

    await new Promise((resolve) => window.setTimeout(resolve, 800));

    const result = await verifyPasswordResetOtp({ email, code: formattedCode });
    setIsVerifying(false);

    if (!result.success) {
      setError(result.message);
      setMessage("");
      setIsVerified(false);
      return;
    }

    setIsVerified(true);
    setMessage("Verified successfully.");
    redirectTimeoutRef.current = window.setTimeout(() => {
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
    }, 1500);
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsVerified(false);
    setIsSending(true);
    const result = await sendPasswordResetOtp(email);
    setIsSending(false);

    if (!result.success) {
      setError(result.message || "Unable to resend verification code. Please try again.");
      return;
    }

    setMessage(result.message || "If an account exists, a code was sent.");
    setCode(["", "", "", "", "", ""]);
    focusInput(0);
    setTimer(60);
    setShowResendCountdown(true);
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
              We sent a verification code to {email}. It will expire in 3 minutes.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {message ? (
              <div className="flex items-center gap-3 rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {isVerified ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100/10 text-white ring-1 ring-white/20">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 12.5l4 4 8-8" />
                    </svg>
                  </span>
                ) : null}
                <span>{message}</span>
              </div>
            ) : null}

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
              {showResendCountdown && timer > 0 ? (
                <span>Resend available in {timer}s</span>
              ) : (
                <span className="text-slate-400">You can request a new code.</span>
              )}
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
              disabled={isVerifying}
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify code"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
//Wraps the content in Suspense to allow for future async data fetching if needed, while currently just showing a loading state on initial render.
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
