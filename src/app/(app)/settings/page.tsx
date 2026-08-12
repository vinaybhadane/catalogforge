import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure threshold rules, API endpoints, and workspace permissions.</p>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-xl">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Workspace Configuration</h3>
        <p className="text-xs text-slate-500">System configuration controls are managed via environment variables and API policies.</p>
      </div>
    </div>
  );
}
