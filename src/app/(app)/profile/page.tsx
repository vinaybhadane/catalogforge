"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Key,
  LogOut,
  Mail,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { OtpVerification } from "@/components/auth/OtpVerification";

export default function ProfilePage() {
  const { user, signOut, changePassword } = useAuth();

  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Step 1: Send Password Reset OTP via Brevo
  const handleInitiatePasswordReset = async () => {
    if (!user?.email || isSendingOtp) return;

    setIsSendingOtp(true);
    setPasswordErrorMessage(null);
    setPasswordSuccessMessage(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email.trim(),
          purpose: "password_reset",
          name: user.displayName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch password reset code. Please try again.");
      }

      setIsResettingPassword(true);
      setOtpSent(true);
    } catch (err: any) {
      setPasswordErrorMessage(
        err instanceof Error ? err.message : "Failed to initiate password reset."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: OTP Verified Callback
  const handleOtpVerified = () => {
    setOtpVerified(true);
    setPasswordErrorMessage(null);
  };

  // Step 3: Set New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordErrorMessage(null);

    try {
      await changePassword(newPassword);
      setPasswordSuccessMessage("Your account password has been successfully updated and secured.");
      setIsResettingPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordErrorMessage(
        err instanceof Error ? err.message : "Failed to update password. Please try again."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelReset = () => {
    setIsResettingPassword(false);
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrorMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5 select-none">

      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#3386E7]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">User Profile</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Your account details, permissions, and security settings.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {passwordSuccessMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{passwordSuccessMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {passwordErrorMessage && !isResettingPassword && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{passwordErrorMessage}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex items-center gap-4 border-b border-[#F1F5F9]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3386E7] to-[#1D4ED8] text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#000000]">{user?.displayName ?? "Authenticated User"}</h2>
            <p className="text-sm text-[#64748B]">{user?.email ?? "user@catalogforge.tech"}</p>
          </div>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-sm text-[#64748B]">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </div>
            <span className="text-sm font-medium text-[#000000]">{user?.email ?? "—"}</span>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-sm text-[#64748B]">
              <Shield className="w-4 h-4" />
              <span>Assigned Role</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#3386E7] uppercase tracking-wider">
              {user?.role ?? "admin"}
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-sm text-[#64748B]">
              <Key className="w-4 h-4" />
              <span>Auth Engine</span>
            </div>
            <span className="text-sm font-medium text-[#000000]">Firebase + Brevo 2FA</span>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-sm text-[#64748B]">
              <Building2 className="w-4 h-4" />
              <span>Workspace</span>
            </div>
            <span className="text-sm font-medium text-[#000000]">catalogforge18</span>
          </div>
        </div>
      </div>

      {/* ── Security & Password Management Card (Brevo OTP Integration) ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
        <div className={`flex items-center justify-between gap-4 ${isResettingPassword ? "border-b border-[#F1F5F9] pb-4" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#000000]">Security &amp; Password Reset</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Protect your account with Brevo OTP verified password changes.</p>
            </div>
          </div>

          {!isResettingPassword && (
            <button
              type="button"
              onClick={handleInitiatePasswordReset}
              disabled={isSendingOtp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Reset Password via OTP</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Step 1: OTP Verification via Brevo */}
        {isResettingPassword && !otpVerified && user?.email && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5">
            <OtpVerification
              email={user.email}
              purpose="password_reset"
              recipientName={user.displayName || undefined}
              onSuccess={handleOtpVerified}
              onCancel={handleCancelReset}
              title="Enter Password Reset OTP"
              subtitle={`We've sent a 6-digit security code to ${user.email}. Enter it to unlock password reset.`}
            />
          </div>
        )}

        {/* Step 2: Set New Password Form */}
        {isResettingPassword && otpVerified && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identity Verified via Brevo OTP! Enter your new password below:</span>
            </div>

            {passwordErrorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordErrorMessage}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-black text-[#000000] mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#000000] focus:outline-none focus:border-[#2563EB] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-black text-[#000000] mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#000000] focus:outline-none focus:border-[#2563EB] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword || newPassword.length < 6}
                className="flex-1 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelReset}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Session Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#000000] mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#3386E7]" />
          Active Session Status
        </h3>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-800 font-medium">Session active — you are authenticated with Tier-1 security governance.</span>
        </div>
      </div>
    </div>
  );
}
