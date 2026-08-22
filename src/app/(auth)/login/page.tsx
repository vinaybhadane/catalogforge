"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Zap,
  ShieldCheck,
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 py-12 text-[#000000]">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] p-1.5 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(51,134,231,0.25)] group-hover:scale-105 transition-transform">
              <Image
                src="/logo-icon.png"
                alt="CatalogForge Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-[#3386E7]">Catalog</span>
              <span className="text-[#000000]">Forge</span>
            </h1>
            <p className="text-xs text-[#0284C7] font-bold mt-1">
              Sign in to your AI workspace
            </p>
          </Link>
        </div>

        {/* Clean Flat Login Card (Zero Shadows) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
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
                    className="block text-xs font-black text-[#000000] mb-1.5"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-xs font-black text-[#000000]"
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
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#000000]/40 hover:text-[#000000] transition-colors"
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
                  className="w-full py-2.5 px-4 bg-[#3386E7] hover:bg-[#2060B6] disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In with 2FA</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#000000]/50 font-bold uppercase tracking-wider text-[10px]">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting || authLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#000000] font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 cursor-pointer"
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
        <p className="text-center text-xs text-[#000000]/60 mt-6 font-medium">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-[#3386E7] hover:text-[#2060B6] font-black hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
