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
import { useAuth } from "@/lib/auth/AuthProvider";
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
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#CBCBCB] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#4A4A4A] hover:text-[#333333] rounded-md hover:bg-[#ECEFF2] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#6D8196] flex items-center justify-center text-[#FFFFE3] font-bold transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#4A4A4A] text-sm tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[10px] text-[#6D8196] font-mono mt-0.5 leading-none">
                {BRANDING.domain}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Action / Search / Status Indicator */}
        <div className="flex items-center gap-4">
          {/* System Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFE3] border border-[#6D8196]/40 text-[#4A4A4A] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engine Ready</span>
          </div>

          {/* User Profile Slot */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#CBCBCB]">
            <div className="w-7 h-7 rounded-full bg-[#ECEFF2] border border-[#CBCBCB] text-[#6D8196] flex items-center justify-center text-xs font-bold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-[#4A4A4A]">
              {user?.displayName || user?.email || "Authenticated Session"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-white border-r border-[#CBCBCB] transition-all duration-200 select-none relative z-30",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed ? (
                  <h3 className="px-2 text-[11px] font-bold text-[#6D8196] tracking-wider uppercase mb-2">
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
                        "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-[#FFFFE3] text-[#4A4A4A] border border-[#6D8196] font-bold"
                          : "text-[#4A4A4A] hover:bg-[#ECEFF2]",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-[#6D8196]" : "text-[#4A4A4A]/60"
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-[#CBCBCB] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-[#4A4A4A] hover:bg-[#ECEFF2] transition-colors w-full flex items-center justify-center"
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
              className="fixed inset-0 bg-[#4A4A4A]/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Sheet */}
            <div className="relative w-72 bg-white max-w-full flex flex-col z-10 border-r border-[#CBCBCB]">
              <div className="p-4 border-b border-[#CBCBCB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#6D8196] text-[#FFFFE3] flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#4A4A4A] text-sm">{BRANDING.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#4A4A4A] hover:text-[#333333]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <h3 className="px-2 text-xs font-bold text-[#6D8196] tracking-wider uppercase mb-2">
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
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
                            isActive
                              ? "bg-[#FFFFE3] text-[#4A4A4A] border border-[#6D8196] font-bold"
                              : "text-[#4A4A4A] hover:bg-[#ECEFF2]"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isActive ? "text-[#6D8196]" : "text-[#4A4A4A]/60"
                            )}
                          />
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-[#F4F6F8]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
