"use client";

import React from "react";
import { Sliders, Shield, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Workspace configuration, enrichment thresholds, and API integration settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section: Enrichment Policy */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#1D4ED8]" />
            Human-in-the-Loop Review Policy (§32)
          </div>
          <div className="space-y-3 pt-2">
            <div>
              <label htmlFor="confidence-threshold" className="block text-xs font-semibold text-slate-700 mb-1">
                Confidence Threshold for Auto-Publish
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="confidence-threshold"
                  type="range"
                  min="50"
                  max="95"
                  defaultValue="85"
                  className="w-48"
                />
                <span className="text-xs font-mono font-bold text-slate-800">85%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Records with confidence below this threshold will be routed to the Review Studio.
              </p>
            </div>
          </div>
        </div>

        {/* Section: API Integration */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database className="w-4 h-4 text-[#1D4ED8]" />
            API & Endpoint Configuration (§43)
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-600">
              API Base URL: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-800">NEXT_PUBLIC_API_BASE_URL</code>
            </p>
            <p className="text-xs text-slate-600">
              API Namespace: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-800">/api/v1/</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
