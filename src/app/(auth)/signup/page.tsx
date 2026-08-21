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

export default function SignUpPage() {
  const router = useRouter();
  const { user, signUp, signInWithGoogle, loading: authLoading } = useAuth();

  // Auto-redirect to dashboard when user session is active
  useEffect(() => {
    if (user && !authLoading) {
      window.location.href = "/dashboard";
    }
  }, [user, authLoading]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification State
  const [pendingOtp, setPendingOtp] = useState(false);

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  // Step 1: Send OTP for Email Verification before Account Creation
  const handleInitiateSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          purpose: "signup_verification",
          name: `${firstName} ${lastName}`.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch verification email. Please try again.");
      }

      setPendingOtp(true);
    } catch (err: any) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate verification email. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Finalize Account Creation after OTP is verified
  const handleOtpVerified = async () => {
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim() || undefined,
      });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Account creation failed. Please try again."
      );
      setPendingOtp(false);
    }
  };

  // Google OAuth Signup (Direct)
  const handleGoogleSignUp = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google sign-up failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 py-12 text-[#000000]">
      <div className="w-full max-w-md">
        {/* Brand Logo & Title */}
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
              Get Started with <span className="text-[#3386E7]">Catalog</span><span className="text-[#000000]">Forge</span>
            </h1>
            <p className="text-xs text-[#0284C7] font-bold mt-1">
              Create your account to start enriching raw product catalogs
            </p>
          </Link>
        </div>

        {/* Clean Flat SignUp Card (Zero Shadows) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-7 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {pendingOtp ? (
            /* OTP Verification Screen */
            <OtpVerification
              email={email.trim()}
              purpose="signup_verification"
              recipientName={`${firstName} ${lastName}`.trim()}
              onSuccess={handleOtpVerified}
              onCancel={() => {
                setPendingOtp(false);
                setError(null);
              }}
              title="Verify Email with Code"
              subtitle={`We've dispatched a 6-digit OTP code to ${email}. Enter it below to activate your account.`}
            />
          ) : (
            /* Standard Registration Form */
            <>
              <form onSubmit={handleInitiateSignUp} className="space-y-4" suppressHydrationWarning>
                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-firstname"
                      className="block text-xs font-black text-[#000000] mb-1.5"
                    >
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="signup-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                      suppressHydrationWarning
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-lastname"
                      className="block text-xs font-black text-[#000000] mb-1.5"
                    >
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="signup-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      suppressHydrationWarning
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-black text-[#000000] mb-1.5"
                  >
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    autoComplete="email"
                    required
                    suppressHydrationWarning
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    An OTP code will be sent to this email via Brevo for verification.
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="signup-company"
                    className="block text-xs font-black text-[#000000] mb-1.5"
                  >
                    Company Name <span className="text-[#000000]/40 text-[10px] font-medium">(Optional)</span>
                  </label>
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Industrial Supply"
                    suppressHydrationWarning
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#000000] placeholder:text-[#000000]/40 focus:outline-none focus:border-[#3386E7] transition-colors font-medium"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-black text-[#000000] mb-1.5"
                  >
                    Password <span className="text-rose-500">*</span>
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
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Email &amp; Create Account</span>
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
                    Or register with
                  </span>
                </div>
              </div>

              {/* Google Sign-Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#3386E7] hover:text-[#2060B6] font-black hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
