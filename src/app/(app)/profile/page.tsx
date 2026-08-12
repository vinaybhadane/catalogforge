import React from "react";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user account credentials and role assignments.</p>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">User Account</h3>
          <p className="text-xs text-slate-500">Firebase Authentication provider connection ready.</p>
        </div>
      </div>
    </div>
  );
}
