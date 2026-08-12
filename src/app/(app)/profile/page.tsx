"use client";

import React from "react";
import { User, Shield, Key } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your account details, permissions, and session info.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center font-bold text-lg">
            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.displayName ?? "Authenticated User"}</h2>
            <p className="text-xs text-slate-500">{user?.email ?? "user@catalogforge.tech"}</p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assigned Role (§12)</span>
            <span className="font-mono font-bold uppercase text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded">
              {user?.role ?? "admin"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Auth Provider (§11)</span>
            <span className="text-slate-700">Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
