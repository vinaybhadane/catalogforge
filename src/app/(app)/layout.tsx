"use client";

import React, { useState, Suspense, useEffect } from "react";
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
  Database,
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
      { label: "User Data Retrieval", href: "/user-data", icon: Database, badge: "TEMP" },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { label: "Team Management", href: "/team_management", icon: Users },
      { label: "Workspace Settings", href: "/settings", icon: Settings },
      { label: "User Profile", href: "/profile", icon: User },
    ],
  },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  // Strict Authentication Guard: Block access if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Loading Screen while session is validating
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111111] text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#191919] border border-[#262626] p-3 flex items-center justify-center shadow-2xl relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-[#C8FF00] stroke-current animate-pulse"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
              <path d="M4 9.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C8FF00] rounded-full animate-ping" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold tracking-tight text-white">
              Catalog<span className="text-[#C8FF00]">Forge</span>
            </h2>
            <p className="text-xs text-[#8E8E8E] font-medium">Verifying enterprise session &amp; governance credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, render secure blocking redirect state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111111] text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#191919] border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-neutral-200">Access Restricted</h2>
            <p className="text-xs text-[#8E8E8E]">Redirecting to CatalogForge authentication portal...</p>
          </div>
        </div>
      </div>
    );
  }

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
    if (pathname.includes("/user-data")) return "User Data Retrieval";
    if (pathname.includes("/team_management")) return "Team Management Studio";
    if (pathname.includes("/settings")) {
      const tab = searchParams?.get("tab");
      if (tab === "access") return "Access & Permissions";
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
      return pathname === "/upload";
    }
    if (href === "/products") {
      const currentStatus = searchParams?.get("status");
      return pathname === "/products" && currentStatus !== "needs_review";
    }
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] text-[#171717] font-sans" suppressHydrationWarning>

      {/* ── Payline-Inspired Premium Global Top Header ─────────── */}
      <header className="sticky top-0 z-40 h-16 bg-[#111111] border-b border-[#222222] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm select-none" suppressHydrationWarning>
        
        {/* Left: Mobile Toggle + Payline Brand Identity + Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0" suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#8E8E8E] hover:text-white rounded-xl hover:bg-[#1C1C1C] transition-colors shrink-0"
            aria-label="Toggle navigation"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand Identity using Payline Wave & Clean Typography */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group py-1 shrink-0" suppressHydrationWarning>
            <div className="w-8 h-8 rounded-xl bg-[#191919] border border-[#2D2D2D] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-[#C8FF00] stroke-current"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                <path d="M4 9.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white truncate">
              Catalog<span className="text-[#C8FF00]">Forge</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-4 bg-[#262626] shrink-0" />

          {/* Current Section Name */}
          <div className="hidden sm:flex items-center text-xs font-semibold text-[#8E8E8E] truncate" suppressHydrationWarning>
            <span>{currentSectionName}</span>
          </div>
        </div>

        {/* Right: Quick Ingest CTA, Notifications, and User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0" suppressHydrationWarning>
          
          {/* Quick Action: Ingest Dataset Neon-Lime Pill CTA */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full transition-all shadow-sm active:scale-95"
            suppressHydrationWarning
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Ingest Data</span>
          </Link>

          {/* Notifications Link */}
          <Link
            href="/settings?tab=notifications"
            className="p-2 text-[#8E8E8E] hover:text-white hover:bg-[#1C1C1C] rounded-full transition-colors relative"
            title="Notifications & Alerts"
            aria-label="Notification Settings"
            suppressHydrationWarning
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8FF00] rounded-full ring-2 ring-[#111111]" />
          </Link>

          {/* Vertical Divider */}
          <div className="w-px h-5 bg-[#262626] mx-0.5 hidden xs:block" />

          {/* User Profile Dropdown Pill */}
          <div className="relative" suppressHydrationWarning>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#191919] hover:bg-[#222222] border border-[#2B2B2B] transition-colors text-left group"
              suppressHydrationWarning
            >
              <div className="w-7 h-7 rounded-full bg-[#C8FF00] text-[#111111] flex items-center justify-center text-xs font-black shadow-sm shrink-0" suppressHydrationWarning>
                {userInitial}
              </div>
              <div className="hidden md:flex flex-col min-w-0 max-w-[120px]" suppressHydrationWarning>
                <span className="text-xs font-bold text-white truncate leading-none" suppressHydrationWarning>
                  {userLabel.split("@")[0]}
                </span>
                <span className="text-[10px] text-[#8E8E8E] truncate leading-none mt-1">
                  Administrator
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8E8E] group-hover:text-white hidden md:block transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#161616] border border-[#2B2B2B] rounded-2xl p-2 shadow-2xl z-50 space-y-1 text-xs text-neutral-300 animate-in fade-in slide-in-from-top-2 duration-150" suppressHydrationWarning>
                  <div className="px-3 py-2.5 border-b border-[#262626]">
                    <p className="font-bold text-white truncate">{userLabel}</p>
                    <p className="text-[10px] text-[#8E8E8E] mt-0.5">Administrator Account</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#222222] text-neutral-200 hover:text-white transition"
                    suppressHydrationWarning
                  >
                    <User className="w-3.5 h-3.5 text-[#C8FF00]" />
                    <span>User Profile</span>
                  </Link>
                  <Link
                    href="/team_management"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#222222] text-neutral-200 hover:text-white transition"
                    suppressHydrationWarning
                  >
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Team Management</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#222222] text-neutral-200 hover:text-white transition"
                    suppressHydrationWarning
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/audit"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#222222] text-neutral-200 hover:text-white transition"
                    suppressHydrationWarning
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Governance Audit Logs</span>
                  </Link>
                  <div className="border-t border-[#262626] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition text-left font-bold"
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
        {/* ── Modern B2B Payline-Style Desktop Sidebar ──────────────── */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-[#111111] border-r border-[#222222] transition-all duration-300 select-none relative z-30 shrink-0",
            collapsed ? "w-[72px]" : "w-[245px] lg:w-[250px]"
          )}
          suppressHydrationWarning
        >
          {/* Nav Sections */}
          <div className="flex-1 overflow-y-auto py-5 space-y-5 px-3 custom-scrollbar">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1.5">
                {/* Section Header */}
                {!collapsed && (
                  <p className="px-3 pb-1 text-[10px] font-bold text-[#686868] uppercase tracking-wider select-none">
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
                          "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                          isActive
                            ? "bg-[#1C1C1C] text-white border border-[#2D2D2D] shadow-sm"
                            : "text-[#8E8E8E] hover:text-white hover:bg-[#181818] border border-transparent",
                          collapsed && "justify-center px-1.5"
                        )}
                        suppressHydrationWarning
                      >
                        {/* Left Active Accent Pill */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C8FF00] rounded-r-full shadow-sm" />
                        )}

                        {/* Icon Container with Payline Lime highlight on active */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                            isActive
                              ? "bg-[#C8FF00] text-[#111111] shadow-sm font-bold"
                              : "bg-[#181818] border border-[#262626] text-[#8E8E8E] group-hover:text-white group-hover:border-[#333333]"
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
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30">
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
          <div className="border-t border-[#222222] p-3 space-y-2 bg-[#111111]" suppressHydrationWarning>
            {/* User Mini Card */}
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#181818] border border-[#262626]" suppressHydrationWarning>
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-[#C8FF00] text-[#111111] flex items-center justify-center text-xs font-black shrink-0 shadow-sm" suppressHydrationWarning>
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#C8FF00] rounded-full ring-2 ring-[#181818]" />
                </div>
                <div className="flex-1 min-w-0" suppressHydrationWarning>
                  <p className="text-xs font-bold text-white truncate leading-none" suppressHydrationWarning>{userLabel.split("@")[0]}</p>
                  <p className="text-[10px] text-[#8E8E8E] truncate leading-none mt-1 font-mono">Administrator</p>
                </div>
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#8E8E8E] hover:text-white hover:bg-[#181818] border border-transparent hover:border-[#262626] transition-all text-xs font-semibold",
                collapsed && "justify-center px-0"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              suppressHydrationWarning
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-[#8E8E8E]" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-[#8E8E8E]" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Modern Mobile Drawer ───────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sheet */}
            <div className="relative w-[280px] max-w-[85vw] bg-[#111111] flex flex-col z-10 border-r border-[#222222] shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Mobile Sheet Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#222222]">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)} suppressHydrationWarning>
                  <div className="w-7 h-7 rounded-lg bg-[#191919] border border-[#2D2D2D] p-1 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-full h-full text-[#C8FF00] stroke-current"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 14.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                      <path d="M4 9.5c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                    </svg>
                  </div>
                  <span className="font-bold text-base text-white">
                    Catalog<span className="text-[#C8FF00]">Forge</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#8E8E8E] hover:text-white hover:bg-[#1C1C1C] rounded-xl transition-colors"
                  suppressHydrationWarning
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1.5">
                    <p className="px-3 pb-1 text-[10px] font-bold text-[#686868] uppercase tracking-wider">
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
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] relative",
                              isActive
                                ? "bg-[#1C1C1C] text-white border border-[#2D2D2D] shadow-sm"
                                : "text-[#8E8E8E] hover:text-white hover:bg-[#181818] active:bg-[#202020]"
                            )}
                            suppressHydrationWarning
                          >
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                isActive ? "bg-[#C8FF00] text-[#111111]" : "bg-[#181818] border border-[#262626] text-[#8E8E8E]"
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30">
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
              <div className="border-t border-[#222222] p-3 space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#181818] border border-[#262626]" suppressHydrationWarning>
                  <div className="w-7 h-7 rounded-full bg-[#C8FF00] text-[#111111] flex items-center justify-center text-xs font-black" suppressHydrationWarning>
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0" suppressHydrationWarning>
                    <p className="text-xs font-bold text-white truncate" suppressHydrationWarning>{userLabel.split("@")[0]}</p>
                    <p className="text-[10px] text-[#8E8E8E] truncate">Administrator</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition min-h-[40px]"
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
        <main className="flex-1 overflow-y-auto min-h-0 bg-[#F7F7F7] bg-subtle-grid">
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
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
