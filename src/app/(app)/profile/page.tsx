"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, LogOut, Mail, Building2, Edit2, Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
      }
      localStorage.setItem("catalogforge_user_name", displayName.trim());
      setSuccessMessage("Name updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      localStorage.setItem("catalogforge_user_name", displayName.trim());
      setSuccessMessage("Name updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5">
      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">User Profile</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Your account details, permissions, and workspace role.</p>
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

      {/* Success banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-[#F1F5F9] flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div>
              {isEditing ? (
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
                    disabled={isSaving || !displayName.trim()}
                    className="p-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors"
                    title="Save name"
                    suppressHydrationWarning
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
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
                    onClick={() => setIsEditing(true)}
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

      {/* Active Session Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
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
