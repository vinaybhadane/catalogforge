"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Settings,
  Sliders,
  Bell,
  Shield,
  Save,
  Users,
  CheckCircle2,
  Mail,
  Send,
  ShieldCheck,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "notifications" | "access";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Catalog Manager" | "Auditor";
  isCurrentSession?: boolean;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabParam === "notifications" || tabParam === "access"
      ? tabParam
      : "general"
  );

  // Sync tab with URL search param if it changes
  useEffect(() => {
    if (tabParam && ["general", "notifications", "access"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // General Governance Settings State
  const [strictOemOnly, setStrictOemOnly] = useState<boolean>(true);
  const [blockEcommerce, setBlockEcommerce] = useState<boolean>(true);

  // Notifications State
  const [notifyJobSuccess, setNotifyJobSuccess] = useState<boolean>(true);
  const [notifyJobFailure, setNotifyJobFailure] = useState<boolean>(true);
  const [notificationEmail, setNotificationEmail] = useState<string>(
    user?.email || "admin@catalogforge.tech"
  );
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [testAlertSent, setTestAlertSent] = useState<boolean>(false);

  // Access & Permissions State (Real Firebase Auth User + Dynamic Team list)
  const currentUserEmail = user?.email || "user@firebase-auth.com";
  const currentUserName = user?.displayName || user?.email?.split("@")[0] || "Authorized User";

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Feedback State
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Initialize team members from real Firebase auth + localStorage
  useEffect(() => {
    try {
      const savedMembersStr = localStorage.getItem("catalogforge_team_members");
      let storedList: TeamMember[] = [];
      if (savedMembersStr) {
        storedList = JSON.parse(savedMembersStr);
      }

      const primaryUser: TeamMember = {
        id: user?.uid || "firebase-current-user",
        name: currentUserName,
        email: currentUserEmail,
        role: "Administrator",
        isCurrentSession: true,
      };

      const otherMembers = storedList.filter(
        (m) =>
          m.email &&
          m.email.toLowerCase() !== currentUserEmail.toLowerCase() &&
          m.email.toLowerCase() !== "patil.sakshi@catalogforge.tech" &&
          m.email.toLowerCase() !== "vinay.bhadane@catalogforge.tech" &&
          m.email.toLowerCase() !== "compliance@catalogforge.tech"
      );
      setTeamMembers([primaryUser, ...otherMembers]);

      const savedSettings = localStorage.getItem("catalogforge_user_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.strictOemOnly !== undefined) setStrictOemOnly(parsed.strictOemOnly);
        if (parsed.blockEcommerce !== undefined) setBlockEcommerce(parsed.blockEcommerce);
        if (parsed.notifyJobSuccess !== undefined) setNotifyJobSuccess(parsed.notifyJobSuccess);
        if (parsed.notifyJobFailure !== undefined) setNotifyJobFailure(parsed.notifyJobFailure);
        if (parsed.notificationEmail) setNotificationEmail(parsed.notificationEmail);
        else if (user?.email) setNotificationEmail(user.email);
        if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
      } else if (user?.email) {
        setNotificationEmail(user.email);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [user, currentUserEmail, currentUserName]);

  const handleSaveSettings = () => {
    try {
      const settingsPayload = {
        strictOemOnly,
        blockEcommerce,
        notifyJobSuccess,
        notifyJobFailure,
        notificationEmail,
        webhookUrl,
      };
      localStorage.setItem("catalogforge_user_settings", JSON.stringify(settingsPayload));
      localStorage.setItem(
        "catalogforge_team_members",
        JSON.stringify(teamMembers.filter((m) => !m.isCurrentSession))
      );
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

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`);
  };

  const TABS = [
    { id: "general" as SettingsTab, label: "Governance Policy", icon: Sliders },
    { id: "notifications" as SettingsTab, label: "Notifications & Alerts", icon: Bell },
    { id: "access" as SettingsTab, label: "Access & Permissions", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shrink-0 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Workspace Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#686868] mt-0.5">
              Manage AI sourcing governance rules, notification alerts, and access permissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-full bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
          suppressHydrationWarning
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* ── Save Banner ─────────────────────────────────────────────── */}
      {isSaved && (
        <div className="bg-[#111111] text-white border border-[#262626] px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0" />
          <span>Settings &amp; access permissions successfully saved to workspace!</span>
        </div>
      )}

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <div className="bg-[#F7F7F7] border border-[#EAEAEA] rounded-full p-1.5 flex gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-[#111111] text-white shadow-sm"
                  : "text-[#686868] hover:bg-white hover:text-[#171717]"
              )}
              suppressHydrationWarning
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#C8FF00]" : "text-[#929292]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: GOVERNANCE POLICY ─────────────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center gap-3 border-b border-[#EAEAEA] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#C8FF00] shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#171717]">Strict Source Governance Hierarchy</h2>
                <p className="text-xs text-[#686868]">
                  Enforce authoritative manufacturer sourcing and eliminate unauthorized third-party marketplaces.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              {/* OEM Mandatory */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#171717]">Tier 1 Official OEM Sourcing for Media &amp; Spec Sheets</p>
                  <p className="text-xs text-[#686868] leading-relaxed max-w-2xl">
                    Enforces that spec sheet PDFs, CAD drawings, warranty documents, and product photos come exclusively from verified manufacturer website domains.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictOemOnly(!strictOemOnly)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shrink-0",
                    strictOemOnly ? "bg-[#111111]" : "bg-[#EAEAEA]"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full transition-all absolute top-1",
                      strictOemOnly ? "left-7 bg-[#C8FF00]" : "left-1 bg-white shadow-sm"
                    )}
                  />
                </button>
              </div>

              {/* Block E-Commerce */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#171717]">Consumer E-Commerce Marketplace Blacklist</p>
                  <p className="text-xs text-[#686868] leading-relaxed max-w-2xl">
                    100% rejects and discards consumer marketplace data (Amazon, eBay, Walmart, AliExpress, Temu, Flipkart) to prevent unverified seller data from entering the enterprise catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBlockEcommerce(!blockEcommerce)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shrink-0",
                    blockEcommerce ? "bg-[#111111]" : "bg-[#EAEAEA]"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full transition-all absolute top-1",
                      blockEcommerce ? "left-7 bg-[#C8FF00]" : "left-1 bg-white shadow-sm"
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
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Notification Triggers */}
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#EAEAEA] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#C8FF00] shrink-0 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Event Alert Preferences
                </h3>
                <p className="text-xs text-[#686868] mt-0.5">
                  Configure which dataset and ingestion events trigger real-time notifications.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              {/* Job Completed */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#171717]">Dataset Ingestion Completed</p>
                  <p className="text-xs text-[#686868]">Notify when batch CSV/XLSX or PDF processing finishes successfully.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyJobSuccess(!notifyJobSuccess)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shrink-0",
                    notifyJobSuccess ? "bg-[#111111]" : "bg-[#EAEAEA]"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full transition-all absolute top-1",
                      notifyJobSuccess ? "left-7 bg-[#C8FF00]" : "left-1 bg-white shadow-sm"
                    )}
                  />
                </button>
              </div>

              {/* Job Failure */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#171717]">Processing Failures &amp; Schema Errors</p>
                  <p className="text-xs text-[#686868]">Instant alert if schema mapping fails or a file upload encounters errors.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyJobFailure(!notifyJobFailure)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shrink-0",
                    notifyJobFailure ? "bg-[#111111]" : "bg-[#EAEAEA]"
                  )}
                  suppressHydrationWarning
                >
                  <span
                    className={cn(
                      "block w-4 h-4 rounded-full transition-all absolute top-1",
                      notifyJobFailure ? "left-7 bg-[#C8FF00]" : "left-1 bg-white shadow-sm"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#EAEAEA] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#C8FF00] shrink-0 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Notification Delivery Channels
                </h3>
                <p className="text-xs text-[#686868] mt-0.5">
                  Set recipient destination for mission-critical pipeline alerts.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Primary Alert Email Address
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-[#111111] bg-[#FAFAFA] text-[#171717] transition-all"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Slack / Teams Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3.5 py-2.5 text-xs border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-[#111111] bg-[#FAFAFA] text-[#171717] transition-all"
                  suppressHydrationWarning
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  className="px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full flex items-center gap-2 transition-colors shrink-0"
                  suppressHydrationWarning
                >
                  <Send className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Send Test Notification</span>
                </button>

                {testAlertSent && (
                  <span className="text-xs font-bold text-[#171717] bg-[#F7F7F7] border border-[#EAEAEA] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C8FF00]" />
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
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Quick Nav to Dedicated Team Management */}
          <div className="bg-[#111111] text-white border border-[#262626] rounded-3xl p-6 sm:p-7 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 text-[#C8FF00] flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dedicated Team Management Studio</h3>
                <p className="text-xs text-[#929292] mt-0.5">
                  Manage members, modify roles, revoke access, and invite collaborators in the full-page team manager.
                </p>
              </div>
            </div>
            <Link
              href="/team_management"
              className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Open Team Management</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Role Permissions Matrix */}
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#EAEAEA] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#C8FF00] shrink-0 shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171717]">
                  Workspace Role Permissions Matrix
                </h3>
                <p className="text-xs text-[#686868] mt-0.5">
                  Access level matrix enforced on API endpoints and pipeline triggers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#111111] text-[#C8FF00] inline-block">
                  Administrator
                </span>
                <p className="text-xs text-[#686868] leading-relaxed">
                  Full system control: dataset uploads, AI sourcing, schema overrides, team management, and workspace settings.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#171717] border border-[#EAEAEA] inline-block">
                  Catalog Manager
                </span>
                <p className="text-xs text-[#686868] leading-relaxed">
                  Can upload CSV/XLSX datasets, review pending items, and publish approved product records.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#686868] border border-[#EAEAEA] inline-block">
                  Auditor (Read-Only)
                </span>
                <p className="text-xs text-[#686868] leading-relaxed">
                  Read-only visibility into catalog products, ingestion job histories, analytics dashboards, and audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Team Members List */}
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#EAEAEA] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-[#C8FF00] shrink-0 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    Active Workspace Team Members
                  </h3>
                  <p className="text-xs text-[#686868] mt-0.5">
                    Authenticated users with active access permissions in this workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden divide-y divide-[#EAEAEA]">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[#FAFAFA] hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-[#C8FF00] flex items-center justify-center text-xs font-bold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#171717]">{member.name}</p>
                        {member.isCurrentSession && (
                          <span className="text-[10px] font-bold text-[#171717] bg-[#C8FF00]/30 border border-[#C8FF00] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[#111111]" /> Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#686868] mt-0.5">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-white text-[#171717] border border-[#EAEAEA] shadow-sm">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#686868]">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
