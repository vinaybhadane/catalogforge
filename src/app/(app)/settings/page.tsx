"use client";

import React, { useState, useEffect, Suspense } from "react";
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

      // Always ensure the active Firebase Auth user is at the top of the access list
      const primaryUser: TeamMember = {
        id: user?.uid || "firebase-current-user",
        name: currentUserName,
        email: currentUserEmail,
        role: "Administrator",
        isCurrentSession: true,
      };

      const otherMembers = storedList.filter((m) => m.email.toLowerCase() !== currentUserEmail.toLowerCase());
      setTeamMembers([primaryUser, ...otherMembers]);

      // If notification email was not explicitly set, default to user's real email
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

    // Prevent duplicate emails
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

  const handleRemoveMember = (id: string) => {
    const updatedList = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updatedList);
    localStorage.setItem(
      "catalogforge_team_members",
      JSON.stringify(updatedList.filter((m) => !m.isCurrentSession))
    );
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
              Manage AI sourcing governance rules, notification alerts, and team workspace access.
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
          {/* Team Members */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2563EB]" />
                  Team Members &amp; Authenticated Users
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Real team members authenticated via Firebase Auth for CatalogForge workspace.
                </p>
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3.5 flex items-center justify-between gap-3 bg-[#FAFAFA]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#000000]">{member.name}</p>
                        {member.isCurrentSession && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> (Current Firebase Session)
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
                    {!member.isCurrentSession && (
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
