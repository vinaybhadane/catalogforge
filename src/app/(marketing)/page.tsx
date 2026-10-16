"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Cpu,
  Database,
  BarChart3,
  Sparkles,
  Zap,
  FileSpreadsheet,
  Menu,
  X,
  Eye,
  ChevronRight,
  Download,
  Check,
  Ruler,
} from "lucide-react";

// Header Navigation Links: Privacy Policy, Terms and Conditions, Contact Us (product, governance, pipeline removed)
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Privacy Policy", href: "#privacy", modal: "privacy" as const },
  { label: "Terms and Conditions", href: "#terms", modal: "terms" as const },
  { label: "Contact Us", href: "#contact" },
];

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "Pre-Flight & Ingestion",
    desc: "Ingests raw spreadsheets, PDFs, and rating plates; scrubs unbranded placeholder tokens.",
    tag: "SCRUBBER",
    icon: FileSpreadsheet,
  },
  {
    step: "02",
    title: "Classification & Taxonomy",
    desc: "Categorizes parts into Dept › Class › Fine retail taxonomy and assigns official UNSPSC codes.",
    tag: "TAXONOMY",
    icon: Layers,
  },
  {
    step: "03",
    title: "Attribute Enrichment",
    desc: "Extracts technical attributes from authoritative OEM datasheets with fraction standardizer.",
    tag: "OEM GROUNDED",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Controlled Vocabulary",
    desc: "Standardizes 1,472 fitting connections and 464 material variants into approved dictionary terms.",
    tag: "NORMALIZED",
    icon: Database,
  },
  {
    step: "05",
    title: "Deterministic Validation",
    desc: "Applies 14+ strict boundary rules, electrical formulas, voltage ratings, and regex constraints.",
    tag: "RULES ENGINE",
    icon: FileCheck2,
  },
  {
    step: "06",
    title: "Confidence Scoring",
    desc: "Calculates mathematical extraction confidence with complete source URL provenance.",
    tag: "≥80% GATE",
    icon: BarChart3,
  },
  {
    step: "07",
    title: "HITL Review Studio",
    desc: "Flags low-confidence items (<85%) in human-in-the-loop review queues with visual diffs.",
    tag: "AUDIT QUEUE",
    icon: Eye,
  },
  {
    step: "08",
    title: "252-Column Delivery Export",
    desc: "Exports production-ready data sorted by Department in the golden 252-column Master format.",
    tag: "EXPORT READY",
    icon: Download,
  },
];

