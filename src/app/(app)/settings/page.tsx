"use client";

import React, { useState } from "react";
import { Sliders, Database, Bell, Shield, Settings, Check, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(85);

  const sections = [
    {
      icon: Sliders,
      title: "Human-in-the-Loop Review Policy",
      description: "Configure when records are auto-published vs routed for human review.",
    },
    {
      icon: Database,
      title: "API & Endpoint Configuration",
      description: "Manage backend service endpoints and API integration settings.",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alerts for job completions, failures, and review queue updates.",
    },
    {
      icon: Shield,
      title: "Access & Permissions",
      description: "Manage team roles, workspace access levels, and audit settings.",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5">

      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5 text-[#3386E7]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#000000] tracking-tight">System Settings</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Workspace configuration, AI thresholds, and API integrations.</p>
        </div>
      </div>

      {/* Enrichment Policy */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Sliders className="w-4 h-4 text-[#3386E7]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#000000]">Human-in-the-Loop Review Policy</h2>
            <p className="text-xs text-[#64748B]">Records below the threshold are routed to Review Studio.</p>
          </div>
        </div>
        <div className="p-6">
          <label htmlFor="confidence-threshold" className="block text-sm font-semibold text-[#000000] mb-1">
            Confidence Threshold for Auto-Publish
          </label>
          <p className="text-xs text-[#64748B] mb-4">
            Records with AI confidence below this value will require human review before publishing.
          </p>
          <div className="flex items-center gap-4">
            <input
              id="confidence-threshold"
              type="range"
              min="50"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="flex-1 accent-[#3386E7] cursor-pointer"
            />
            <span className="w-16 text-center text-sm font-bold text-[#000000] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-2 py-1 font-mono">
              {threshold}%
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <Check className="w-4 h-4 text-[#3386E7] shrink-0" />
            <p className="text-xs text-[#475569]">
              Currently set to <strong>{threshold}%</strong> — records below this threshold route to Review Studio.
            </p>
          </div>
        </div>
      </div>

      {/* API Config */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Database className="w-4 h-4 text-[#3386E7]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#000000]">API &amp; Endpoint Configuration</h2>
            <p className="text-xs text-[#64748B]">Backend service connection details.</p>
          </div>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm text-[#64748B]">API Service Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Check className="w-3.5 h-3.5" /> Operational
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm text-[#64748B]">API Base URL</span>
            <code className="text-xs font-mono font-medium text-[#000000] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
              http://localhost:8000
            </code>
          </div>
          <div className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm text-[#64748B]">API Namespace</span>
            <code className="text-xs font-mono font-medium text-[#000000] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
              /api/v1/
            </code>
          </div>
        </div>
      </div>

      {/* Other Settings Links */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#F1F5F9]">
        {[
          { icon: Bell, label: "Notifications", desc: "Job completions, failures, and review queue alerts" },
          { icon: Shield, label: "Access & Permissions", desc: "Team roles, workspace access, and audit settings" },
        ].map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            type="button"
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#64748B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#000000]">{label}</p>
              <p className="text-xs text-[#64748B]">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3386E7] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
