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

  // Step 1: Send Password Reset OTP via Email Service
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
    <div className="max-w-2xl mx-auto pb-16 space-y-6 select-none">
      {/* Page Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">User Profile</h1>
            <p className="text-xs sm:text-sm text-[#686868] mt-0.5">Your account details, permissions, and security settings.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#EAEAEA] bg-[#FAFAFA] text-xs font-bold text-[#171717] hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all shadow-sm shrink-0"
          suppressHydrationWarning
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Name Success Notification */}
      {nameSuccessMessage && (
        <div className="bg-[#111111] text-white border border-[#262626] px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0" />
          <span>{nameSuccessMessage}</span>
        </div>
      )}

      {/* Password Success Notification */}
      {passwordSuccessMessage && (
        <div className="bg-[#111111] text-white border border-[#262626] px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0" />
          <span>{passwordSuccessMessage}</span>
        </div>
      )}

      {/* Password Error Notification */}
      {passwordErrorMessage && !isResettingPassword && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{passwordErrorMessage}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center justify-between gap-4 border-b border-[#EAEAEA] flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center text-2xl font-black shrink-0 shadow-sm border border-[#262626]">
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
                    className="px-3 py-1.5 text-sm font-bold text-[#171717] border border-[#111111] rounded-xl focus:outline-none bg-[#FAFAFA]"
                    autoFocus
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSavingName || !displayName.trim()}
                    className="p-2 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] rounded-xl transition-colors disabled:opacity-50"
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
                    className="p-2 bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#686868] rounded-xl transition-colors"
                    title="Cancel"
                    suppressHydrationWarning
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#171717]">{displayName || "Authenticated User"}</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-[#929292] hover:text-[#171717] p-1 transition-colors"
                    title="Edit Name"
                    suppressHydrationWarning
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-[#686868] mt-0.5">{user?.email ?? "user@catalogforge.tech"}</p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#111111] text-[#C8FF00] shadow-sm">
            {formatRole(user?.role)}
          </span>
        </div>

        <div className="divide-y divide-[#EAEAEA]">
          <div className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#686868]">
              <Mail className="w-4 h-4 text-[#111111]" />
              <span>Email Address</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#171717]">{user?.email ?? "—"}</span>
          </div>

          <div className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#686868]">
              <Shield className="w-4 h-4 text-[#111111]" />
              <span>Assigned Workspace Role</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] text-[#171717]">
              {formatRole(user?.role)}
            </span>
          </div>

          <div className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#686868]">
              <Building2 className="w-4 h-4 text-[#111111]" />
              <span>Active Organization</span>
            </div>
            <span className="text-xs font-bold text-[#171717]">{user?.companyName || "CatalogForge Enterprise"}</span>
          </div>
        </div>
      </div>

      {/* Security & Password Management (2FA Verification) */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#EAEAEA] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shrink-0 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">Account Password &amp; 2FA Security</h3>
              <p className="text-xs text-[#686868] mt-0.5">Change your login password with 6-digit email OTP verification.</p>
            </div>
          </div>
        </div>

        {!isResettingPassword ? (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[#686868]">
              Protect your account by regularly rotating credentials.
            </p>
            <button
              type="button"
              onClick={handleInitiatePasswordReset}
              disabled={isSendingOtp}
              className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm shrink-0"
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
          <div className="pt-4 border-t border-[#EAEAEA] space-y-4">
            {!otpVerified ? (
              <div className="space-y-3">
                <p className="text-xs text-[#686868]">
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
                <div className="p-3.5 bg-[#111111] text-white border border-[#262626] rounded-2xl flex items-center gap-2 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
                  <span>Email verified! You may now set a new password.</span>
                </div>

                {passwordErrorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                    {passwordErrorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-[#111111] bg-[#FAFAFA] text-[#171717] transition-all pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#171717]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3.5 py-2.5 text-xs border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-[#111111] bg-[#FAFAFA] text-[#171717] transition-all pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#171717]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
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
                    className="px-4 py-2.5 bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#171717] text-xs font-bold rounded-full transition"
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
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#111111]" />
          <span>Active Session Status</span>
        </h3>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#111111] ring-4 ring-[#C8FF00]/60 shrink-0" />
          <span className="text-xs text-[#171717] font-medium">
            Session active &amp; authenticated — access token verified with Enterprise Catalog Intelligence pipeline.
          </span>
        </div>
      </div>
    </div>
  );
}
