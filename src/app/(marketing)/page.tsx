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
  TrendingUp,
  FileCode2,
  RefreshCw,
  Eye,
  ChevronRight,
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";

export default function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
       * 1. Sleek Dark Header (Matching Brand Aesthetics)
       * ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-[#1E293B] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group py-1">
            <div className="w-10 h-10 rounded-xl bg-[#141B2D] p-1.5 border border-slate-700/80 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="CatalogForge Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight leading-none">
              <span className="text-[#38BDF8]">Catalog</span>
              <span className="text-white">Forge</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-300">
            <a
              href="#pipeline"
              className="hover:text-white hover:bg-slate-800/60 transition-all px-4 py-2 rounded-xl"
            >
              8-Stage Pipeline
            </a>
            <a
              href="#interactive-demo"
              className="hover:text-white hover:bg-slate-800/60 transition-all px-4 py-2 rounded-xl"
            >
              Live Architecture
            </a>
            <a
              href="#capabilities"
              className="hover:text-white hover:bg-slate-800/60 transition-all px-4 py-2 rounded-xl"
            >
              Capabilities
            </a>
            <a
              href="#governance"
              className="hover:text-white hover:bg-slate-800/60 transition-all px-4 py-2 rounded-xl"
            >
              Security &amp; Audit
            </a>
          </nav>

          {/* Desktop Actions (Cohesive Color Match) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-200 hover:text-white px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 transition-all hover:bg-slate-800 shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-blue-400/30 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all group"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signup"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition shadow-sm"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A] border-t border-slate-800 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-2xl">
            <nav className="flex flex-col space-y-1">
              <a
                href="#pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 px-4 py-3 rounded-xl transition flex items-center justify-between"
              >
                <span>8-Stage Pipeline</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 px-4 py-3 rounded-xl transition flex items-center justify-between"
              >
                <span>Live Architecture Demo</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 px-4 py-3 rounded-xl transition flex items-center justify-between"
              >
                <span>Enterprise Capabilities</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
              <a
                href="#governance"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 px-4 py-3 rounded-xl transition flex items-center justify-between"
              >
                <span>Security &amp; Audit Trail</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Start Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
       * 2. Hero Section with Modern Aesthetic Blocks
       * ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 to-sky-400/15 blur-3xl -z-10 pointer-events-none rounded-full" />

        {/* Tactile Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200/80 shadow-sm text-[#2563EB] text-xs font-black uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Autonomous Industrial Product Intelligence</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0B0F17] tracking-tight leading-[1.12] max-w-5xl mx-auto">
          Transform raw catalog data into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#1D4ED8]">validated, source-grounded</span> commerce records.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
          Autonomous classification, controlled vocabulary normalization, deterministic validation rules,
          and zero-hallucination sourcing for industrial supply chain catalogs.
        </p>

        {/* Call to Action Buttons (Matching Header Colors) */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-blue-400/40 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#pipeline"
            className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 shadow-sm hover:border-slate-400 transition-all flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4 text-[#2563EB]" />
            <span>Explore 8-Stage Pipeline</span>
          </a>
        </div>

        {/* ── Key Performance Indicators (Micro Metrics) ─────────────── */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Schema</p>
            <p className="text-xl sm:text-2xl font-black text-[#0B0F17] mt-0.5">252 Columns</p>
            <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Golden Match
            </p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hallucination Gate</p>
            <p className="text-xl sm:text-2xl font-black text-[#0B0F17] mt-0.5">&gt;= 80% Conf.</p>
            <p className="text-[10px] font-medium text-[#2563EB] flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Strict Gatekeeper
            </p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LOV Resolution</p>
            <p className="text-xl sm:text-2xl font-black text-[#0B0F17] mt-0.5">99.4% Clean</p>
            <p className="text-[10px] font-medium text-purple-600 flex items-center gap-1 mt-1">
              <Database className="w-3 h-3" /> Master Data Bound
            </p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-left">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Processing Time</p>
            <p className="text-xl sm:text-2xl font-black text-[#0B0F17] mt-0.5">&lt; 1.8s / SKU</p>
            <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3" /> High Throughput
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
         * 3. Live Interactive Pipeline Terminal / Architecture Mockup
         * ───────────────────────────────────────────────────────────── */}
        <div id="interactive-demo" className="mt-14 bg-[#0B0F17] border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-9 shadow-2xl text-left">
          
          {/* Terminal Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-7">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                catalogforge-engine / job-trace-9182.oem
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-[#38BDF8] border border-blue-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                CONFIDENCE: 98.6%
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                TIER-1 OEM VERIFIED
              </span>
            </div>
          </div>

          {/* 3-Column Execution Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            
            {/* Step 1: Raw Unstructured Ingest */}
            <div className="bg-[#141B2D] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Input Stream • Stage 01
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  DIRTY SUPPLIER CSV
                </span>
              </div>
              <p className="font-mono text-slate-200 bg-[#0B0F17] p-3 rounded-xl border border-slate-800/80 leading-relaxed break-words">
                &quot;HOM2100 SqD 100A 2P 120/240V Miniature Breaker -- Unbranded -- N/A&quot;
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>⚠️ Placeholders Detected: <strong className="text-rose-400">2 tokens cleaned</strong></p>
                <p>⚡ Schema Mapping: <strong className="text-slate-200">11 Raw Supplier Headers</strong></p>
              </div>
            </div>

            {/* Step 2: AI Multi-Modal Enrichment & Normalization */}
            <div className="bg-[#141B2D] border border-[#2563EB]/40 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8]">
                  Normalization • Stage 04
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                  LOV GROUNDED
                </span>
              </div>
              <div className="font-mono text-slate-200 bg-[#0B0F17] p-3 rounded-xl border border-slate-800/80 space-y-1">
                <p><span className="text-slate-400">MPN:</span> <strong className="text-white">HOM2100</strong></p>
                <p><span className="text-slate-400">Current:</span> <strong className="text-white">100 A</strong> (UOM normalized)</p>
                <p><span className="text-slate-400">Voltage:</span> <strong className="text-white">120/240 V AC</strong></p>
                <p><span className="text-slate-400">Poles:</span> <strong className="text-white">2</strong></p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Provenance: <strong>se.com (Official OEM)</strong></span>
                <span className="text-emerald-400 font-bold">100% Whitelisted</span>
              </div>
            </div>

            {/* Step 3: Governed Master Record */}
            <div className="bg-[#141B2D] border border-emerald-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Published Output • Stage 08
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  252 COLS COMMITTED
                </span>
              </div>
              <div className="font-mono text-slate-200 bg-[#0B0F17] p-3 rounded-xl border border-slate-800/80 space-y-1">
                <p className="text-[11px] text-emerald-300 font-bold truncate">
                  Electrical &gt; Distribution &gt; Circuit Breakers
                </p>
                <p className="text-slate-400">UNSPSC: <strong className="text-white">40151500</strong></p>
                <p className="text-slate-400">Rule Validation: <strong className="text-emerald-400">14/14 Passed</strong></p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  AUTO-PUBLISHED
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-[#38BDF8] font-bold text-[10px] border border-blue-500/30">
                  AUDIT LOGGED
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 4. 8-Stage Deterministic Pipeline Architecture Grid
       * ───────────────────────────────────────────────────────────── */}
      <section id="pipeline" className="py-20 bg-white border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-black text-[#2563EB] uppercase tracking-wider">
              Architecture Blueprint
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B0F17] tracking-tight">
              Deterministic 8-Stage Pipeline
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Every raw record travels through strict, auditable stages with clear confidence boundaries and validation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                step: "01",
                title: "Pre-flight & Ingestion",
                desc: "CSV, XLSX, and multi-modal image scanning with automatic placeholder elimination.",
                icon: FileSpreadsheet,
              },
              {
                step: "02",
                title: "Classification & Taxonomy",
                desc: "Maps raw parts to Department > Class > Fine taxonomy and standardized UNSPSC codes.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Attribute Enrichment",
                desc: "Extracts technical specs from verified OEM sources with fraction & UOM normalization.",
                icon: Cpu,
              },
              {
                step: "04",
                title: "Controlled Vocab (LOV)",
                desc: "Resolves synonym drift into authoritative Master Data dictionary values.",
                icon: Database,
              },
              {
                step: "05",
                title: "Deterministic Validation",
                desc: "Applies mathematical boundary rules, range bounds, and regex constraints.",
                icon: FileCheck2,
              },
              {
                step: "06",
                title: "Confidence Scoring",
                desc: "Multi-factor probabilistic scoring with transparent provenance evidence.",
                icon: BarChart3,
              },
              {
                step: "07",
                title: "HITL Review Studio",
                desc: "Routes ambiguous records to human reviewer queues with side-by-side visual diffs.",
                icon: CheckSquare,
              },
              {
                step: "08",
                title: "252-Col Delivery Export",
                desc: "Exports production-ready data into golden 252-Column Excel and CSV delivery format.",
                icon: CheckCircle2,
              },
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="bg-[#F8FAFC] hover:bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-6 space-y-3.5 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-black text-slate-400 group-hover:text-[#2563EB] transition-colors">
                      STAGE {stage.step}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0B0F17]">{stage.title}</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 5. Enterprise Capabilities & Governance
       * ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-black text-[#2563EB] uppercase tracking-wider">
            Enterprise Governance
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B0F17] tracking-tight">
            Built for Industrial Catalog Scale
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Engineered specifically for electrical, plumbing, HVAC, and industrial distributor datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B0F17]">Controlled Vocabulary (LOV)</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Maps hundreds of supplier variations (e.g. &quot;Polycarbonate&quot;, &quot;PC&quot;, &quot;Polycarb&quot;) into exact approved master data terms automatically.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 flex items-center justify-between">
              <span>Standardization Rate:</span>
              <strong className="text-emerald-700 font-bold">&gt; 99.2% Resolved</strong>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B0F17]">Zero-Hallucination Gatekeeper</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Strict 80% confidence threshold on visual OCR and web retrieval. Rejects guesses and flags unverified records for human review.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 flex items-center justify-between">
              <span>Gatekeeper Policy:</span>
              <strong className="text-[#2563EB] font-bold">100% Grounded</strong>
            </div>
          </div>

          {/* Card 3 */}
          <div id="governance" className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-7 space-y-4 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#0B0F17]">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every value change, confidence score calculation, and reviewer action is logged permanently in Azure SQL with ISO timestamps.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 flex items-center justify-between">
              <span>Compliance Standards:</span>
              <strong className="text-emerald-700 font-bold">SOC-2 / ISO Ready</strong>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 6. High-Impact Call to Action Banner (Header Color Matched)
       * ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-[#0B0F17] border border-slate-800 rounded-3xl p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none" />

          <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-[#38BDF8] border border-blue-500/30 text-xs font-black uppercase tracking-wider">
            Ready for Production
          </span>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
            Ready to Automate Your Industrial Catalog Pipeline?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            Ingest raw spreadsheets, inspect real-time confidence scores, eliminate placeholders, and export 252-column enterprise master records.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-9 py-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-blue-400/40 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch Your Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 7. Sleek Dark Footer (Matching Header Exactly)
       * ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-10 bg-[#0B0F17] border-t border-[#1E293B] text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#141B2D] p-1 border border-slate-700/80 shadow-sm flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="CatalogForge Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black text-base tracking-tight text-white">
              <span className="text-[#38BDF8]">Catalog</span>Forge
            </span>
          </div>

          {/* Copyright & Tagline */}
          <p className="text-[11px] sm:text-xs text-slate-400">
            © 2026 CatalogForge.tech — Enterprise Product Intelligence &amp; Autonomous Governance
          </p>
        </div>
      </footer>
    </div>
  );
}