export default function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [modalContent, setModalContent] = useState<"privacy" | "terms" | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("catalogforge_cookie_consent");
      if (!consent) {
        const timer = setTimeout(() => {
          setShowCookieBanner(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore in case localStorage is blocked in private browsing
    }
  }, []);

  const handleAcceptCookies = () => {
    try {
      localStorage.setItem("catalogforge_cookie_consent", "accepted");
    } catch {}
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    try {
      localStorage.setItem("catalogforge_cookie_consent", "declined");
    } catch {}
    setShowCookieBanner(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalContent) setModalContent(null);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalContent, mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#171717] font-sans antialiased selection:bg-[#C8FF00] selection:text-[#171717] overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════
       * 1. HEADER — PAYLINE FLOATING BLACK PILL NAVIGATION
       * ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 w-full pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none animate-header-enter">
        <header className="pointer-events-auto max-w-[1240px] mx-auto bg-[#171717] text-white rounded-full h-[62px] sm:h-[66px] px-5 sm:px-7 flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.18)] border border-neutral-800/80 transition-all">
          
          {/* Left: Custom Vector Wave Logo Matching Payline UI */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] rounded-full py-1"
          >
            {/* Bespoke Payline-Inspired Wave Mark in Neon Lime */}
            <div className="w-[34px] h-[34px] rounded-full bg-[#1F1F1F] border border-neutral-700/80 flex items-center justify-center p-1 group-hover:border-[#C8FF00] transition-colors shadow-2xs shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8C7.5 6 10.5 6 13 7.5C15.5 9 17.5 9 19 8" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 11.5C7 9 11 9.5 14 11.5C17 13.5 18.5 13 20 11" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 15C6.5 13 10.5 13 13.5 15C16.5 17 18 16.5 20 14.5" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M5 18.5C7.5 16.5 10.5 16.5 13 18C15.5 19.5 17.5 19.5 19 18" stroke="#C8FF00" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center tracking-tight">
              <span className="font-bold text-[17px] text-white tracking-[-0.03em]">
                CATALOG<span className="text-[#C8FF00]">FORGE</span>
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Features, Privacy Policy, Terms and Conditions, Contact Us) */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => {
              if (link.modal) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => setModalContent(link.modal)}
                    className="text-[13.5px] text-[#A3A3A3] hover:text-white font-normal transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF00] rounded-sm cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13.5px] text-[#A3A3A3] hover:text-white font-normal transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8FF00] rounded-sm"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Auth & Primary Action */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/login"
              className="h-[38px] px-4 rounded-full text-[13px] font-medium text-white border border-neutral-700/90 hover:border-neutral-500 hover:bg-neutral-800/60 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="h-[38px] px-5 rounded-full text-[13px] font-semibold text-[#171717] bg-[#C8FF00] hover:bg-[#B7F000] shadow-[0_2px_12px_rgba(200,255,0,0.3)] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/signup"
              className="h-[34px] px-3.5 rounded-full text-[12px] font-semibold text-[#171717] bg-[#C8FF00] flex items-center justify-center"
            >
              Launch
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto sm:hidden mt-2 bg-[#171717] border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <nav className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => {
                if (link.modal) {
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => {
                        setModalContent(link.modal);
                        setMobileMenuOpen(false);
                      }}
                      className="text-[14px] font-medium text-neutral-300 hover:text-white py-2 px-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-between text-left w-full cursor-pointer"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </button>
                  );
                }
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[14px] font-medium text-neutral-300 hover:text-white py-2 px-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </a>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-10 rounded-full text-[13.5px] font-medium text-center border border-neutral-700 flex items-center justify-center"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-10 rounded-full text-[13.5px] font-semibold text-[#171717] bg-[#C8FF00] flex items-center justify-center gap-1.5"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
       * 2. HERO SECTION — CENTERED COMPOSITION WITH SUBTLE GRID
       * ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 sm:pt-14 pb-12 sm:pb-16 text-center bg-white overflow-hidden">
        
        {/* Subtle Transparent Background Grid */}
        <div className="absolute inset-0 bg-subtle-grid mask-radial-fade pointer-events-none opacity-70 -z-10" />

        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 animate-hero-fade">
          
          {/* Main Headline (Clean 2-line desktop composition) */}
          <h1 className="text-[34px] sm:text-[46px] md:text-[54px] lg:text-[58px] font-medium text-[#171717] tracking-[-0.04em] leading-[1.08] max-w-[900px] mx-auto font-sans">
            Turn complex product data<br className="hidden sm:inline" />{" "}
            <span className="text-[#171717]">into trusted industrial intelligence.</span>
          </h1>

          {/* Supporting Paragraph */}
          <p className="mt-3.5 sm:mt-4 text-[15.5px] sm:text-[17px] text-[#646464] max-w-[560px] mx-auto leading-[1.55] font-normal">
            Transform industrial catalogs, technical documents, and product specifications into structured, validated, source-grounded product data with AI-powered enrichment.
          </p>

          {/* Hero CTAs: Get Started & Learn More */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-[48px] px-7 rounded-full text-[14px] font-semibold text-[#171717] bg-[#C8FF00] hover:bg-[#B7F000] shadow-[0_2px_14px_rgba(200,255,0,0.32)] transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#pipeline"
              className="w-full sm:w-auto h-[48px] px-7 rounded-full text-[14px] font-medium text-[#171717] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all flex items-center justify-center active:scale-95"
            >
              Learn More
            </a>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────
         * 3. THE CENTERPIECE: TABLET / DASHBOARD MOCKUP (ZERO OVERFLOW)
         * ───────────────────────────────────────────────────────── */}
        <div id="product" className="mt-8 sm:mt-11 max-w-[1040px] mx-auto px-4 sm:px-6 relative">
          
          {/* TABLET DEVICE FRAME (Dark charcoal outer bezel with realistic depth) */}
          <div className="relative bg-[#171717] p-2 sm:p-3 rounded-[24px] sm:rounded-[32px] shadow-[0_24px_56px_-12px_rgba(0,0,0,0.18),0_8px_20px_-6px_rgba(0,0,0,0.08)] border border-neutral-700/60 ring-1 ring-white/10 text-left">
            
            {/* Tablet Top Sensor */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-neutral-800 rounded-full hidden sm:block" />

            {/* INTERIOR WHITE SCREEN */}
            <div className="bg-white rounded-[18px] sm:rounded-[24px] overflow-hidden border border-[#EAEAEA]">
              
              {/* Dashboard Top Bar */}
              <div className="bg-[#FAFAFA] border-b border-[#EAEAEA] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center text-[9px] font-bold text-[#C8FF00] shrink-0">
                    CF
                  </div>
                  <span className="text-[12.5px] font-semibold text-[#171717] tracking-tight truncate">
                    Product Intelligence Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E5E7EB] font-medium text-[#171717]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] ring-2 ring-[#C8FF00]/60 animate-pulse" />
                    Engine Active
                  </span>
                  <span className="hidden sm:inline font-mono text-[#8A8A8A]">
                    252-Column Golden Spec
                  </span>
                </div>
              </div>

              {/* KPI Cards Row (3 Compact Cards across upper dashboard) */}
              <div className="p-3 sm:p-4 border-b border-[#EFEFEF] bg-[#FCFCFC] grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Card 1 — Products Processed */}
                <div className="bg-white border border-[#EAEAEA] rounded-xl p-3 shadow-2xs">
                  <span className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider block">
                    Products Processed
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[20px] sm:text-[22px] font-bold text-[#171717] tracking-tight">
                      12,480
                    </span>
                    <span className="text-[10px] font-semibold text-[#495F00] bg-[#FAFFE5] px-1.5 py-0.2 rounded-full">
                      +100%
                    </span>
                  </div>
                  <span className="text-[11px] text-[#646464] block">
                    Catalog records processed
                  </span>
                </div>

                {/* Card 2 — Validated Records */}
                <div className="bg-white border border-[#EAEAEA] rounded-xl p-3 shadow-2xs">
                  <span className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider block">
                    Validated Records
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[20px] sm:text-[22px] font-bold text-[#171717] tracking-tight">
                      99.4%
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                  </div>
                  <span className="text-[11px] text-[#646464] block">
                    Passed strict validation
                  </span>
                </div>

                {/* Card 3 — OEM Evidence */}
                <div className="bg-white border border-[#EAEAEA] rounded-xl p-3 shadow-2xs">
                  <span className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider block">
                    OEM Evidence
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[20px] sm:text-[22px] font-bold text-[#171717] tracking-tight">
                      8,640
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                      Tier-1
                    </span>
                  </div>
                  <span className="text-[11px] text-[#646464] block">
                    Source-grounded records
                  </span>
                </div>

              </div>

              {/* Main Product Table (Desktop & Tablet: Fixed Layout, No Horizontal Scroll) */}
              <div className="hidden sm:block">
                <table className="w-full table-fixed text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-[#FBFBFB] border-b border-[#EAEAEA] text-[10.5px] font-semibold text-[#646464] uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-[16%]">Part Number</th>
                      <th className="py-2.5 px-3 w-[22%]">Manufacturer</th>
                      <th className="py-2.5 px-3 w-[34%]">Standardized Title</th>
                      <th className="py-2.5 px-3 w-[14%]">Confidence</th>
                      <th className="py-2.5 px-4 w-[14%] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {[
                      {
                        mpn: "HOM120",
                        oem: "Square D / Schneider",
                        title: "120V 20A 1-Pole Miniature Breaker",
                        conf: "99.2%",
                        status: "Verified",
                      },
                      {
                        mpn: "DCB518ASTS06G",
                        oem: "Diablo (Freud Inc)",
                        title: "1/2 in. x 18 in. Sanding Belt (6-Pack)",
                        conf: "98.6%",
                        status: "Verified",
                      },
                      {
                        mpn: "7100075678",
                        oem: "3M",
                        title: "Cubitron II 775L Stikit Film Disc P150",
                        conf: "99.4%",
                        status: "Verified",
                      },
                      {
                        mpn: "50044",
                        oem: "Klein Tools",
                        title: "50 Ft. High-Impact Steel Fish Tape",
                        conf: "97.8%",
                        status: "Verified",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-2.5 px-4 font-mono font-semibold text-[#171717] truncate">
                          {row.mpn}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#171717] truncate">
                          {row.oem}
                        </td>
                        <td className="py-2.5 px-3 text-[#333333] truncate">
                          {row.title}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#171717] truncate">
                          <span className="inline-flex items-center gap-1">
                            {row.conf}
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAFFE5] text-[#495F00] border border-[#DBFF6E]">
                            <Check className="w-3 h-3" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Product Card List (Below 640px: Fits 100% Inside Screen, No Scroll) */}
              <div className="sm:hidden p-3 space-y-2">
                {[
                  {
                    mpn: "HOM120",
                    oem: "Square D / Schneider",
                    title: "120V 20A 1-Pole Breaker",
                    conf: "99.2%",
                  },
                  {
                    mpn: "DCB518ASTS06G",
                    oem: "Diablo (Freud Inc)",
                    title: "1/2 in. x 18 in. Sanding Belt",
                    conf: "98.6%",
                  },
                  {
                    mpn: "7100075678",
                    oem: "3M Cubitron II",
                    title: "775L Stikit Film Disc P150",
                    conf: "99.4%",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#FBFBFB] border border-[#EAEAEA] rounded-xl p-2.5 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[12px] text-[#171717]">{item.mpn}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAFFE5] text-[#495F00] text-[9.5px] font-bold border border-[#DBFF6E]">
                        Verified
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#333333] truncate">{item.oem} • {item.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[10.5px] text-[#646464]">
                      <span>Confidence: <strong className="text-[#171717]">{item.conf}</strong></span>
                      <span className="text-emerald-700 font-medium">OEM Grounded</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="bg-[#FAFAFA] border-t border-[#EAEAEA] px-4 py-2 flex items-center justify-between text-[11px] text-[#646464]">
                <span>Showing 4 verified records</span>
                <span className="font-medium text-[#171717]">
                  Validation: <strong>14/14 Rules Passed</strong>
                </span>
              </div>

            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────
           * 4. FLOATING INFORMATION CARDS (Overlapping Tablet Edges)
           * ───────────────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            
            {/* Floating Card A — OEM Verified (Upper-Left Edge) */}
            <div className="absolute -top-4 -left-4 bg-white border border-[#EAEAEA] rounded-[18px] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex items-center gap-3 text-left w-52 -rotate-1 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-[#FAFFE5] border border-[#DBFF6E] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-[#495F00]" />
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                  OEM VERIFIED
                </span>
                <p className="text-[12.5px] font-bold text-[#171717]">HOM120</p>
                <p className="text-[10.5px] text-[#646464]">Source evidence available</p>
              </div>
            </div>

            {/* Floating Card B — Batch Progress (Upper-Right Edge) */}
            <div className="absolute -top-4 -right-4 bg-white border border-[#EAEAEA] rounded-[18px] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] text-left w-56 rotate-1 pointer-events-none">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9.5px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                  BATCH PROGRESS
                </span>
                <span className="text-[10.5px] font-bold text-[#171717]">Ready for Review</span>
              </div>
              <div className="w-full bg-[#F0F0F0] h-1.5 rounded-full overflow-hidden mb-1">
                <div className="bg-[#C8FF00] h-full rounded-full w-full" />
              </div>
              <p className="text-[10.5px] text-[#646464]">Validated product records</p>
            </div>

            {/* Floating Card C — Standardized Product (Lower-Left Edge) */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-[#EAEAEA] rounded-[18px] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex items-center gap-2.5 text-left w-60 rotate-1 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-[#171717] text-[#C8FF00] flex items-center justify-center shrink-0">
                <Ruler className="w-4 h-4 text-[#C8FF00]" />
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                  STANDARDIZED UOM
                </span>
                <p className="text-[12.5px] font-bold text-[#171717]">1/2 in (0.5 in)</p>
                <p className="text-[10.5px] text-[#646464]">Normalized specification</p>
              </div>
            </div>

            {/* Floating Card D — Validation Status (Lower-Right Edge) */}
            <div className="absolute -bottom-4 -right-4 bg-white border border-[#EAEAEA] rounded-[18px] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex items-center gap-2.5 text-left w-56 -rotate-1 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-[#C8FF00] text-[#171717] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <span className="text-[9.5px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                  STRICT GATE
                </span>
                <p className="text-[12.5px] font-bold text-[#171717]">Validation Passed</p>
                <p className="text-[10.5px] text-[#646464]">Evidence-backed records</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════
       * 4. DUAL FEATURE PANELS — COMPACT SPACING
       * ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Panel 1: Instant Data Extraction & Placeholder Scrubber */}
            <div className="bg-[#F7F7F7] rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 flex flex-col justify-between border border-[#EFEFEF] overflow-hidden">
              
              {/* Floating UI Card Demonstration */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-[0_12px_28px_rgba(0,0,0,0.04)] max-w-md mx-auto w-full my-4 text-left">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                  <span className="text-[10.5px] font-semibold text-[#8A8A8A] uppercase">Raw Ingestion Feed</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[9.5px] font-bold">
                    2 JUNK TOKENS SCRUBBED
                  </span>
                </div>
                <div className="py-2.5 font-mono text-[11.5px] text-[#646464] bg-[#F9FAFB] p-2.5 rounded-xl my-2.5 break-all">
                  "HOM2100 SqD 100A 2P 120/240V <span className="line-through text-rose-500">-- Unbranded --</span> <span className="line-through text-rose-500">N/A</span>"
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C8FF00]" />
                    <span className="text-[11.5px] font-semibold text-[#171717]">100 A • 120/240 V AC • 2P</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-emerald-600 font-bold">100% Grounded</span>
                </div>
              </div>

              {/* Text */}
              <div className="text-center pt-2">
                <h3 className="text-[22px] sm:text-[26px] font-medium text-[#171717] tracking-tight">
                  Instant, multi-modal ingestion
                </h3>
                <p className="mt-2 text-[14px] text-[#646464] max-w-md mx-auto leading-relaxed">
                  Ingest raw CSV, XLSX feeds, and technical datasheets. Pre-flight scans scrub uninformative vendor tokens before enrichment starts.
                </p>
              </div>

            </div>

            {/* Panel 2: Built for Industrial Scale & 252-Column Delivery */}
            <div className="bg-[#F7F7F7] rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 flex flex-col justify-between border border-[#EFEFEF] overflow-hidden">
              
              {/* Floating Timeline Demonstration */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-[0_12px_28px_rgba(0,0,0,0.04)] max-w-md mx-auto w-full my-4 text-center">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0] text-left">
                  <span className="text-[10.5px] font-semibold text-[#8A8A8A] uppercase">Automated Governance</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAFFE5] text-[#495F00] text-[9.5px] font-bold">
                    ISO AUDIT STAMPED
                  </span>
                </div>
                <div className="py-4 flex items-center justify-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center text-[11px] font-semibold text-[#646464]">
                    Feed
                  </div>
                  <div className="h-[2px] w-8 bg-[#C8FF00]" />
                  <div className="w-11 h-11 rounded-full bg-[#C8FF00] text-[#171717] flex items-center justify-center font-bold text-sm shadow-[0_0_14px_rgba(200,255,0,0.45)]">
                    <Sparkles className="w-4 h-4 text-[#171717]" />
                  </div>
                  <div className="h-[2px] w-8 bg-[#C8FF00]" />
                  <div className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center text-[11px] font-semibold">
                    252
                  </div>
                </div>
                <p className="text-[11.5px] font-medium text-[#171717]">
                  Supplier Ingest → 10-Stage Governance → Golden Deliverable
                </p>
              </div>

              {/* Text */}
              <div className="text-center pt-2">
                <h3 className="text-[22px] sm:text-[26px] font-medium text-[#171717] tracking-tight">
                  Built for industrial catalogs
                </h3>
                <p className="mt-2 text-[14px] text-[#646464] max-w-md mx-auto leading-relaxed">
                  Automated 3-tier taxonomy classification, 64th-inch fraction normalizer, and controlled vocabulary standardizer that scales seamlessly.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * 5. FEATURE SECTION — WHY INDUSTRIAL LEADERS CHOOSE CATALOGFORGE
       * ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-10 sm:py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-[30px] sm:text-[40px] font-medium text-[#171717] tracking-tight">
              Why industrial leaders choose CatalogForge
            </h2>
            <p className="mt-2 text-[14.5px] sm:text-[16px] text-[#646464] max-w-[540px] mx-auto">
              Purpose-built for industrial distributors, wholesalers, and catalog teams managing millions of complex SKUs.
            </p>
          </div>

          {/* 5-Item Composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-center">
            
            {/* Left Column (2 Feature Cards) */}
            <div className="space-y-5 sm:space-y-6">
              
              {/* Feature 1: Speed */}
              <div className="bg-[#F7F7F7] border border-[#EFEFEF] rounded-[24px] sm:rounded-[28px] p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#C8FF00] flex items-center justify-center shadow-[0_10px_20px_rgba(200,255,0,0.32)] mb-4">
                  <Zap className="w-7 h-7 text-[#171717]" />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171717]">
                  Speed &amp; Throughput
                </h3>
                <p className="mt-1.5 text-[13.5px] text-[#646464] leading-relaxed">
                  Sub-second automated enrichment (<strong className="text-[#171717]">&lt; 1.8s / SKU</strong>) with asynchronous HTTP HEAD asset validation.
                </p>
              </div>

              {/* Feature 2: Security & Zero-Hallucination */}
              <div className="bg-[#F7F7F7] border border-[#EFEFEF] rounded-[24px] sm:rounded-[28px] p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#C8FF00] flex items-center justify-center shadow-[0_10px_20px_rgba(200,255,0,0.32)] mb-4">
                  <ShieldCheck className="w-7 h-7 text-[#171717]" />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171717]">
                  Zero-Hallucination
                </h3>
                <p className="mt-1.5 text-[13.5px] text-[#646464] leading-relaxed">
                  Strict <strong className="text-[#171717]">≥80% sufficiency gatekeeper</strong>. Specs require verified OEM grounding or remain safely blank.
                </p>
              </div>

            </div>

            {/* Center Stage: Vibrant Lime Device Showcase */}
            <div className="bg-[#C8FF00] rounded-[28px] sm:rounded-[32px] p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_20px_44px_rgba(200,255,0,0.25)] min-h-[440px]">
              
              {/* Device Mockup */}
              <div className="relative z-10 w-full max-w-[250px] bg-[#171717] rounded-[28px] border-[3px] border-[#262626] p-3.5 text-white shadow-xl">
                <div className="w-16 h-3 bg-black rounded-full mx-auto mb-2.5" />
                <div className="flex items-center justify-between text-[9.5px] text-neutral-400 mb-3">
                  <span>CatalogForge Mobile</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
                </div>
                
                <div className="bg-neutral-900 rounded-xl p-3 mb-2.5 border border-neutral-800">
                  <p className="text-[9.5px] text-neutral-400">Total Enriched SKUs</p>
                  <p className="text-[18px] font-bold text-white tracking-tight">12,480</p>
                  <span className="text-[9.5px] text-[#C8FF00] font-semibold">+99.4% Validated</span>
                </div>

                <div className="space-y-1.5 mb-2.5">
                  <div className="bg-neutral-900 rounded-lg p-2 flex items-center justify-between border border-neutral-800 text-[10.5px]">
                    <span className="font-mono text-neutral-300">HOM120</span>
                    <span className="text-[#C8FF00] font-bold">99.2% Conf.</span>
                  </div>
                  <div className="bg-neutral-900 rounded-lg p-2 flex items-center justify-between border border-neutral-800 text-[10.5px]">
                    <span className="font-mono text-neutral-300">DCB518</span>
                    <span className="text-[#C8FF00] font-bold">98.6% Conf.</span>
                  </div>
                </div>

                <div className="bg-[#C8FF00] text-[#171717] rounded-lg py-1.5 text-center text-[10.5px] font-bold">
                  Quick Export (252 Cols)
                </div>
              </div>

              <p className="relative z-10 mt-5 text-[13px] font-semibold text-[#171717] tracking-tight text-center">
                Real-Time Mobile Catalog Governance
              </p>

            </div>

            {/* Right Column (2 Feature Cards) */}
            <div className="space-y-5 sm:space-y-6 md:col-span-2 lg:col-span-1">
              
              {/* Feature 3: Transparency */}
              <div className="bg-[#F7F7F7] border border-[#EFEFEF] rounded-[24px] sm:rounded-[28px] p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#C8FF00] flex items-center justify-center shadow-[0_10px_20px_rgba(200,255,0,0.32)] mb-4">
                  <Eye className="w-7 h-7 text-[#171717]" />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171717]">
                  100% Provenance
                </h3>
                <p className="mt-1.5 text-[13.5px] text-[#646464] leading-relaxed">
                  Every technical spec links directly to authoritative OEM evidence URLs with permanent ISO audit trail logs.
                </p>
              </div>

              {/* Feature 4: Controlled Vocabulary (LOV) */}
              <div className="bg-[#F7F7F7] border border-[#EFEFEF] rounded-[24px] sm:rounded-[28px] p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#C8FF00] flex items-center justify-center shadow-[0_10px_20px_rgba(200,255,0,0.32)] mb-4">
                  <Database className="w-7 h-7 text-[#171717]" />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171717]">
                  Controlled Vocabulary
                </h3>
                <p className="mt-1.5 text-[13.5px] text-[#646464] leading-relaxed">
                  Standardizes 1,472 raw fitting variants into approved Master Data dictionary terms without synonym drift.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * 6. REDESIGNED 8-STAGE PROCESSING PIPELINE WITH DIRECTIONAL ARROWS
       * Flow: 01 → 02 → 03 → 04
       *                     ↓
       *       08 ← 07 ← 06 ← 05
       * ═══════════════════════════════════════════════════════════ */}
      <section id="pipeline" className="py-10 sm:py-16 bg-[#FAFAFA] border-y border-[#EFEFEF]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-[600px] mx-auto mb-10 sm:mb-14">
            <span className="inline-block px-3 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[10.5px] font-semibold text-[#171717] uppercase tracking-wider mb-2">
              End-to-End Workflow
            </span>
            <h2 className="text-[30px] sm:text-[40px] font-medium text-[#171717] tracking-tight">
              Deterministic 8-Stage Pipeline
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15.5px] text-[#646464] leading-relaxed">
              Every raw record travels through strict, auditable stages with clear confidence boundaries and validation rules.
            </p>
          </div>

          {/* Desktop 2-Row Snake Flow with Directional Arrows */}
          <div className="hidden lg:block relative max-w-[1100px] mx-auto">
            
            {/* ROW 1: Stages 01 → 02 → 03 → 04 (Left-to-Right) */}
            <div className="grid grid-cols-4 gap-6 relative">
              {PIPELINE_STAGES.slice(0, 4).map((stage, idx) => {
                const StageIcon = stage.icon;
                const isLastInRow = idx === 3;
                const isSelected = activeStage === idx;

                return (
                  <div
                    key={stage.step}
                    onClick={() => setActiveStage(idx)}
                    className="relative flex flex-col items-center text-center group cursor-pointer"
                  >
                    {/* Directional Connector Arrow: Left to Right between 01-02, 02-03, 03-04 */}
                    {!isLastInRow && (
                      <div className="absolute top-7 left-[calc(50%+30px)] right-[calc(-50%+30px)] z-0 flex items-center pointer-events-none">
                        <div className="flex-1 h-[2px] bg-[#E2E8F0] group-hover:bg-[#C8FF00] transition-colors" />
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="-ml-1 shrink-0">
                          <path d="M1 1L5 5L1 9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}

                    {/* U-Turn Connector looping from Stage 04 down to Stage 05 */}
                    {isLastInRow && (
                      <div className="absolute top-7 left-[calc(50%+28px)] w-[140px] h-[270px] z-10 pointer-events-none">
                        <svg
                          width="140"
                          height="270"
                          viewBox="0 0 140 270"
                          fill="none"
                          className="overflow-visible"
                        >
                          {/* Loop running around the right margin of card 04 and down into node 05 */}
                          <path
                            d="M 0 0 L 80 0 Q 120 0 120 40 L 120 222 Q 120 262 80 262 L 0 262"
                            stroke="#CBD5E1"
                            strokeWidth="2"
                            strokeDasharray="5 5"
                            fill="none"
                          />
                          {/* Arrowhead pointing left directly into node 05 */}
                          <path
                            d="M 8 257 L 0 262 L 8 267"
                            fill="none"
                            stroke="#64748B"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Circular Stage Marker */}
                    <div
                      className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                        isSelected
                          ? "bg-[#C8FF00] text-[#171717] border-[#171717] shadow-sm scale-105"
                          : "bg-white text-[#171717] border-[#E2E8F0] group-hover:border-[#C8FF00] group-hover:shadow-2xs"
                      }`}
                    >
                      <StageIcon className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#171717] text-white text-[9.5px] font-bold flex items-center justify-center font-mono">
                        {stage.step}
                      </span>
                    </div>

                    {/* Card Content Below Marker */}
                    <div className="mt-3.5 space-y-1 w-full bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-2xs group-hover:border-neutral-400 transition-colors h-[152px] flex flex-col justify-start">
                      <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8A8A]">
                        {stage.tag}
                      </span>
                      <h4 className="text-[14.5px] font-semibold text-[#171717] leading-snug">
                        {stage.title}
                      </h4>
                      <p className="text-[12px] text-[#646464] leading-relaxed pt-1">
                        {stage.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ROW 2: Stages 08 ← 07 ← 06 ← 05 (Right-to-Left Snake Flow) */}
            <div className="grid grid-cols-4 gap-6 mt-10 relative">
              {/* Ordered in visual left-to-right columns: [Stage 08, Stage 07, Stage 06, Stage 05] */}
              {[PIPELINE_STAGES[7], PIPELINE_STAGES[6], PIPELINE_STAGES[5], PIPELINE_STAGES[4]].map((stage, colIdx) => {
                const StageIcon = stage.icon;
                const stageNum = parseInt(stage.step, 10);
                const globalIdx = stageNum - 1;
                const isSelected = activeStage === globalIdx;
                const isFinalStage = colIdx === 0; // Stage 08

                return (
                  <div
                    key={stage.step}
                    onClick={() => setActiveStage(globalIdx)}
                    className="relative flex flex-col items-center text-center group cursor-pointer"
                  >
                    {/* Left-pointing arrow connecting 05 -> 06 -> 07 -> 08 */}
                    {!isFinalStage && (
                      <div className="absolute top-7 right-[calc(50%+30px)] left-[calc(-50%+30px)] z-0 flex items-center flex-row-reverse pointer-events-none">
                        <div className="flex-1 h-[2px] bg-[#E2E8F0] group-hover:bg-[#C8FF00] transition-colors" />
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="-mr-1 shrink-0 rotate-180">
                          <path d="M1 1L5 5L1 9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}

                    {/* Circular Stage Marker */}
                    <div
                      className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                        isSelected
                          ? "bg-[#C8FF00] text-[#171717] border-[#171717] shadow-sm scale-105"
                          : "bg-white text-[#171717] border-[#E2E8F0] group-hover:border-[#C8FF00] group-hover:shadow-2xs"
                      }`}
                    >
                      <StageIcon className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#171717] text-white text-[9.5px] font-bold flex items-center justify-center font-mono">
                        {stage.step}
                      </span>
                    </div>

                    {/* Card Content Below Marker */}
                    <div className="mt-3.5 space-y-1 w-full bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-2xs group-hover:border-neutral-400 transition-colors h-[152px] flex flex-col justify-start">
                      <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8A8A]">
                        {stage.tag}
                      </span>
                      <h4 className="text-[14.5px] font-semibold text-[#171717] leading-snug">
                        {stage.title}
                      </h4>
                      <p className="text-[12px] text-[#646464] leading-relaxed pt-1">
                        {stage.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Mobile Single-Column Vertical Timeline with Downward Arrows (01 ↓ 02 ↓ ... ↓ 08) */}
          <div className="lg:hidden max-w-md mx-auto space-y-0">
            {PIPELINE_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isLast = idx === PIPELINE_STAGES.length - 1;
              return (
                <div key={stage.step} className="flex gap-4 relative">
                  {/* Timeline Column with Node and Connecting Line */}
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <div className="relative z-10 w-11 h-11 rounded-full bg-white border-2 border-[#171717] flex items-center justify-center shadow-xs">
                      <StageIcon className="w-4 h-4 text-[#171717]" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8FF00] text-[#171717] text-[8px] font-bold flex items-center justify-center font-mono">
                        {stage.step}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="w-[2px] flex-1 min-h-[36px] bg-[#E2E8F0] my-1 relative flex items-center justify-center">
                        <svg width="6" height="8" viewBox="0 0 6 8" fill="none" className="absolute bottom-0 text-[#94A3B8]">
                          <path d="M1 1L3 5L5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Stage Information */}
                  <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"} text-left`}>
                    <div className="bg-white border border-[#EAEAEA] rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-bold uppercase text-[#8A8A8A]">{stage.tag}</span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-[#171717]">{stage.title}</h4>
                      <p className="text-[12px] text-[#646464] mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * 7. FINAL CALL-TO-ACTION — VIBRANT LIME BANNER
       * ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="relative bg-[#C8FF00] rounded-[28px] sm:rounded-[36px] px-6 sm:px-12 lg:px-16 py-12 sm:py-18 text-center overflow-hidden shadow-[0_20px_48px_rgba(200,255,0,0.22)]">
            
            {/* Central Watermark Icon */}
            <div className="relative z-10 w-11 h-11 rounded-full bg-black/10 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-[#171717]" />
            </div>

            {/* Headline & Subtitle */}
            <div className="relative z-10 max-w-[640px] mx-auto">
              <h2 className="text-[32px] sm:text-[44px] md:text-[50px] font-medium text-[#171717] tracking-tight leading-[1.08]">
                Ready to get started?
              </h2>
              <p className="mt-3 text-[15px] sm:text-[17px] text-[#222222] font-normal leading-relaxed">
                Bring your industrial catalogs, supplier documents, and product specifications into one structured, source-grounded workflow.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto h-[48px] px-7 rounded-full text-[14px] font-semibold text-white bg-[#171717] hover:bg-black transition-all flex items-center justify-center shadow-md active:scale-95"
                >
                  Create account
                </Link>
                <a
                  href="#pipeline"
                  className="w-full sm:w-auto h-[48px] px-7 rounded-full text-[14px] font-medium text-[#171717] bg-white hover:bg-neutral-50 border border-black/10 transition-all flex items-center justify-center active:scale-95"
                >
                  Learn more
                </a>
              </div>
            </div>

            {/* Floating illustrative badge mockups */}
            <div className="hidden xl:block">
              {/* Top Right: Team Deliverable badge */}
              <div className="absolute top-6 right-8 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 shadow-md text-left flex items-center gap-2.5 pointer-events-none">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[9px] font-bold">VB</div>
                  <div className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white flex items-center justify-center text-[9px] font-bold">SP</div>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold text-[#171717]">Share deliverables</p>
                  <p className="text-[9.5px] text-[#646464]">Instant XLSX &amp; CSV</p>
                </div>
              </div>

              {/* Bottom Left: Data Completeness Chart */}
              <div className="absolute bottom-6 left-8 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 shadow-md text-left w-48 pointer-events-none">
                <p className="text-[9.5px] font-semibold text-[#8A8A8A] uppercase">Data Completeness</p>
                <div className="flex items-end gap-1.5 h-8 mt-1.5 mb-1">
                  <div className="w-2.5 bg-neutral-200 rounded-t h-3" />
                  <div className="w-2.5 bg-neutral-300 rounded-t h-5" />
                  <div className="w-2.5 bg-neutral-400 rounded-t h-4" />
                  <div className="w-2.5 bg-[#171717] rounded-t h-6" />
                  <div className="w-2.5 bg-[#171717] rounded-t h-8" />
                </div>
                <p className="text-[11.5px] font-bold text-[#171717]">99.4% Validated Master</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * 8. FOOTER & CONTACT — WITH ANCHORS FOR HEADER NAVIGATION
       * ═══════════════════════════════════════════════════════════ */}
      <footer id="contact" className="mt-auto pt-10 pb-8 bg-white border-t border-[#EFEFEF]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Contact Us Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-8 border-b border-[#EFEFEF]">
            <div>
              <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
                Get In Touch
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-medium text-[#171717] tracking-tight">
                Contact Us
              </h3>
            </div>
            <a
              href="mailto:contact@catalogforge.tech"
              className="text-[20px] sm:text-[28px] font-medium text-[#171717] hover:text-black tracking-tight underline decoration-neutral-300 hover:decoration-[#C8FF00] transition-colors"
            >
              contact@catalogforge.tech
            </a>
          </div>

          {/* Bottom Watermark Logo & Legal Row */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Watermark Brand Wordmark with Matching UI Wave Mark */}
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center p-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 8C7.5 6 10.5 6 13 7.5C15.5 9 17.5 9 19 8" stroke="#8A8A8A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 11.5C7 9 11 9.5 14 11.5C17 13.5 18.5 13 20 11" stroke="#8A8A8A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 15C6.5 13 10.5 13 13.5 15C16.5 17 18 16.5 20 14.5" stroke="#8A8A8A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M5 18.5C7.5 16.5 10.5 16.5 13 18C15.5 19.5 17.5 19.5 19 18" stroke="#8A8A8A" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-extrabold text-[24px] sm:text-[32px] lg:text-[38px] text-neutral-200 tracking-tight leading-none">
                CATALOGFORGE
              </span>
            </div>

            {/* Legal Links & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-[12px] text-[#8A8A8A]">
              <button
                type="button"
                onClick={() => setModalContent("privacy")}
                className="hover:text-[#171717] cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setModalContent("terms")}
                className="hover:text-[#171717] cursor-pointer transition-colors"
              >
                Terms and Conditions
              </button>
              <span>© 2026 CatalogForge. All rights reserved.</span>
            </div>

          </div>

        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
       * MODAL DIALOGS — PRIVACY POLICY & TERMS AND CONDITIONS
       * ═══════════════════════════════════════════════════════════ */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-hero-fade">
          <div className="bg-white rounded-[24px] max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200 text-left relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalContent(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {modalContent === "privacy" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAFFE5] border border-[#DBFF6E] flex items-center justify-center text-[#495F00]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[#171717]">Privacy Policy</h3>
                    <p className="text-[12px] text-[#8A8A8A]">CatalogForge Enterprise Data Governance</p>
                  </div>
                </div>

                <div className="text-[13px] text-[#555] space-y-3 pt-2 leading-relaxed border-t border-neutral-100">
                  <p>
                    <strong className="text-[#171717] block">1. Information We Process:</strong>
                    CatalogForge only ingests and processes technical product catalog spreadsheets, manufacturer datasheets, and OEM part numbers provided by your organization.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">2. Zero Data Contamination:</strong>
                    Customer catalog data is strictly isolated within your organization workspace. Your proprietary product records are never used to train generalized AI models.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">3. Authoritative OEM Sourcing:</strong>
                    Our retrieval engine queries authoritative manufacturer domains and technical documentation. Third-party consumer marketplaces are permanently blacklisted.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">4. Data Encryption &amp; Security:</strong>
                    All data in transit is protected using TLS 1.3 encryption. At-rest storage in Azure SQL enforces AES-256 encryption and SOC-2 compliant audit logging.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">5. Retention &amp; Deletion:</strong>
                    You retain 100% ownership of your catalog deliverables. You may export or purge your batch datasets at any time through your workspace settings.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalContent(null)}
                    className="px-5 py-2 rounded-full bg-[#171717] hover:bg-black text-white text-[13px] font-semibold transition-colors cursor-pointer"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C8FF00] flex items-center justify-center text-[#171717]">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-[#171717]">Terms and Conditions</h3>
                    <p className="text-[12px] text-[#8A8A8A]">Enterprise Service Agreement</p>
                  </div>
                </div>

                <div className="text-[13px] text-[#555] space-y-3 pt-2 leading-relaxed border-t border-neutral-100">
                  <p>
                    <strong className="text-[#171717] block">1. Acceptance of Terms:</strong>
                    By accessing CatalogForge, your organization agrees to these Terms of Service governing AI catalog enrichment and automated governance pipelines.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">2. Scope of Service:</strong>
                    CatalogForge provides 10-stage deterministic catalog processing, including 3-tier taxonomy mapping, fraction normalization, and 252-column master export.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">3. Validation &amp; Human-in-the-Loop:</strong>
                    While our deterministic rules enforce a ≥80% strict gatekeeper, catalog managers are provided a Human-in-the-Loop review studio for final catalog publication.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">4. Platform Availability:</strong>
                    CatalogForge maintains enterprise SLA availability targets for both the Next.js web application and the Fastify REST ingestion API.
                  </p>
                  <p>
                    <strong className="text-[#171717] block">5. Intellectual Property:</strong>
                    All enriched catalog records and generated deliverables belong exclusively to your business. CatalogForge claims no ownership over your catalog data.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalContent(null)}
                    className="px-5 py-2 rounded-full bg-[#171717] hover:bg-black text-white text-[13px] font-semibold transition-colors cursor-pointer"
                  >
                    Agree &amp; Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
       * 10. COOKIE CONSENT BANNER (FIRST VISIT ONLY)
       * ═══════════════════════════════════════════════════════════ */}
      {showCookieBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[420px] w-[calc(100%-2rem)] bg-[#171717]/95 backdrop-blur-xl border border-neutral-800 text-white rounded-3xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#C8FF00]/15 border border-[#C8FF00]/30 flex items-center justify-center shrink-0 text-[#C8FF00]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M7 14v.01" />
                <path d="M15 14v.01" />
                <path d="M11 17v.01" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[14.5px] font-semibold text-white tracking-tight">
                  Cookie Preferences
                </h4>
                <button
                  type="button"
                  onClick={handleDeclineCookies}
                  aria-label="Close cookie banner"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="mt-1.5 text-[12px] text-neutral-300 leading-relaxed">
                We use essential cookies and telemetry tokens to optimize catalog processing throughput and maintain session integrity. Read our{" "}
                <button
                  type="button"
                  onClick={() => setModalContent("privacy")}
                  className="text-[#C8FF00] underline underline-offset-2 hover:opacity-80 transition-opacity font-medium cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptCookies}
                  className="flex-1 h-9 px-4 rounded-full bg-[#C8FF00] hover:bg-[#b8eb00] text-[#171717] font-semibold text-[12.5px] transition-all active:scale-95 shadow-sm cursor-pointer flex items-center justify-center"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleDeclineCookies}
                  className="h-9 px-4 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-[12.5px] border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
