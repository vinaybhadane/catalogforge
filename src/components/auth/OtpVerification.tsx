"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface OtpVerificationProps {
  email: string;
  purpose: "signup_verification" | "login_2fa" | "password_reset";
  recipientName?: string;
  onSuccess: () => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export function OtpVerification({
  email,
  purpose,
  recipientName,
  onSuccess,
  onCancel,
  title,
  subtitle,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendSuccessNotice, setResendSuccessNotice] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle individual digit change
  const handleDigitChange = (index: number, value: string) => {
    // Only allow single numeric digit
    const cleaned = value.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event (e.g. user copies 6 digits "482910")
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    setError(null);

    // Focus on the next empty or last input
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // Check if complete 6 digits are entered
  const isComplete = digits.every((d) => d.length === 1);
  const otpCode = digits.join("");

  // Submit OTP Verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete || isVerifying) return;

    setIsVerifying(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          purpose,
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || "Invalid 6-digit verification code. Please check and try again.");
      }

      // Success callback
      await onSuccess();
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP email via Brevo
  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setError(null);
    setResendSuccessNotice(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          purpose,
          name: recipientName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code. Please try again.");
      }

      setResendSuccessNotice("A new 6-digit code has been sent to your email.");
      setResendCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const defaultTitle =
    purpose === "signup_verification"
      ? "Verify Your Email"
      : purpose === "login_2fa"
      ? "Two-Factor Authentication"
      : "Password Reset Code";

  const defaultSubtitle =
    purpose === "signup_verification"
      ? `We have dispatched a 6-digit verification code to ${email}`
      : purpose === "login_2fa"
      ? `Enter the 6-digit security code sent to ${email} to authorize login`
      : `Enter the 6-digit reset code sent to ${email}`;

  return (
    <div className="space-y-5 select-none">
      {/* Top Header Badge */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
          {purpose === "login_2fa" ? (
            <ShieldCheck className="w-6 h-6" />
          ) : (
            <Mail className="w-6 h-6" />
          )}
        </div>
        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
          {title || defaultTitle}
        </h2>
        <p className="text-xs text-[#475569] font-medium max-w-xs mx-auto leading-relaxed">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resend Success Notice */}
      {resendSuccessNotice && !error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resendSuccessNotice}</span>
        </div>
      )}

      {/* 6-Digit Inputs Grid */}
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-[#0F172A] bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all font-mono"
            />
          ))}
        </div>

        {/* Submit Verification Action */}
        <button
          type="submit"
          disabled={!isComplete || isVerifying}
          className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{purpose === "signup_verification" ? "Verify & Activate Account" : "Verify & Access Workspace"}</span>
            </>
          )}
        </button>
      </form>

      {/* Footer: Resend Code + Cancel/Back Trigger */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="text-slate-500 font-medium">
          Didn't receive the email?{" "}
          {resendCountdown > 0 ? (
            <span className="font-bold text-[#2563EB]">Resend in {resendCountdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
            >
              {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Resend Code</span>
            </button>
          )}
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-bold inline-flex items-center gap-1 mt-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Use a different email / Go back</span>
          </button>
        )}
      </div>
    </div>
  );
}
