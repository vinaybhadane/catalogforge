"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { OtpVerification } from "@/components/auth/OtpVerification";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, loading: authLoading } = useAuth();

  // Auto-redirect to dashboard when user session is active
  useEffect(() => {
    if (user && !authLoading) {
      window.location.href = "/dashboard";
    }
  }, [user, authLoading]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA OTP Step State
  const [pendingOtp, setPendingOtp] = useState(false);

  const isValid = email.trim().length > 0 && password.length >= 6;

  // Step 1: Validate Credentials and Trigger 2FA OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      // First verify email & password with Firebase Auth
      await signIn(email.trim(), password);

      // Now send 2FA OTP via Email Service
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          purpose: "login_2fa",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch 2FA security code. Please try again.");
      }

      setPendingOtp(true);
    } catch (err: any) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: 2FA OTP Verified Successfully -> Grant Dashboard Access
  const handleOtpVerified = () => {
    window.location.href = "/dashboard";
  };

  // Google OAuth Direct Sign-In
  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google sign-in failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white text-[#171717] font-sans antialiased selection:bg-[#C8FF00] selection:text-[#171717] relative overflow-x-hidden">
      {/* Subtle ambient background grid */}
      <div className="absolute inset-0 bg-subtle-grid mask-radial-fade opacity-60 pointer-events-none" />

      {/* Payline-Style Floating Black Pill Brand Header */}
      <div className="w-full pt-4 sm:pt-6 px-4 sm:px-6 relative z-10 flex justify-center animate-header-enter">
        <header className="w-full max-w-[1140px] bg-[#171717] text-white rounded-full h-[56px] sm:h-[62px] px-5 sm:px-6 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.16)] border border-neutral-800/80">
          {/* Brand Logo with Neon Lime Wave Mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] rounded-full py-1"
          >
            <div className="w-[32px] h-[32px] rounded-full bg-[#1F1F1F] border border-neutral-700/80 flex items-center justify-center p-1 group-hover:border-[#C8FF00] transition-colors shadow-2xs shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8C7.5 6 10.5 6 13 7.5C15.5 9 17.5 9 19 8" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 11.5C7 9 11 9.5 14 11.5C17 13.5 18.5 13 20 11" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 15C6.5 13 10.5 13 13.5 15C16.5 17 18 16.5 20 14.5" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M5 18.5C7.5 16.5 10.5 16.5 13 18C15.5 19.5 17.5 19.5 19 18" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center tracking-tight">
              <span className="font-bold text-[15.5px] sm:text-[16.5px] text-white tracking-[-0.03em]">
                CATALOG<span className="text-[#C8FF00]">FORGE</span>
              </span>
            </div>
          </Link>

          {/* Secondary Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[12.5px] font-medium text-neutral-400 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to website</span>
            </Link>
            <Link
              href="/signup"
              className="text-[12.5px] font-semibold text-[#171717] bg-[#C8FF00] hover:bg-[#b8eb00] px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
            >
              Create Account
            </Link>
          </div>
        </header>
      </div>

      {/* Main Authentication Card Composition */}
      <main className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[440px] animate-fade-in-up">
          {/* Header Typography */}
          <div className="text-center mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
              Welcome back.
            </h1>
            <p className="text-[13.5px] text-[#686868] mt-1.5 font-normal">
              Sign in to your CatalogForge workspace.
            </p>
          </div>

          {/* Premium White Surface Card */}
          <div className="bg-white border border-[#EAEAEA] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-5">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-800 text-[12.5px] animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {pendingOtp ? (
              /* 2FA OTP Step View */
              <OtpVerification
                email={email.trim()}
                purpose="login_2fa"
                onSuccess={handleOtpVerified}
                onCancel={() => {
                  setPendingOtp(false);
                  setError(null);
                }}
                title="Two-Factor Security Code"
                subtitle={`We've dispatched a 6-digit OTP code to ${email}. Enter it below to unlock your workspace.`}
              />
            ) : (
              /* Email & Password Login View */
              <>
                <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-[12.5px] font-semibold text-[#171717] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                      suppressHydrationWarning
                      className="w-full h-12 px-4 text-[14px] bg-[#FBFBFB] hover:bg-white focus:bg-white border border-[#E5E7EB] rounded-2xl text-[#171717] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all font-medium"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="login-password"
                        className="text-[12.5px] font-semibold text-[#171717]"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        minLength={6}
                        suppressHydrationWarning
                        className="w-full h-12 px-4 pr-11 text-[14px] bg-[#FBFBFB] hover:bg-white focus:bg-white border border-[#E5E7EB] rounded-2xl text-[#171717] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#171717] transition-colors p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        suppressHydrationWarning
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isValid || submitting || authLoading}
                    className="w-full h-12 px-5 bg-[#171717] hover:bg-black disabled:opacity-50 text-white font-semibold text-[14px] rounded-full transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C8FF00]" />
                        <span>Verifying &amp; Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
                        <span>Sign In with 2FA</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#EAEAEA]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#8A8A8A] font-semibold uppercase tracking-wider text-[10px]">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting || authLoading}
                  className="w-full h-12 px-5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#171717] font-semibold text-[13.5px] rounded-full transition-colors flex items-center justify-center gap-3 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </div>

          {/* Footer Link */}
          <p className="text-center text-[13px] text-[#686868] mt-6 font-normal">
            New to CatalogForge?{" "}
            <Link
              href="/signup"
              className="text-[#171717] font-semibold underline underline-offset-4 hover:text-black transition-colors"
            >
              Create account
            </Link>
          </p>

          {/* Subtle Copyright Note */}
          <p className="text-center text-[11px] text-[#A1A1A1] mt-8">
            © 2026 CatalogForge. Industrial AI Intelligence &amp; Governance.
          </p>
        </div>
      </main>
    </div>
  );
}
