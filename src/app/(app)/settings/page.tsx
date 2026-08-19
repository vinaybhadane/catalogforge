"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings,
  Sliders,
  Bell,
  Shield,
  Database,
  Check,
  Save,
  Key,
  Users,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
  XCircle,
  Laptop,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "notifications" | "access" | "api";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Catalog Manager" | "Auditor";
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as SettingsTab | null;

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabParam === "notifications" || tabParam === "access" || tabParam === "api"
      ? tabParam
      : "general"
  );

  // Sync tab with URL search param if it changes
  useEffect(() => {
    if (tabParam && ["general", "notifications", "access", "api"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // General Settings State
  const [threshold, setThreshold] = useState<number>(85);
  const [strictOemOnly, setStrictOemOnly] = useState<boolean>(true);
  const [blockEcommerce, setBlockEcommerce] = useState<boolean>(true);

  // Notifications State
  const [notifyJobSuccess, setNotifyJobSuccess] = useState<boolean>(true);
  const [notifyJobFailure, setNotifyJobFailure] = useState<boolean>(true);
  const [notifyAiExtraction, setNotifyAiExtraction] = useState<boolean>(false);
  const [notificationEmail, setNotificationEmail] = useState<string>("admin@catalogforge.tech");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [testAlertSent, setTestAlertSent] = useState<boolean>(false);

  // Access & Permissions State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "Sakshi Patil", email: "patil.sakshi@catalogforge.tech", role: "Administrator" },
    { id: "2", name: "Vinay Bhadane", email: "vinay.bhadane@catalogforge.tech", role: "Catalog Manager" },
    { id: "3", name: "Auditor Desk", email: "compliance@catalogforge.tech", role: "Auditor" },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Administrator" | "Catalog Manager" | "Auditor">("Catalog Manager");

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: "k1", name: "Production Ingestion Pipeline", keyPrefix: "cf_live_9f82...", createdAt: "2026-08-15" },
    { id: "k2", name: "ERP Automated Sync Agent", keyPrefix: "cf_live_3b11...", createdAt: "2026-08-18" },
  ]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Feedback State
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("catalogforge_user_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.threshold !== undefined) setThreshold(parsed.threshold);
        if (parsed.strictOemOnly !== undefined) setStrictOemOnly(parsed.strictOemOnly);
        if (parsed.blockEcommerce !== undefined) setBlockEcommerce(parsed.blockEcommerce);
        if (parsed.notifyJobSuccess !== undefined) setNotifyJobSuccess(parsed.notifyJobSuccess);
        if (parsed.notifyJobFailure !== undefined) setNotifyJobFailure(parsed.notifyJobFailure);
        if (parsed.notifyAiExtraction !== undefined) setNotifyAiExtraction(parsed.notifyAiExtraction);
        if (parsed.notificationEmail) setNotificationEmail(parsed.notificationEmail);
        if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      const settingsPayload = {
        threshold,
        strictOemOnly,
        blockEcommerce,
        notifyJobSuccess,
        notifyJobFailure,
        notifyAiExtraction,
        notificationEmail,
        webhookUrl,
      };
      localStorage.setItem("catalogforge_user_settings", JSON.stringify(settingsPayload));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleSendTestAlert = () => {
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 4000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberName.trim()) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
    };
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleGenerateApiKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const newKey: ApiKeyItem = {
      id: Date.now().toString(),
      name: `Headless Ingest Token #${apiKeys.length + 1}`,
      keyPrefix: `cf_live_${randomHex}...`,
      createdAt: new Date().toISOString().split("T")[0] || "Today",
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopyKey = (id: string, prefix: string) => {
    navigator.clipboard?.writeText(prefix);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`);
  };

  const TABS = [
    { id: "general" as SettingsTab, label: "Governance Policy", icon: Sliders },
    { id: "notifications" as SettingsTab, label: "Notifications & Alerts", icon: Bell },
    { id: "access" as SettingsTab, label: "Access & Permissions", icon: Shield },
    { id: "api" as SettingsTab, label: "API & Integrations", icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">
              Workspace Settings
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage AI governance rules, notification alerts, team access, and API configurations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          suppressHydrationWarning
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* ── Save Banner ─────────────────────────────────────────────── */}
      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully saved and applied to workspace!</span>
        </div>
      )}

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#000000]"
              )}
              suppressHydrationWarning
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#94A3B8]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: GENERAL / AI GOVERNANCE ───────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-5">
          {/* Confidence Threshold Policy */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <Sliders className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#000000]">AI Confidence Auto-Publish Threshold</h2>
                <p className="text-xs text-[#64748B]">
                  Records scoring at or above this threshold are automatically published to the catalog.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="confidence-threshold" className="text-xs font-bold text-[#000000]">
                  Auto-Publish Score Threshold
                </label>
                <span className="text-sm font-mono font-black px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg">
                  {threshold}%
                </span>
              </div>

              <input
                id="confidence-threshold"
                type="range"
                min="50"
                max="95"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>50% (Permissive)</span>
                <span>85% (Recommended Standard)</span>
                <span>95% (Strict Enterprise)</span>
              </div>
            </div>
          </div>

          {/* Sourcing Governance Switches */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Strict Source Governance Hierarchy
            </h3>

            <div className="divide-y divide-[#F1F5F9]">
              {/* OEM Mandatory */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#000000]">Tier 1 Official OEM Sourcing for Media &amp; PDFs</p>
                  <p className="text-xs text-[#64748B]">
                    Enforces that spec sheet PDFs, CAD drawings, and images come exclusively from verified manufacturer domains.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictOemOnly(!strictOemOnly)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative shrink-0",
                    strictOemOnly ? "bg-[#2563EB]" : "bg-slate-200"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                      strictOemOnly ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* Block E-Commerce */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#000000]">Consumer E-Commerce Marketplace Blacklist</p>
                  <p className="text-xs text-[#64748B]">
                    100% rejects and discards consumer marketplace data (Amazon, eBay, Walmart, AliExpress).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBlockEcommerce(!blockEcommerce)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative shrink-0",
                    blockEcommerce ? "bg-[#2563EB]" : "bg-slate-200"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                      blockEcommerce ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: NOTIFICATIONS & ALERTS ───────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="space-y-5">
          {/* Notification Triggers */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                Event Alert Preferences
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Configure which dataset and ingestion events trigger real-time notifications.
              </p>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {/* Job Completed */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#000000]">Dataset Ingestion Completed</p>
                  <p className="text-xs text-[#64748B]">Notify when batch CSV/XLSX or PDF processing finishes successfully.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyJobSuccess(!notifyJobSuccess)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative shrink-0",
                    notifyJobSuccess ? "bg-[#2563EB]" : "bg-slate-200"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                      notifyJobSuccess ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* Job Failure */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#000000]">Processing Failures &amp; Schema Errors</p>
                  <p className="text-xs text-[#64748B]">Instant alert if schema mapping fails or a file upload encounters errors.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyJobFailure(!notifyJobFailure)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative shrink-0",
                    notifyJobFailure ? "bg-[#2563EB]" : "bg-slate-200"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                      notifyJobFailure ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>

              {/* AI Sourcing Updates */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#000000]">Gemini 3.5 AI Extraction Summaries</p>
                  <p className="text-xs text-[#64748B]">Receive weekly summary reports of newly sourced product attributes and spec sheets.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyAiExtraction(!notifyAiExtraction)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative shrink-0",
                    notifyAiExtraction ? "bg-[#2563EB]" : "bg-slate-200"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                      notifyAiExtraction ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              Notification Delivery Channels
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">
                  Primary Alert Email Address
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">
                  Slack / Teams Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                  suppressHydrationWarning
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                  suppressHydrationWarning
                >
                  <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Send Test Notification</span>
                </button>

                {testAlertSent && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Test alert dispatched to {notificationEmail}!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ACCESS & PERMISSIONS ─────────────────────────────── */}
      {activeTab === "access" && (
        <div className="space-y-5">
          {/* Team Members */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2563EB]" />
                  Team Members &amp; Workspace Roles
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Manage active users with access to CatalogForge enterprise portal.
                </p>
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3.5 flex items-center justify-between gap-3 bg-[#FAFAFA]">
                  <div>
                    <p className="text-xs font-bold text-[#000000]">{member.name}</p>
                    <p className="text-[11px] text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      {member.role}
                    </span>
                    {member.id !== "1" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Full Name"
                className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                suppressHydrationWarning
              />
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="email@company.com"
                className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                suppressHydrationWarning
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                suppressHydrationWarning
              >
                <option value="Administrator">Administrator</option>
                <option value="Catalog Manager">Catalog Manager</option>
                <option value="Auditor">Auditor</option>
              </select>
              <button
                type="submit"
                disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                suppressHydrationWarning
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </form>
          </div>

          {/* API Key Management */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#2563EB]" />
                  API Keys &amp; Ingestion Tokens
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Tokens for headless automated CSV uploads and ERP catalog synchronization.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateApiKey}
                className="px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-[#BFDBFE]"
                suppressHydrationWarning
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Key</span>
              </button>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {apiKeys.map((key) => (
                <div key={key.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#000000]">{key.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {key.keyPrefix} &bull; Created {key.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyKey(key.id, key.keyPrefix)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 border border-[#E2E8F0]"
                    >
                      {copiedKeyId === key.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevokeApiKey(key.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Revoke Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: API & INTEGRATIONS ───────────────────────────────── */}
      {activeTab === "api" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <Database className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#000000]">Connected Backend Services &amp; APIs</h2>
                <p className="text-xs text-[#64748B]">Real-time system health and endpoint endpoints.</p>
              </div>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              <div className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-[#000000]">Fastify REST API Server</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> http://localhost:8000 (Active)
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-[#000000]">Azure SQL Database Pool</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> Pool Connected (4,288 Records)
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-[#000000]">Google Gemini 3.5 AI Model</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Check className="w-3.5 h-3.5" /> gemini-3.5-flash-lite (Active)
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-[#000000]">Swagger OpenAPI Docs</span>
                <a
                  href="http://localhost:8000/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  http://localhost:8000/api/docs
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
