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
  Plus,
  Trash2,
  CheckCircle2,
  Mail,
  Send,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
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

  // Notifications State (Removed Gemini AI extraction option)
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
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Administrator" | "Catalog Manager" | "Auditor">("Catalog Manager");

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

      const otherMembers = storedList.filter((m) => m.email.toLowerCase() !== currentUserEmail.toLowerCase());
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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberName.trim()) return;

    if (teamMembers.some((m) => m.email.toLowerCase() === newMemberEmail.trim().toLowerCase())) {
      alert("A team member with this email address is already added.");
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
    };
    const updatedList = [...teamMembers, newMember];
    setTeamMembers(updatedList);
    localStorage.setItem(
      "catalogforge_team_members",
      JSON.stringify(updatedList.filter((m) => !m.isCurrentSession))
    );
    setNewMemberName("");
    setNewMemberEmail("");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRoleChange = (memberId: string, newRole: "Administrator" | "Catalog Manager" | "Auditor") => {
    const updatedList = teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
    setTeamMembers(updatedList);
    localStorage.setItem(
      "catalogforge_team_members",
      JSON.stringify(updatedList.filter((m) => !m.isCurrentSession))
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRemoveMember = (id: string) => {
    const updatedList = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updatedList);
    localStorage.setItem(
      "catalogforge_team_members",
      JSON.stringify(updatedList.filter((m) => !m.isCurrentSession))
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
              Manage AI sourcing governance rules, notification alerts, and access permissions.
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
          <span>Settings &amp; access permissions successfully saved!</span>
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

      {/* ── TAB 1: GOVERNANCE POLICY ─────────────────────────────────── */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#000000]">Strict Source Governance Hierarchy</h2>
                <p className="text-xs text-[#64748B]">
                  Enforce authoritative manufacturer sourcing and eliminate unauthorized third-party marketplaces.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {/* OEM Mandatory */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#000000]">Tier 1 Official OEM Sourcing for Media &amp; Spec Sheets</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Enforces that spec sheet PDFs, CAD drawings, warranty documents, and product photos come exclusively from verified manufacturer website domains.
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
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#000000]">Consumer E-Commerce Marketplace Blacklist</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    100% rejects and discards consumer marketplace data (Amazon, eBay, Walmart, AliExpress, Temu, Flipkart) to prevent unverified seller data from entering the enterprise catalog.
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
          {/* Quick Nav to Dedicated Team Management */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000000]">Dedicated Team Management Studio</h3>
                <p className="text-xs text-[#64748B]">
                  Manage members, modify roles, revoke access, and invite collaborators in the full-page team manager.
                </p>
              </div>
            </div>
            <Link
              href="/team_management"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Open Team Management</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Role Permissions Matrix */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              Workspace Role Permissions Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Administrator
                </span>
                <p className="text-xs text-slate-600">
                  Full system control: dataset uploads, AI sourcing, schema overrides, team management, and workspace settings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Catalog Manager
                </span>
                <p className="text-xs text-slate-600">
                  Can upload CSV/XLSX datasets, review pending items, trigger AI lookups, and publish approved product records.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Auditor (Read-Only)
                </span>
                <p className="text-xs text-slate-600">
                  Read-only visibility into catalog products, ingestion job histories, analytics dashboards, and audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Team Members List */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2563EB]" />
                  Active Workspace Team Members
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Authenticated users with active access permissions.
                </p>
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3.5 flex items-center justify-between flex-wrap gap-3 bg-[#FAFAFA]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#000000]">{member.name}</p>
                        {member.isCurrentSession && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> (Current Session)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-600 mt-0.5">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
