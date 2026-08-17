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
    <div className="min-h-screen flex flex-col bg-[#E2E6E9]">
      {/* Neumorphic Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#E2E6E9] border-b border-[rgba(203,203,203,0.5)] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-[0_4px_12px_rgba(74,74,74,0.08)]">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden neu-btn p-2 text-[#4A4A4A] rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Name in Embossed Tactile Well */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3] font-bold group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#4A4A4A] text-base tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[10px] text-[#6D8196] font-mono mt-1 leading-none font-bold">
                {BRANDING.domain}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Action / Status Indicator */}
        <div className="flex items-center gap-4">
          {/* Neumorphic Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-pill text-xs font-bold text-[#4A4A4A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#6D8196]">AI Engine Ready</span>
          </div>

          {/* User Profile Slot */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#CBCBCB]/60">
            <div className="w-9 h-9 rounded-xl neu-icon-well text-[#6D8196] flex items-center justify-center text-xs font-extrabold">
              {user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#4A4A4A]">
              {user?.displayName || user?.email || "Admin Workspace"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Neumorphic Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-[#E2E6E9] border-r border-[rgba(203,203,203,0.5)] transition-all duration-200 select-none relative z-30",
            collapsed ? "w-18" : "w-64"
          )}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1.5">
                {!collapsed ? (
                  <h3 className="px-2 text-[10px] font-extrabold text-[#6D8196] tracking-wider uppercase mb-2">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "neu-inset text-[#6D8196] border border-[#6D8196]/40"
                          : "neu-btn text-[#4A4A4A] hover:text-[#333333]",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-[#6D8196]" : "text-[#4A4A4A]/70"
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
          <div className="p-3.5 border-t border-[rgba(203,203,203,0.5)] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="neu-btn p-2 rounded-xl text-[#4A4A4A] w-full flex items-center justify-center"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-[#6D8196]" /> : <ChevronLeft className="w-4 h-4 text-[#6D8196]" />}
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
            <div className="relative w-72 bg-[#E2E6E9] max-w-full flex flex-col z-10 border-r border-[#CBCBCB] p-4">
              <div className="pb-4 border-b border-[#CBCBCB]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl neu-btn-accent text-[#FFFFE3] flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-[#4A4A4A] text-sm">{BRANDING.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="neu-btn p-1.5 text-[#4A4A4A] rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <h3 className="px-2 text-xs font-extrabold text-[#6D8196] tracking-wider uppercase mb-2">
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
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                            isActive
                              ? "neu-inset text-[#6D8196] border border-[#6D8196]/40"
                              : "neu-btn text-[#4A4A4A]"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isActive ? "text-[#6D8196]" : "text-[#4A4A4A]/70"
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-[#E2E6E9]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
