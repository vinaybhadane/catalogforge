"use client";

import React from "react";
import { User, Shield, Key, LogOut, Mail, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5">

      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#3386E7]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">User Profile</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Your account details, permissions, and session info.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* User Identity Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
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
              <span>Auth Provider</span>
            </div>
            <span className="text-sm font-medium text-[#000000]">Firebase Auth</span>
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

      {/* Session Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#000000] mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#3386E7]" />
          Active Session
        </h3>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-800 font-medium">Session active — you are currently signed in.</span>
        </div>
      </div>
    </div>
  );
}
