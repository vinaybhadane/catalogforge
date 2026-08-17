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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#000000]">
      {/* Top Header — Clean Flat Navbar with Navy / Sky Blue Brand */}
      <header className="sticky top-0 z-40 h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#000000] rounded-xl hover:bg-[#F1F5F9] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo & Name */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center text-white font-bold transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#000000] text-base tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[10px] text-[#0284C7] font-mono mt-1 leading-none font-bold">
                {BRANDING.domain}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Action / Status Indicator */}
        <div className="flex items-center gap-4">
          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2FE] border border-[#38BDF8] text-xs font-bold text-[#0284C7]">
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
            <span>AI Engine Ready</span>
          </div>

          {/* User Profile Slot */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center text-xs font-black">
              {user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="hidden md:inline-block text-xs font-extrabold text-[#000000]">
              {user?.displayName || user?.email || "Admin Workspace"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Flat Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col bg-[#FFFFFF] border-r border-[#E2E8F0] transition-all duration-200 select-none relative z-30",
            collapsed ? "w-18" : "w-64"
          )}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed ? (
                  <h3 className="px-3 text-[10px] font-black text-[#0F172A]/70 tracking-wider uppercase mb-2">
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
                          ? "bg-[#E0F2FE] text-[#2563EB] border border-[#38BDF8]"
                          : "text-[#000000] hover:bg-[#F1F5F9] hover:text-[#2563EB]",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-[#2563EB]" : "text-[#0F172A]/70"
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
          <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl text-[#000000] hover:bg-[#F1F5F9] w-full flex items-center justify-center transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-[#2563EB]" /> : <ChevronLeft className="w-4 h-4 text-[#2563EB]" />}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Sheet */}
            <div className="relative w-72 bg-[#FFFFFF] max-w-full flex flex-col z-10 border-r border-[#E2E8F0] p-4">
              <div className="pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-black text-[#000000] text-sm">{BRANDING.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#000000] hover:bg-[#F1F5F9] rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <h3 className="px-3 text-xs font-black text-[#0F172A]/70 tracking-wider uppercase mb-2">
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
                              ? "bg-[#E0F2FE] text-[#2563EB] border border-[#38BDF8]"
                              : "text-[#000000] hover:bg-[#F1F5F9]"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isActive ? "text-[#2563EB]" : "text-[#0F172A]/70"
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
