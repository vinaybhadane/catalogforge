"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Zap,
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
    <div className="min-h-screen flex items-center justify-center bg-[#E2E6E9] p-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand in Tactile Well */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl neu-btn-accent text-[#FFFFE3] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Zap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">
            CatalogForge
          </h1>
          <p className="text-xs text-[#6D8196] font-bold mt-1">
            Sign in to your AI workspace
          </p>
        </div>

        {/* Neumorphic Extruded Login Card */}
        <div className="neu-card rounded-3xl p-7 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-extrabold text-[#4A4A4A] mb-1.5"
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
                className="w-full px-3.5 py-2.5 text-sm neu-input placeholder:text-[#4A4A4A]/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-extrabold text-[#4A4A4A] mb-1.5"
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
                  minLength={6}
                  suppressHydrationWarning
                  className="w-full px-3.5 py-2.5 pr-10 text-sm neu-input placeholder:text-[#4A4A4A]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#4A4A4A]/60 hover:text-[#4A4A4A] transition-colors"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 neu-btn-accent text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex-1 h-px bg-[#CBCBCB]/60" />
            <span className="text-[11px] text-[#6D8196] uppercase tracking-wider font-extrabold">or sign in with</span>
            <div className="flex-1 h-px bg-[#CBCBCB]/60" />
          </div>

          {/* Social Login: Google */}
          <div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 neu-btn text-[#4A4A4A] text-xs font-bold transition-all disabled:opacity-50"
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
          <div className="text-center pt-2 border-t border-[#CBCBCB]/60">
            <p className="text-xs text-[#4A4A4A] font-semibold">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-extrabold text-[#6D8196] hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#4A4A4A]/60 mt-6 font-bold">
          CatalogForge.tech — Enterprise Product Intelligence
        </p>
      </div>
    </div>
  );
}
