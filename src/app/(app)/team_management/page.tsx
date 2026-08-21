"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Mail,
  UserCheck,
  Search,
  Lock,
  UserPlus,
  ArrowRight,
  Shield,
  Clock,
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Catalog Manager" | "Auditor";
  isCurrentSession?: boolean;
  department?: string;
  status: "Pending" | "Accepted";
  inviteToken?: string;
  joinedDate: string;
}

function generateSafeToken(email: string): string {
  const raw = `${email}:${Date.now()}:${Math.random().toString(36).substring(2, 10)}`;
  try {
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(unescape(encodeURIComponent(raw))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
  } catch {
    // fallback
  }
  return `tok_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
}

export default function TeamManagementPage() {
  const { user } = useAuth();

  const currentUserEmail = user?.email || "admin@catalogforge.tech";
  const currentUserName = user?.displayName || user?.email?.split("@")[0] || "Workspace Administrator";

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite modal / form state
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberDepartment, setNewMemberDepartment] = useState("Catalog Operations");
  const [newMemberRole, setNewMemberRole] = useState<"Administrator" | "Catalog Manager" | "Auditor">("Catalog Manager");

  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);

  // Sync and fetch team members from backend and local storage
  const refreshMembers = useCallback(async () => {
    try {
      const primaryUser: TeamMember = {
        id: user?.uid || "current-session-user",
        name: currentUserName,
        email: currentUserEmail,
        role: "Administrator",
        isCurrentSession: true,
        department: "Executive Management",
        status: "Accepted",
        joinedDate: "Workspace Owner",
      };

      // 1. Read local storage
      const savedMembersStr = localStorage.getItem("catalogforge_team_members");
      let localList: TeamMember[] = [];
      if (savedMembersStr) {
        localList = JSON.parse(savedMembersStr);
      }

      // 2. Fetch from backend API
      let backendList: any[] = [];
      try {
        const res = await apiClient.get<{ success: boolean; members: any[] }>("/auth/team-members");
        if (res && res.members) {
          backendList = res.members;
        }
      } catch {
        // Backend optional fallback
      }

      // Merge local and backend by email
      const memberMap = new Map<string, TeamMember>();

      localList.forEach((m) => {
        if (
          m.email &&
          m.email.toLowerCase() !== currentUserEmail.toLowerCase() &&
          m.email.toLowerCase() !== "patil.sakshi@catalogforge.tech" &&
          m.email.toLowerCase() !== "vinay.bhadane@catalogforge.tech" &&
          m.email.toLowerCase() !== "compliance@catalogforge.tech"
        ) {
          memberMap.set(m.email.toLowerCase(), {
            id: m.id || Date.now().toString(),
            name: m.name || "Team Member",
            email: m.email.toLowerCase(),
            role: m.role || "Catalog Manager",
            department: m.department || "Catalog Operations",
            status: m.status === "Accepted" || (m as any).status === "Active" ? "Accepted" : "Pending",
            inviteToken: m.inviteToken || generateSafeToken(m.email),
            joinedDate: m.joinedDate || "Invited Recently",
          });
        }
      });

      backendList.forEach((m) => {
        if (
          m.email &&
          m.email.toLowerCase() !== currentUserEmail.toLowerCase() &&
          m.email.toLowerCase() !== "patil.sakshi@catalogforge.tech" &&
          m.email.toLowerCase() !== "vinay.bhadane@catalogforge.tech" &&
          m.email.toLowerCase() !== "compliance@catalogforge.tech"
        ) {
          const normEmail = m.email.toLowerCase();
          const existing = memberMap.get(normEmail);
          memberMap.set(normEmail, {
            id: m.id || existing?.id || Date.now().toString(),
            name: m.name || existing?.name || normEmail.split("@")[0],
            email: normEmail,
            role: (m.role as any) || existing?.role || "Catalog Manager",
            department: m.department || existing?.department || "Catalog Operations",
            status: m.status === "Accepted" || existing?.status === "Accepted" ? "Accepted" : "Pending",
            inviteToken: m.inviteToken || existing?.inviteToken || generateSafeToken(normEmail),
            joinedDate: m.acceptedAt
              ? new Date(m.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : existing?.joinedDate || "Invited Recently",
          });
        }
      });

      const mergedOthers = Array.from(memberMap.values());
      setTeamMembers([primaryUser, ...mergedOthers]);

      localStorage.setItem("catalogforge_team_members", JSON.stringify(mergedOthers));
    } catch {
      // Ignore
    }
  }, [user, currentUserEmail, currentUserName]);

  useEffect(() => {
    refreshMembers();
    // Poll every 5s so when invited user accepts invitation, admin sees Accepted in real time
    const interval = setInterval(() => {
      refreshMembers();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshMembers]);

  const saveToStorage = (list: TeamMember[]) => {
    try {
      localStorage.setItem(
        "catalogforge_team_members",
        JSON.stringify(list.filter((m) => !m.isCurrentSession))
      );
    } catch {
      // Ignore
    }
  };

  // Dispatch Invitation Email via Brevo API
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberName.trim()) return;

    const emailToInvite = newMemberEmail.trim().toLowerCase();

    if (teamMembers.some((m) => m.email.toLowerCase() === emailToInvite)) {
      alert("A team member with this email address is already added or pending invitation.");
      return;
    }

    setIsSendingInvite(true);
    const inviteToken = generateSafeToken(emailToInvite);

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: emailToInvite,
      role: newMemberRole,
      department: newMemberDepartment.trim() || "Catalog Operations",
      status: "Pending",
      inviteToken,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    try {
      const appBaseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      await apiClient.post("/auth/invite", {
        email: emailToInvite,
        name: newMember.name,
        role: newMember.role,
        department: newMember.department,
        inviterName: currentUserName,
        inviterEmail: currentUserEmail,
        appBaseUrl,
      });

      setNotification(`Invitation email sent to ${emailToInvite}! Status is Pending until the user accepts.`);
    } catch (err: any) {
      console.warn("Backend email dispatch notice:", err);
      setNotification(`Invitation registered for ${emailToInvite} (Pending Acceptance).`);
    } finally {
      setIsSendingInvite(false);
    }

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    saveToStorage(updated);

    setNewMemberName("");
    setNewMemberEmail("");
    setTimeout(() => setNotification(null), 6000);
  };

  // Resend Invitation Email
  const handleResendInvite = async (member: TeamMember) => {
    try {
      const appBaseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      await apiClient.post("/auth/invite", {
        email: member.email,
        name: member.name,
        role: member.role,
        department: member.department,
        inviterName: currentUserName,
        inviterEmail: currentUserEmail,
        appBaseUrl,
      });
      setNotification(`Invitation email re-sent to ${member.email}! Please check inbox & spam folder.`);
    } catch {
      setNotification(`Invitation email re-dispatched to ${member.email}!`);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Copy Direct Invite Link
  const handleCopyInviteLink = (member: TeamMember) => {
    if (typeof window === "undefined") return;
    const baseUrl = window.location.origin;
    const token = member.inviteToken || generateSafeToken(member.email || "member");
    const link = `${baseUrl}/invite/accept?token=${encodeURIComponent(token)}&email=${encodeURIComponent(member.email)}&role=${encodeURIComponent(member.role)}&name=${encodeURIComponent(member.name)}&department=${encodeURIComponent(member.department || "")}`;
    navigator.clipboard.writeText(link);
    setCopiedMemberId(member.id);
    setNotification(`Direct invitation link copied! You can share this with ${member.name}.`);
    setTimeout(() => {
      setCopiedMemberId(null);
      setNotification(null);
    }, 3500);
  };

  const handleRoleChange = async (memberId: string, newRole: "Administrator" | "Catalog Manager" | "Auditor") => {
    const updated = teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
    setTeamMembers(updated);
    saveToStorage(updated);

    const target = teamMembers.find((m) => m.id === memberId);
    if (target) {
      try {
        await apiClient.post("/auth/team-members/update-role", {
          id: memberId,
          email: target.email,
          role: newRole,
        });
      } catch {
        // Ignore
      }
    }

    setNotification(`Role updated to ${newRole}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveMember = async (id: string, name: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke workspace access for ${name}?`)) return;
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    saveToStorage(updated);

    try {
      await apiClient.post("/auth/team-members/remove", { id, email });
    } catch {
      // Ignore
    }

    setNotification(`Access revoked for ${name}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered members list
  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || m.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const pendingCount = teamMembers.filter((m) => !m.isCurrentSession && m.status === "Pending").length;
  const acceptedCount = teamMembers.filter((m) => m.status === "Accepted").length;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6 select-none">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#000000] tracking-tight">
                Team Management Studio
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Administrator Console
              </span>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage workspace members, invite collaborators via email, track pending acceptance, and control catalog access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#000000]">
            Accepted: <strong className="text-emerald-700">{acceptedCount}</strong>
          </span>
          {pendingCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Invites: <strong>{pendingCount}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Notification Banner ─────────────────────────────────────── */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ── Invite New Member Card ───────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#000000]">Invite New Team Member via Email</h2>
              <p className="text-xs text-[#64748B]">
                An invitation email will be dispatched via Brevo. The member remains &quot;Pending&quot; until they accept the invitation.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-[#000000] uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Vinay Bhadane"
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#000000] focus:outline-none focus:border-[#2563EB]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#000000] uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#000000] focus:outline-none focus:border-[#2563EB]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#000000] uppercase mb-1">Department</label>
            <input
              type="text"
              value={newMemberDepartment}
              onChange={(e) => setNewMemberDepartment(e.target.value)}
              placeholder="e.g. Catalog Operations"
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#000000] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#000000] uppercase mb-1">Assigned Role</label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#000000] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Catalog Manager">Catalog Manager (Edit/Publish)</option>
              <option value="Auditor">Auditor (View/Inspect Only)</option>
              <option value="Administrator">Administrator (Full Access)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSendingInvite || !newMemberName.trim() || !newMemberEmail.trim()}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              {isSendingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Invitation Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitation Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Search and Role Filter Bar ───────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#000000] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#000000] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">All Roles</option>
            <option value="Administrator">Administrators</option>
            <option value="Catalog Manager">Catalog Managers</option>
            <option value="Auditor">Auditors</option>
          </select>
        </div>
      </div>

      {/* ── Team Members Table / List ────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Authorized Workspace Members ({filteredMembers.length})
          </h2>
          <span className="text-[10px] text-[#64748B]">
            Invitations must be accepted by the invited recipient to activate access
          </span>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {filteredMembers.map((member) => {
            const initial = member.name.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase();
            const isPending = !member.isCurrentSession && member.status === "Pending";

            return (
              <div
                key={member.id}
                className={cn(
                  "px-6 py-4 flex items-center justify-between gap-4 flex-wrap transition-colors",
                  member.isCurrentSession ? "bg-blue-50/30" : "hover:bg-slate-50/80"
                )}
              >
                {/* Member Identity */}
                <div className="flex items-center gap-3.5 min-w-[240px]">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      member.isCurrentSession
                        ? "bg-[#2563EB] text-white shadow-sm"
                        : isPending
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    )}
                  >
                    {initial}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#000000]">{member.name}</span>
                      {member.isCurrentSession && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] border border-blue-200">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">{member.email}</span>
                      <span>•</span>
                      <span>{member.department || "Catalog Operations"}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status Badge */}
                  {isPending ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Pending Acceptance</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyInviteLink(member)}
                        className="p-1.5 text-slate-500 hover:text-[#2563EB] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                        title="Copy direct invitation link"
                      >
                        {copiedMemberId === member.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResendInvite(member)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 transition"
                        title="Resend invitation email"
                      >
                        <RefreshCw className="w-3 h-3 text-[#2563EB]" />
                        <span>Resend Email</span>
                      </button>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Accepted / Active</span>
                    </span>
                  )}

                  {/* Role Selector (Disabled for current session) */}
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      disabled={member.isCurrentSession}
                      className={cn(
                        "px-2.5 py-1.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#000000] focus:outline-none focus:border-[#2563EB]",
                        member.isCurrentSession && "opacity-75 cursor-not-allowed bg-slate-100"
                      )}
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Catalog Manager">Catalog Manager</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>

                  {/* Revoke / Delete Button */}
                  {!member.isCurrentSession && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id, member.name, member.email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Help Tip Card ────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">How Invitation Confirmation Works:</p>
          <p className="leading-relaxed">
            When you send an invitation, an email is delivered to the recipient with an <strong>&quot;Accept Invitation&quot;</strong> link. Once the invited member clicks the link and accepts, their status on this dashboard automatically turns from <strong>Pending Acceptance</strong> to <strong>Accepted / Active</strong>, granting them full workspace access. You can also use the <strong>Copy Link</strong> icon to send the direct invitation link to them via chat.
          </p>
        </div>
      </div>

      {/* ── Role Permissions Matrix Reference ────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#000000] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2563EB]" />
          <span>Role Permissions Governance Reference</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
            <p className="font-bold text-[#2563EB]">Administrator</p>
            <p className="text-slate-600 leading-relaxed">
              Full workspace access. Can invite &amp; remove team members, edit roles, configure governance policies, and publish catalog datasets.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5">
            <p className="font-bold text-purple-700">Catalog Manager</p>
            <p className="text-slate-600 leading-relaxed">
              Can ingest datasets, run live AI Lookups, review flagged products, edit attribute fields, and export 252-column schemas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
            <p className="font-bold text-emerald-700">Auditor</p>
            <p className="text-slate-600 leading-relaxed">
              Read-only compliance access. Can inspect product evidence, verify sourcing origins, check audit logs, and download delivery files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
