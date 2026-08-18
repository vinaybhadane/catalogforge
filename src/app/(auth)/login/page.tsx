"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Zap,
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
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
              <label
                htmlFor="login-password"
                className="block text-xs font-black text-[#000000] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  suppressHydrationWarning
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#000000]/60 hover:text-[#000000] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting || authLoading}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-get-started-oval text-white text-sm font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-[11px] text-[#0284C7] uppercase tracking-wider font-extrabold">or sign in with</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Social Login: Google */}
          <div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#000000] text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Don't have an account link */}
          <div className="text-center pt-2 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#000000] font-semibold">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-extrabold text-[#2563EB] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#000000]/60 mt-6 font-bold">
          CatalogForge.tech — Enterprise Product Intelligence
        </p>
      </div>
    </div>
  );
}
