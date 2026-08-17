"use client";

import React from "react";
import { User, Shield, Key, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Neumorphic Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">User Profile</h1>
              <p className="text-xs text-[#6D8196] font-bold mt-0.5">
                Your account details, permissions, and active session info.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-rose-800 hover:text-rose-900 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="neu-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-icon-well text-[#6D8196] flex items-center justify-center font-black text-xl">
            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#4A4A4A]">{user?.displayName ?? "Authenticated User"}</h2>
            <p className="text-xs text-[#6D8196] font-bold">{user?.email ?? "user@catalogforge.tech"}</p>
          </div>
        </div>

        <div className="border-t border-[#CBCBCB]/40 pt-4 space-y-3">
          <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#4A4A4A] font-bold">Assigned Role</span>
            <span className="neu-pill px-3 py-1 font-mono font-black uppercase text-[#6D8196] border-[#6D8196]">
              {user?.role ?? "admin"}
            </span>
          </div>
          <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#4A4A4A] font-bold">Authentication Provider</span>
            <span className="font-semibold text-[#4A4A4A]">Firebase Auth (catalogforge18)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
