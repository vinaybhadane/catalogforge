"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Zap,
  Package,
  BarChart3,
  FileText,
  Settings,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Plus,
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
    title: "OPERATIONS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Upload & Ingest", href: "/upload", icon: UploadCloud },
      { label: "Pipeline Jobs", href: "/jobs", icon: Zap },
      { label: "Product Master", href: "/products", icon: Package },
    ],
  },
  {
    title: "INTELLIGENCE & AUDIT",
    items: [
      { label: "Catalog Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Audit & Governance", href: "/audit", icon: FileText },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { label: "Team Management", href: "/settings?tab=access", icon: Users },
      { label: "Workspace Settings", href: "/settings", icon: Settings },
      { label: "User Profile", href: "/profile", icon: User },
    ],
  },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    if (pathname.includes("/settings")) {
      const tab = searchParams?.get("tab");
      if (tab === "access") return "Team Management & Access";
      if (tab === "notifications") return "Notification Alerts";
      return "System & Governance Settings";
    }
    if (pathname.includes("/profile")) return "Account Profile";
    return "Enterprise Workspace";
  })();

  const isItemActive = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    if (targetQuery) {
      const targetParams = new URLSearchParams(targetQuery);
      const targetTab = targetParams.get("tab");
      const currentTab = searchParams?.get("tab");
      return pathname === targetPath && currentTab === targetTab;
    }
    if (href === "/settings") {
      const currentTab = searchParams?.get("tab");
      return pathname === "/settings" && (!currentTab || currentTab === "general");
    }
    if (href === "/upload") {
      const currentTab = searchParams?.get("tab");
      return pathname === "/upload" && currentTab !== "ai-search";
    }
    if (href === "/products") {
      const currentStatus = searchParams?.get("status");
      return pathname === "/products" && currentStatus !== "needs_review";
    }
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-[#0F172A]" suppressHydrationWarning>

      {/* ── Enterprise B2B Top Header (Strictly Responsive) ─────────── */}
      <header className="sticky top-0 z-40 h-16 bg-[#0B0F17] border-b border-[#1E293B] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none" suppressHydrationWarning>
        
        {/* Left: Mobile Toggle + Brand Logo + Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0" suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Toggle navigation"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand Identity using Actual Logo Image */}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-2.5 group py-1 shrink-0" suppressHydrationWarning>
            <img
              src="/logo-icon.png"
              alt="CatalogForge Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain bg-[#141B2D] p-1 border border-slate-700/80 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-base sm:text-lg tracking-tight truncate">
              <span className="text-[#38BDF8]">Catalog</span>
              <span className="text-white">Forge</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-800 shrink-0" />

          {/* Current Section Name */}
          <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400 truncate" suppressHydrationWarning>
            <span>{currentSectionName}</span>
          </div>
        </div>

        {/* Right: Quick Ingest CTA, Notifications, and User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0" suppressHydrationWarning>
          
          {/* Quick Action: Ingest Dataset CTA */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-sm border border-blue-400/30"
            suppressHydrationWarning
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Ingest Data</span>
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
          <div className="w-px h-5 bg-slate-800 mx-0.5 hidden xs:block" />

          {/* User Profile Dropdown Pill */}
          <div className="relative" suppressHydrationWarning>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-left group"
              suppressHydrationWarning
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black ring-1 ring-blue-400/30 shadow-sm shrink-0" suppressHydrationWarning>
                {userInitial}
              </div>
              <div className="hidden md:flex flex-col min-w-0 max-w-[110px]" suppressHydrationWarning>
                <span className="text-xs font-bold text-slate-200 truncate leading-none" suppressHydrationWarning>
                  {userLabel.split("@")[0]}
                </span>
                <span className="text-[9px] text-slate-400 truncate leading-none mt-1">
                  Administrator
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-[#0F172A] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 text-xs text-slate-300" suppressHydrationWarning>
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{userLabel}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Administrator Account</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    suppressHydrationWarning
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>User Profile</span>
                  </Link>
                  <Link
                    href="/settings?tab=access"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    suppressHydrationWarning
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Team Management</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    suppressHydrationWarning
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/audit"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition"
                    suppressHydrationWarning
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
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition text-left font-bold"
                    suppressHydrationWarning
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
        {/* ── Modern B2B Desktop Sidebar ───────────────────────────── */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-[#0B0F17] border-r border-[#1E293B] transition-all duration-300 select-none relative z-30 shrink-0",
            collapsed ? "w-[72px]" : "w-[245px] lg:w-[250px]"
          )}
          suppressHydrationWarning
        >
          {/* Nav Sections */}
          <div className="flex-1 overflow-y-auto py-5 space-y-4 px-3 custom-scrollbar">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                {!collapsed && (
                  <p className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest select-none">
                    {section.title}
                  </p>
                )}
                {collapsed && <div className="h-2" />}

                {/* Nav Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 group relative",
                          isActive
                            ? "bg-gradient-to-r from-[#2563EB]/20 via-[#2563EB]/10 to-transparent text-white border border-[#2563EB]/40 shadow-sm shadow-blue-500/10"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800",
                          collapsed && "justify-center px-1.5"
                        )}
                        suppressHydrationWarning
                      >
                        {/* Left Active Accent Pill */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#38BDF8] rounded-r-full shadow-sm shadow-blue-400" />
                        )}

                        {/* Icon Container with glowing active well */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                            isActive
                              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30"
                              : "bg-[#141B2D] border border-slate-800 text-slate-400 group-hover:text-[#38BDF8] group-hover:border-slate-700"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Label */}
                        {!collapsed && (
                          <span className="truncate tracking-wide">{item.label}</span>
                        )}

                        {/* Badge */}
                        {!collapsed && item.badge && (
                          <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[#38BDF8] border border-blue-500/30">
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

          {/* Sidebar Footer: User mini card + Collapse Toggle */}
          <div className="border-t border-[#1E293B] p-3 space-y-2 bg-[#0B0F17]" suppressHydrationWarning>
            {/* User Mini Card */}
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#141B2D] border border-slate-800/80" suppressHydrationWarning>
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm" suppressHydrationWarning>
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#141B2D]" />
                </div>
                <div className="flex-1 min-w-0" suppressHydrationWarning>
                  <p className="text-xs font-bold text-slate-200 truncate leading-none" suppressHydrationWarning>{userLabel.split("@")[0]}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-none mt-1 font-mono">Administrator</p>
                </div>
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-xs font-bold",
                collapsed && "justify-center px-0"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              suppressHydrationWarning
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Modern Mobile Drawer (Strictly Responsive) ─────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sheet */}
            <div className="relative w-[280px] max-w-[85vw] bg-[#0B0F17] flex flex-col z-10 border-r border-[#1E293B] shadow-2xl animate-in slide-in-from-left duration-250">
              {/* Mobile Sheet Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>
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
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  suppressHydrationWarning
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] relative",
                              isActive
                                ? "bg-[#2563EB]/20 text-white border border-[#2563EB]/40 shadow-sm"
                                : "text-slate-400 hover:text-white hover:bg-slate-900/80 active:bg-slate-800"
                            )}
                            suppressHydrationWarning
                          >
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                isActive ? "bg-[#2563EB] text-white shadow-sm" : "bg-[#141B2D] text-slate-400"
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[#38BDF8] border border-blue-500/30">
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

              {/* Mobile Sheet Footer */}
              <div className="border-t border-[#1E293B] p-3 space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#141B2D] border border-slate-800" suppressHydrationWarning>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-xs font-black" suppressHydrationWarning>
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0" suppressHydrationWarning>
                    <p className="text-xs font-bold text-slate-200 truncate" suppressHydrationWarning>{userLabel.split("@")[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate">Administrator</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition min-h-[40px]"
                  suppressHydrationWarning
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F2F5]" />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
