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

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim() || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Account creation failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google sign-up failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] p-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#6D8196] text-[#FFFFE3] flex items-center justify-center mx-auto mb-4 border border-[#576A7E]">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] tracking-tight">
            Get Started with CatalogForge
          </h1>
          <p className="text-sm text-[#4A4A4A]/70 mt-1">
            Create your account to start enriching raw product catalogs
          </p>
        </div>

        {/* SignUp Card (Zero Shadows) */}
        <div className="bg-white border border-[#CBCBCB] rounded-2xl p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="signup-firstname"
                  className="block text-xs font-bold text-[#4A4A4A] mb-1.5"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                  suppressHydrationWarning
                  className="w-full px-3 py-2.5 text-sm bg-[#ECEFF2] border border-[#CBCBCB] rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none focus:border-[#6D8196] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-lastname"
                  className="block text-xs font-bold text-[#4A4A4A] mb-1.5"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="signup-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  suppressHydrationWarning
                  className="w-full px-3 py-2.5 text-sm bg-[#ECEFF2] border border-[#CBCBCB] rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none focus:border-[#6D8196] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-bold text-[#4A4A4A] mb-1.5"
              >
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@company.com"
                autoComplete="email"
                required
                suppressHydrationWarning
                className="w-full px-3 py-2.5 text-sm bg-[#ECEFF2] border border-[#CBCBCB] rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none focus:border-[#6D8196] transition-colors"
              />
            </div>

            {/* Company Name (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signup-company"
                  className="block text-xs font-bold text-[#4A4A4A]"
                >
                  Company Name
                </label>
                <span className="text-[10px] text-[#4A4A4A]/60">Optional</span>
              </div>
              <input
                id="signup-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Industrial Supply"
                suppressHydrationWarning
                className="w-full px-3 py-2.5 text-sm bg-[#ECEFF2] border border-[#CBCBCB] rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none focus:border-[#6D8196] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-bold text-[#4A4A4A] mb-1.5"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  suppressHydrationWarning
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-[#ECEFF2] border border-[#CBCBCB] rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none focus:border-[#6D8196] transition-colors"
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
              <p className="text-[11px] text-[#4A4A4A]/60 mt-1 font-medium">Must be at least 6 characters long.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || submitting || authLoading}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6D8196] hover:bg-[#576A7E] border border-[#576A7E] text-[#FFFFE3] text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#CBCBCB]" />
            <span className="text-[11px] text-[#4A4A4A]/60 uppercase tracking-wider font-bold">or sign up with</span>
            <div className="flex-1 h-px bg-[#CBCBCB]" />
          </div>

          {/* Social Sign-Up: Google */}
          <div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignUp}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-[#ECEFF2] border border-[#CBCBCB] text-[#4A4A4A] text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
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

          {/* Already have an account link */}
          <div className="text-center pt-2 border-t border-[#CBCBCB]">
            <p className="text-xs text-[#4A4A4A]/80 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#6D8196] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#4A4A4A]/60 mt-6 font-medium">
          CatalogForge.tech — Enterprise Product Intelligence
        </p>
      </div>
    </div>
  );
}
