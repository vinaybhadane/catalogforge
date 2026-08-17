"use client";

import React from "react";
import { Sliders, Shield, Bell, Database, Settings, Check } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Neumorphic Page Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">System Settings</h1>
            <p className="text-xs text-[#6D8196] font-bold mt-0.5">
              Workspace configuration, AI confidence thresholds, and API integration settings.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section: Enrichment Policy */}
        <div className="neu-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-[#4A4A4A] font-extrabold text-sm border-b border-[#CBCBCB]/40 pb-3">
            <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
              <Sliders className="w-4 h-4" />
            </div>
            Human-in-the-Loop Review Policy
          </div>
          <div className="space-y-4 pt-1">
            <div>
              <label htmlFor="confidence-threshold" className="block text-xs font-extrabold text-[#4A4A4A] mb-2">
                Confidence Threshold for Auto-Publish
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="confidence-threshold"
                  type="range"
                  min="50"
                  max="95"
                  defaultValue="85"
                  className="w-56 accent-[#6D8196] cursor-pointer"
                />
                <span className="neu-pill px-3 py-1 text-xs font-mono font-black text-[#6D8196]">
                  85%
                </span>
              </div>
              <p className="text-[11px] text-[#6D8196] font-semibold mt-2">
                Records with confidence below this threshold will automatically be routed to the Review Studio.
              </p>
            </div>
          </div>
        </div>

        {/* Section: API Integration */}
        <div className="neu-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-[#4A4A4A] font-extrabold text-sm border-b border-[#CBCBCB]/40 pb-3">
            <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
              <Database className="w-4 h-4" />
            </div>
            API & Endpoint Configuration
          </div>
          <div className="space-y-3">
            <div className="neu-inset p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A4A4A]">API Service Status</span>
              <span className="neu-pill px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Operational
              </span>
            </div>
            <div className="neu-inset p-3.5 rounded-xl space-y-1.5">
              <p className="text-xs text-[#4A4A4A] font-semibold">
                API Base URL: <code className="bg-white/80 px-2 py-0.5 rounded text-xs font-mono text-[#6D8196] font-bold border border-[#CBCBCB]/40">http://localhost:8000</code>
              </p>
              <p className="text-xs text-[#4A4A4A] font-semibold">
                API Namespace: <code className="bg-white/80 px-2 py-0.5 rounded text-xs font-mono text-[#6D8196] font-bold border border-[#CBCBCB]/40">/api/v1/</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
