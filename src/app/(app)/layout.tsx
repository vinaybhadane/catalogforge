"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ShieldCheck,
  Search,
  Bell,
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
      { label: "Review Studio", href: "/review", icon: CheckSquare },
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
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-[#1E40AF] transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-sm tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                {BRANDING.domain}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Action / Search / Status Indicator */}
        <div className="flex items-center gap-4">
          {/* System Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engine Ready</span>
          </div>

          {/* User Profile Slot Placeholder (Unfilled until Auth connection) */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-medium">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-slate-700">
              Authenticated Session
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-200 select-none relative z-30",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed ? (
                  <h3 className="px-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                    {section.title}
                  </h3>
                ) : (
                  <div className="h-4" />
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "bg-[#EFF6FF] text-[#1D4ED8] font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#1D4ED8]" : "text-slate-500")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors w-full flex items-center justify-center"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Sheet */}
            <div className="relative w-72 bg-white max-w-full flex flex-col z-10 shadow-xl">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#1D4ED8] text-white flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">{BRANDING.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <h3 className="px-2 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                      {section.title}
                    </h3>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#EFF6FF] text-[#1D4ED8] font-semibold"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", isActive ? "text-[#1D4ED8]" : "text-slate-500")} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full transition-colors duration-200",
            pathname === "/dashboard" ? "bg-[#E2E6E9]" : ""
          )}
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
