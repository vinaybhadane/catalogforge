"use client";

import React, { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Catalog Manager" | "Auditor";
  isCurrentSession?: boolean;
  department?: string;
  status: "Active" | "Invited";
  joinedDate: string;
}

export default function TeamManagementPage() {
  const { user } = useAuth();

  const currentUserEmail = user?.email || "admin@catalogforge.tech";
  const currentUserName = user?.displayName || user?.email?.split("@")[0] || "Authorized Admin";

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite modal / form state
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberDepartment, setNewMemberDepartment] = useState("Catalog Operations");
  const [newMemberRole, setNewMemberRole] = useState<"Administrator" | "Catalog Manager" | "Auditor">("Catalog Manager");

  const [notification, setNotification] = useState<string | null>(null);

  // Initialize members from real Firebase auth + localStorage
  useEffect(() => {
    try {
      const savedMembersStr = localStorage.getItem("catalogforge_team_members");
      let storedList: any[] = [];
      if (savedMembersStr) {
        storedList = JSON.parse(savedMembersStr);
      }

      const primaryUser: TeamMember = {
        id: user?.uid || "firebase-admin-user",
        name: currentUserName,
        email: currentUserEmail,
        role: "Administrator",
        isCurrentSession: true,
        department: "Executive Management",
        status: "Active",
        joinedDate: "Workspace Owner",
      };

      const otherMembers: TeamMember[] = storedList
        .filter((m) => m.email?.toLowerCase() !== currentUserEmail.toLowerCase())
        .map((m, idx) => ({
          id: m.id || `member-${idx}`,
          name: m.name || "Team Member",
          email: m.email || "member@company.com",
          role: m.role || "Catalog Manager",
          department: m.department || "Catalog Operations",
          status: m.status || "Active",
          joinedDate: m.joinedDate || "Aug 2026",
        }));

      // Default demo members if empty
      if (otherMembers.length === 0) {
        otherMembers.push(
          {
            id: "tm-1",
            name: "Sakshi Patil",
            email: "patil.sakshi@catalogforge.tech",
            role: "Catalog Manager",
            department: "Catalog Operations",
            status: "Active",
            joinedDate: "Aug 15, 2026",
          },
          {
            id: "tm-2",
            name: "Vinay Bhadane",
            email: "vinay.bhadane@catalogforge.tech",
            role: "Catalog Manager",
            department: "AI & Ingestion",
            status: "Active",
            joinedDate: "Aug 18, 2026",
          },
          {
            id: "tm-3",
            name: "Compliance Auditor Desk",
            email: "compliance@catalogforge.tech",
            role: "Auditor",
            department: "Quality Assurance",
            status: "Active",
            joinedDate: "Aug 19, 2026",
          }
        );
      }

      setTeamMembers([primaryUser, ...otherMembers]);
    } catch {
      // Ignore localStorage errors
    }
  }, [user, currentUserEmail, currentUserName]);

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
      department: newMemberDepartment,
      status: "Active",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    saveToStorage(updated);

    setNewMemberName("");
    setNewMemberEmail("");
    setNotification(`Successfully added ${newMember.name} as ${newMember.role}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRoleChange = (memberId: string, newRole: "Administrator" | "Catalog Manager" | "Auditor") => {
    const updated = teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
    setTeamMembers(updated);
    saveToStorage(updated);
    setNotification(`Role updated to ${newRole}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove workspace access for ${name}?`)) return;
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    saveToStorage(updated);
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

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#000000] tracking-tight">
                Team Management
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Administrator Only
              </span>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage workspace members, assign role permissions, and control catalog access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#000000]">
            Total Members: <strong className="text-[#2563EB]">{teamMembers.length}</strong>
          </span>
        </div>
      </div>

      {/* ── Notification Banner ─────────────────────────────────────── */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ── Quick Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#64748B]">Administrators</p>
            <p className="text-lg font-black text-[#000000]">
              {teamMembers.filter((m) => m.role === "Administrator").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#64748B]">Catalog Managers</p>
            <p className="text-lg font-black text-[#000000]">
              {teamMembers.filter((m) => m.role === "Catalog Manager").length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#64748B]">Auditors (Read-Only)</p>
            <p className="text-lg font-black text-[#000000]">
              {teamMembers.filter((m) => m.role === "Auditor").length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Management Panel ───────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5">
        
        {/* Controls Bar: Search + Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
              suppressHydrationWarning
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-bold border border-[#E2E8F0] rounded-xl px-3 py-2 bg-[#FAFAFA] focus:outline-none focus:border-[#2563EB]"
              suppressHydrationWarning
            >
              <option value="all">All Roles</option>
              <option value="administrator">Administrators</option>
              <option value="catalog manager">Catalog Managers</option>
              <option value="auditor">Auditors</option>
            </select>
          </div>
        </div>

        {/* Team Members List */}
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between flex-wrap gap-3 bg-[#FAFAFA] hover:bg-white transition-colors"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3 min-w-[240px]">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-[#000000]">{member.name}</p>
                    {member.isCurrentSession && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> (Current Session)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">{member.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {member.department} &bull; Joined {member.joinedDate}
                  </p>
                </div>
              </div>

              {/* Role Selector & Actions */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                    disabled={member.isCurrentSession}
                    className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
                    suppressHydrationWarning
                  >
                    <option value="Administrator">Administrator (Full Control)</option>
                    <option value="Catalog Manager">Catalog Manager (Edit/Publish)</option>
                    <option value="Auditor">Auditor (Read-Only)</option>
                  </select>
                </div>

                {/* Remove Access Button */}
                {!member.isCurrentSession ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="mt-4 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    title="Remove member access"
                    suppressHydrationWarning
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="mt-4 text-[10px] font-bold text-slate-400 px-2 py-1">Owner</span>
                )}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No team members match your search criteria.
            </div>
          )}
        </div>

        {/* ── Invite New Member Form ──────────────────────────────────── */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs font-bold text-[#000000] uppercase tracking-wide">
              Add New Team Member
            </h3>
          </div>
          
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-white"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-white"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Workspace Role
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-white"
                suppressHydrationWarning
              >
                <option value="Administrator">Administrator</option>
                <option value="Catalog Manager">Catalog Manager</option>
                <option value="Auditor">Auditor (Read-Only)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                className="w-full px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                suppressHydrationWarning
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
