"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Cpu,
  Search,
  Database,
  Lock,
  GitBranch,
  BarChart3,
  Sparkles,
  Zap,
  Check,
  Sliders,
  FileSpreadsheet,
  Globe,
  CheckSquare,
  Menu,
  X,
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";

export default function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#000000] overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
       * Black Responsive Header with CatalogForge Brand Logo & Name
       * ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#000000] border-b border-[#1E293B] shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group py-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-white/10 p-1 flex items-center justify-center shadow-[0_0_16px_rgba(51,134,231,0.4)] group-hover:scale-105 transition-transform">
              <Image
                src="/logo-icon.png"
                alt="CatalogForge Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight leading-none group-hover:opacity-90 transition-opacity">
              <span className="text-[#3386E7]">Catalog</span>
              <span className="text-[#FFFFFF]">Forge</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-300">
            <a
              href="#workflow"
              className="hover:text-[#F5B853] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Workflow
            </a>
            <a
              href="#explainability"
              className="hover:text-[#F5B853] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Explainability
            </a>
            <a
              href="#capabilities"
              className="hover:text-[#F5B853] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Capabilities
            </a>
            <a
              href="#security"
              className="hover:text-[#F5B853] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Security
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3.5">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-200 hover:text-white px-5 py-2.5 rounded-full border border-neutral-700 hover:border-[#F5B853] bg-neutral-900/90 transition-all hover:bg-neutral-800"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-get-started-oval text-sm font-black text-[#000000] px-7 py-3 rounded-full transition-all flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Header Controls (< md) */}
          <div className="flex md:hidden items-center gap-2.5">
            <Link
              href="/signup"
              className="btn-get-started-oval text-xs font-black text-[#000000] px-3.5 py-2 rounded-full transition-all flex items-center gap-1"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-gray-200 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5B853]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-neutral-800 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            <nav className="flex flex-col space-y-2">
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-200 hover:text-[#F5B853] hover:bg-neutral-900 px-4 py-3 rounded-xl transition-colors flex items-center justify-between"
              >
                <span>8-Stage Workflow</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </a>
              <a
                href="#explainability"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-200 hover:text-[#F5B853] hover:bg-neutral-900 px-4 py-3 rounded-xl transition-colors flex items-center justify-between"
              >
                <span>Explainability & Mockup</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </a>
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-200 hover:text-[#F5B853] hover:bg-neutral-900 px-4 py-3 rounded-xl transition-colors flex items-center justify-between"
              >
                <span>Enterprise Capabilities</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-200 hover:text-[#F5B853] hover:bg-neutral-900 px-4 py-3 rounded-xl transition-colors flex items-center justify-between"
              >
                <span>Audit & Security</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </a>
            </nav>

            <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold text-gray-200 bg-neutral-900 border border-neutral-700 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-get-started-oval text-center py-2.5 text-xs font-black text-[#000000] rounded-full flex items-center justify-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
       * Responsive Hero Section
       * ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Tactile Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full home-neu-pill text-[#0284C7] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-6 border border-[#38BDF8]/40 max-w-full leading-normal">
          <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>Enterprise Product Intelligence & Deterministic Verification</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#000000] tracking-tight leading-[1.15] max-w-4xl mx-auto break-words">
          Transform raw catalog data into <span className="text-[#3386E7]">validated</span>, source-grounded commerce records.
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-[#0F172A]/80 font-medium max-w-3xl mx-auto leading-relaxed px-2">
          Automated classification, controlled vocabulary normalization, deterministic validation rules,
          and human-in-the-loop review queues for production catalog governance.
        </p>

        {/* Hero CTAs */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 btn-get-started-oval text-[#000000] font-black text-sm rounded-full transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#workflow"
            className="w-full sm:w-auto px-7 py-3.5 sm:py-4 home-neu-btn text-[#000000] font-bold text-sm rounded-full transition-all flex items-center justify-center"
          >
            Explore 8-Stage Pipeline
          </a>
        </div>

        {/* Interactive Mockup Showcase (Responsive Grid) */}
        <div id="explainability" className="mt-10 sm:mt-14 home-neu-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-left border border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono font-bold text-[#0F172A] truncate max-w-[220px] sm:max-w-none">
                catalogforge-pipeline / job-exec-8492
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full home-neu-pill text-[10px] font-mono font-bold text-[#0284C7] shrink-0">
                CONFIDENCE: 98.4%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Raw Ingestion Input */}
            <div className="home-neu-inset p-4 sm:p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] block">
                Stage 1: Raw Ingest
              </span>
              <p className="font-mono text-xs font-bold text-[#000000] break-words">
                &quot;Square D QO 20A 1-Pole 120V 10kA Circuit Breaker QO120&quot;
              </p>
              <p className="text-[11px] text-[#0F172A]/70 font-medium">Unstructured supplier datasheet text</p>
            </div>

            {/* AI Extraction */}
            <div className="home-neu-inset p-4 sm:p-5 rounded-2xl space-y-2 border-l-4 border-l-[#2563EB]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] block">
                Stage 4: Normalized Attributes
              </span>
              <div className="text-[11px] font-mono space-y-1 text-[#000000]">
                <p><strong className="text-[#0F172A]">Amperage:</strong> 20 A</p>
                <p><strong className="text-[#0F172A]">Voltage:</strong> 120 V AC</p>
                <p><strong className="text-[#0F172A]">Poles:</strong> 1</p>
                <p><strong className="text-[#0F172A]">Interrupt:</strong> 10 kA</p>
              </div>
            </div>

            {/* Published Record */}
            <div className="home-neu-inset p-4 sm:p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                Stage 8: Governed Taxonomy
              </span>
              <p className="text-xs font-bold text-[#000000] break-words">
                Electrical &gt; Distribution &gt; Circuit Breakers &gt; Miniature
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  RULE VALIDATED
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1D4ED8] font-bold text-[10px]">
                  LOV RESOLVED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 8-Stage Deterministic Workflow Section
       * ───────────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-14 sm:py-20 bg-[#FFFFFF] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
            <span className="home-neu-pill px-3 py-1 text-xs font-black text-[#2563EB] uppercase tracking-wider">
              Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#000000] tracking-tight">
              Deterministic 8-Stage Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[#0F172A]/80 font-medium px-2">
              Every raw record travels through strict, auditable stages with clear confidence boundaries and validation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: "01",
                title: "Pre-flight & Ingestion",
                desc: "CSV/XLSX/PDF file validation, schema detection, and placeholder scanning.",
                icon: FileSpreadsheet,
              },
              {
                step: "02",
                title: "Classification & Taxonomy",
                desc: "Maps products into strict hierarchical classifications and classpaths.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Attribute Enrichment",
                desc: "Source-grounded extraction with units of measure normalization.",
                icon: Cpu,
              },
              {
                step: "04",
                title: "Controlled Vocab (LOV)",
                desc: "Enforces approved taxonomy vocabulary to eliminate synonym drift.",
                icon: Database,
              },
              {
                step: "05",
                title: "Deterministic Validation",
                desc: "Executes mathematical range rules and character boundary constraints.",
                icon: FileCheck2,
              },
              {
                step: "06",
                title: "Confidence Scoring",
                desc: "Field-level confidence mapping with explainability markers.",
                icon: BarChart3,
              },
              {
                step: "07",
                title: "HITL Review Studio",
                desc: "Low-confidence rows routed to reviewer queues with side-by-side diffs.",
                icon: CheckSquare,
              },
              {
                step: "08",
                title: "Auto-Publish & Audit",
                desc: "Final records committed to ERP/PIM systems with full audit history.",
                icon: CheckCircle2,
              },
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="home-neu-card home-neu-card-interactive p-5 sm:p-6 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-black text-[#0284C7]">
                      {stage.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#000000]">{stage.title}</h3>
                  <p className="text-xs text-[#0F172A]/70 font-medium leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * Capabilities & Governance
       * ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
          <span className="home-neu-pill px-3 py-1 text-xs font-black text-[#0284C7] uppercase tracking-wider">
            Governance
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#000000] tracking-tight">
            Built for Industrial Catalog Scale
          </h2>
          <p className="text-xs sm:text-sm text-[#0F172A]/80 font-medium px-2">
            Handles complex electrical, mechanical, and industrial distributor datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="home-neu-card home-neu-card-interactive p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#000000]">Controlled Vocabulary (LOV)</h3>
            <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed">
              Standardizes variants (e.g., &quot;Polycarbonate&quot;, &quot;PC&quot;, &quot;Polycarb&quot;) into exact approved master data terms automatically.
            </p>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[#000000]">
              <span className="text-emerald-700 font-bold">&gt; 96.8%</span> LOV Resolution
            </div>
          </div>

          <div className="home-neu-card home-neu-card-interactive p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#000000]">Placeholder Detection</h3>
            <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed">
              Catches invalid tokens like <code className="bg-[#E0F2FE] px-1 py-0.5 rounded text-[#0284C7] font-bold">-- Unbranded --</code> or <code className="bg-[#E0F2FE] px-1 py-0.5 rounded text-[#0284C7] font-bold">-- No DIB Brand --</code> before publishing.
            </p>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[#000000]">
              <span className="text-[#2563EB] font-bold">100%</span> Governance Clean
            </div>
          </div>

          <div id="security" className="home-neu-card home-neu-card-interactive p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#000000]">Full Audit Trail</h3>
            <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed">
              Every value change, confidence score calculation, and reviewer action is logged with immutable timestamps.
            </p>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[#000000]">
              <span className="text-emerald-700 font-bold">SOC-2 / ISO</span> Ready Logging
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * Call to Action Section
       * ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="home-neu-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 space-y-5 sm:space-y-6 border border-[#38BDF8]/40">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-[#000000] tracking-tight">
            Ready to Automate Your Catalog Enrichment?
          </h2>
          <p className="text-xs sm:text-sm text-[#0F172A]/80 font-medium max-w-xl mx-auto px-2">
            Get started with CatalogForge in minutes. Ingest raw spreadsheets, inspect confidence scores, and publish clean master data.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/signup"
              className="btn-get-started-oval w-full sm:w-auto px-8 sm:px-9 py-3.5 sm:py-4 rounded-full font-black text-[#000000] text-sm flex items-center justify-center gap-2 group"
            >
              <span>Launch Your Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * Black Footer with High-Contrast Dual-Color Branding
       * ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-8 sm:py-10 bg-[#000000] border-t border-[#1E293B] text-center text-xs text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/10 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(51,134,231,0.35)]">
              <Image
                src="/logo-icon.png"
                alt="CatalogForge Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-base tracking-tight">
              <span className="text-[#3386E7]">Catalog</span>
              <span className="text-[#FFFFFF]">Forge</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs">© 2026 CatalogForge.tech — Enterprise Product Intelligence</p>
        </div>
      </footer>
    </div>
  );
}

