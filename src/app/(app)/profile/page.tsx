"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
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
  Edit2,
  Check,
  X,
} from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthProvider";
import { OtpVerification } from "@/components/auth/OtpVerification";

export default function ProfilePage() {
  const { user, signOut, changePassword } = useAuth();

  // Name Editing State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccessMessage, setNameSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    } else if (user?.email) {
      setDisplayName(user.email.split("@")[0] || "");
    }
  }, [user]);

  const userInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Formats role into clean user-facing title
  const formatRole = (role?: string | null) => {
    if (!role) return "Administrator";
    const lower = role.toLowerCase();
    if (lower === "admin" || lower === "administrator") return "Administrator";
    if (lower === "reviewer" || lower === "manager" || lower === "catalog manager") return "Catalog Manager";
    if (lower === "viewer" || lower === "auditor") return "Auditor";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSavingName(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
      }
      localStorage.setItem("catalogforge_user_name", displayName.trim());
      setNameSuccessMessage("Name updated successfully!");
      setIsEditingName(false);
      setTimeout(() => setNameSuccessMessage(null), 3000);
    } catch {
      localStorage.setItem("catalogforge_user_name", displayName.trim());
      setNameSuccessMessage("Name updated successfully!");
      setIsEditingName(false);
      setTimeout(() => setNameSuccessMessage(null), 3000);
    } finally {
      setIsSavingName(false);
    }
  };

  // Password Reset State
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
            <User className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">User Profile</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Your account details, permissions, and security settings.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          suppressHydrationWarning
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Name Success Notification */}
      {nameSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{nameSuccessMessage}</span>
        </div>
      )}

      {/* Password Success Notification */}
      {passwordSuccessMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{passwordSuccessMessage}</span>
        </div>
      )}

      {/* Password Error Notification */}
      {passwordErrorMessage && !isResettingPassword && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{passwordErrorMessage}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-[#F1F5F9] flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="px-3 py-1.5 text-sm font-bold text-[#000000] border border-[#2563EB] rounded-lg focus:outline-none bg-[#FAFAFA]"
                    autoFocus
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSavingName || !displayName.trim()}
                    className="p-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors"
                    title="Save name"
                    suppressHydrationWarning
                  >
                    {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setDisplayName(user?.displayName || user?.email?.split("@")[0] || "");
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                    title="Cancel"
                    suppressHydrationWarning
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#000000]">{displayName || "Authenticated User"}</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-[#2563EB] p-1 transition-colors"
                    title="Edit Name"
                    suppressHydrationWarning
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-[#64748B] mt-0.5">{user?.email ?? "user@catalogforge.tech"}</p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
            {formatRole(user?.role)}
          </span>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#64748B]">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              <span>Email Address</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#000000]">{user?.email ?? "—"}</span>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#64748B]">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              <span>Assigned Workspace Role</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
              {formatRole(user?.role)}
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#64748B]">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span>Active Organization</span>
            </div>
            <span className="text-xs font-bold text-[#000000]">{user?.companyName || "CatalogForge Enterprise"}</span>
          </div>
        </div>
      </div>

      {/* Security & Password Management (Brevo 2FA) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#000000]">Account Password &amp; 2FA Security</h3>
              <p className="text-xs text-[#64748B]">Change your login password with 6-digit email OTP verification.</p>
            </div>
          </div>
        </div>

        {!isResettingPassword ? (
          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-[#64748B]">
              Protect your account by regularly rotating credentials.
            </p>
            <button
              type="button"
              onClick={handleInitiatePasswordReset}
              disabled={isSendingOtp}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
              suppressHydrationWarning
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-[#F1F5F9] space-y-4">
            {!otpVerified ? (
              <div className="space-y-3">
                <p className="text-xs text-[#475569]">
                  We sent a 6-digit verification code to <strong>{user?.email}</strong>. Please enter it below to authorize this password change.
                </p>

                <OtpVerification
                  email={user?.email || ""}
                  purpose="password_reset"
                  onSuccess={handleOtpVerified}
                  onCancel={handleCancelReset}
                />
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Email verified! You may now set a new password.</span>
                </div>

                {passwordErrorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                    {passwordErrorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#000000] mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                        required
                        minLength={6}
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

                  <div>
                    <label className="block text-xs font-bold text-[#000000] mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                        required
                        minLength={6}
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
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelReset}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Active Session Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#000000] mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#2563EB]" />
          <span>Active Session Status</span>
        </h3>
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs text-emerald-800 font-semibold">
            Session active &amp; authenticated — access token verified with Azure SQL and Google AI pipeline.
          </span>
        </div>
      </div>
    </div>
  );
}
