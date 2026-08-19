"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  Package,
  CheckSquare,
  BarChart3,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  Bell,
  Search,
  LogOut,
  Sparkles,
  ShieldCheck,
  Command,
  Plus,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Upload Data", href: "/upload", icon: UploadCloud },
      { label: "Processing Jobs", href: "/jobs", icon: Activity },
      { label: "Products", href: "/products", icon: Package },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Audit Logs", href: "/audit", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "A";

  const userLabel = user?.displayName || user?.email || "Admin Workspace";

  // Breadcrumb mapping
  const currentSectionName = (() => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/upload")) return "Upload & Ingestion";
    if (pathname.includes("/jobs")) return "Pipeline Processing Jobs";
    if (pathname.includes("/products")) return "Product Master Catalog";
    if (pathname.includes("/analytics")) return "Catalog Intelligence & Analytics";
    if (pathname.includes("/audit")) return "Governance Audit Logs";
    if (pathname.includes("/settings")) return "System & Governance Settings";
    if (pathname.includes("/profile")) return "Account Profile";
    return "Enterprise Workspace";
  })();

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-[#0F172A]">

      {/* ── Enterprise B2B Top Header ───────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 bg-[#0B0F17] border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        
        {/* Left: Mobile Toggle + Brand Logo + Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand Identity using Actual Logo Image */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group py-1">
            <img
              src="/logo-icon.png"
              alt="CatalogForge Logo"
              className="w-8 h-8 rounded-lg object-contain bg-[#141B2D] p-1 border border-slate-700/80 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-lg tracking-tight">
              <span className="text-[#38BDF8]">Catalog</span>
              <span className="text-white">Forge</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-800" />

          {/* Current Section Name */}
          <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400">
            <span>{currentSectionName}</span>
          </div>
        </div>

        {/* Right: Quick Ingest CTA, Notifications, and User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Quick Action: Ingest Dataset CTA */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-sm border border-blue-400/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Data</span>
          </Link>

          {/* Notifications Link */}
          <Link
            href="/settings?tab=notifications"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors relative"
            title="Notifications & Alerts"
            aria-label="Notification Settings"
            suppressHydrationWarning
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#0B0F17]" />
          </Link>

          {/* Vertical Divider */}
          <div className="w-px h-5 bg-slate-800 mx-0.5" />

          {/* User Profile Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black ring-1 ring-blue-400/30 shadow-sm shrink-0">
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col min-w-0 max-w-[110px]">
                <span className="text-xs font-bold text-slate-200 truncate leading-none">
                  {userLabel.split("@")[0]}
                </span>
                <span className="text-[9px] text-slate-400 truncate leading-none mt-1">
                  Administrator
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 text-xs text-slate-300">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{userLabel}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">UniHack Governance Tier-1</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>User Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/audit"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Governance Audit Logs</span>
                  </Link>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Desktop Sidebar ──────────────────────────────────────── */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-[#111827] border-r border-[#1F2937] transition-all duration-250 select-none relative z-30 shrink-0",
            collapsed ? "w-[68px]" : "w-[240px]"
          )}
        >
          {/* Nav Sections */}
          <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-1">
                {/* Section Header */}
                {!collapsed && (
                  <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest select-none">
                    {section.title}
                  </p>
                )}
                {collapsed && <div className="h-5" />}

                {/* Nav Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 group relative",
                          isActive
                            ? "bg-[#1E3A5F] text-white shadow-sm"
                            : "text-gray-400 hover:text-gray-100 hover:bg-[#1F2937]",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3386E7] rounded-r-full" />
                        )}

                        <Icon
                          className={cn(
                            "w-[18px] h-[18px] shrink-0 transition-colors",
                            isActive ? "text-[#3386E7]" : "text-gray-500 group-hover:text-gray-300"
                          )}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}

                        {/* Badge */}
                        {!collapsed && item.badge && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3386E7]/20 text-[#3386E7]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer: User mini card + collapse */}
          <div className="border-t border-[#1F2937] p-2 space-y-1">
            {/* User row */}
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1F2937]">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#3386E7] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate leading-none">{userLabel.split("@")[0]}</p>
                  <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">Administrator</p>
                </div>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#1F2937] transition-colors text-xs font-medium",
                collapsed && "justify-center"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              suppressHydrationWarning
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Mobile Drawer ─────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sheet */}
            <div className="relative w-[260px] bg-[#111827] max-w-full flex flex-col z-10 border-r border-[#1F2937] shadow-2xl">
              {/* Mobile Sheet Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#1F2937]">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src="/logo-icon.png"
                    alt="CatalogForge Logo"
                    className="w-7 h-7 rounded-lg object-contain bg-[#141B2D] p-0.5 border border-slate-700"
                  />
                  <span className="font-black text-base text-white">
                    <span className="text-[#38BDF8]">Catalog</span>Forge
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors"
                  suppressHydrationWarning
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Nav */}
              <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-1">
                    <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                              isActive
                                ? "bg-[#1E3A5F] text-white"
                                : "text-gray-400 hover:text-gray-100 hover:bg-[#1F2937]"
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3386E7] rounded-r-full" />
                            )}
                            <Icon
                              className={cn(
                                "w-[18px] h-[18px] shrink-0",
                                isActive ? "text-[#3386E7]" : "text-gray-500"
                              )}
                            />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Sheet Footer */}
              <div className="border-t border-[#1F2937] p-3">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[#1F2937]">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#3386E7] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">{userLabel.split("@")[0]}</p>
                    <p className="text-[10px] text-gray-500 truncate">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
