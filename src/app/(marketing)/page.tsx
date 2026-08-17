import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#000000]">
      {/* ─────────────────────────────────────────────────────────────
       * Neumorphic Header
       * ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl home-neu-btn-primary flex items-center justify-center font-bold text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#000000] text-base tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[10px] text-[#0284C7] font-mono mt-1 font-bold leading-none">
                {BRANDING.domain}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#0F172A]">
            <a href="#workflow" className="hover:text-[#2563EB] transition-colors">
              Workflow
            </a>
            <a href="#explainability" className="hover:text-[#2563EB] transition-colors">
              Explainability
            </a>
            <a href="#capabilities" className="hover:text-[#2563EB] transition-colors">
              Capabilities
            </a>
            <a href="#security" className="hover:text-[#2563EB] transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-[#000000] hover:text-[#2563EB] px-3.5 py-2 rounded-xl transition-colors home-neu-btn"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-bold text-white home-neu-btn-primary px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
       * Neumorphic Hero Section
       * ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Tactile Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full home-neu-pill text-[#0284C7] text-xs font-extrabold uppercase tracking-wider mb-6 border border-[#38BDF8]/40">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Enterprise Product Intelligence & Deterministic Verification</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#000000] tracking-tight leading-tight max-w-4xl mx-auto">
          Transform raw catalog data into <span className="text-[#2563EB]">validated</span>, source-grounded commerce records.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#0F172A]/80 font-medium max-w-3xl mx-auto leading-relaxed">
          Automated classification, controlled vocabulary normalization, deterministic validation rules,
          and human-in-the-loop review queues for production catalog governance.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-7 py-3.5 home-neu-btn-primary text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#workflow"
            className="w-full sm:w-auto px-7 py-3.5 home-neu-btn text-[#000000] font-bold text-sm rounded-xl transition-all flex items-center justify-center"
          >
            Explore 8-Stage Pipeline
          </a>
        </div>

        {/* Neumorphic Hero Interactive Mockup Showcase */}
        <div className="mt-14 home-neu-card rounded-3xl p-6 sm:p-8 text-left border border-[#E2E8F0]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-3 text-xs font-mono font-bold text-[#0F172A]">
                catalogforge-pipeline / job-exec-8492
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full home-neu-pill text-[10px] font-mono font-bold text-[#0284C7]">
                CONFIDENCE: 98.4%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Raw Ingestion Input */}
            <div className="home-neu-inset p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                Stage 1: Raw Ingest
              </span>
              <p className="font-mono text-xs font-bold text-[#000000]">
                &quot;Square D QO 20A 1-Pole 120V 10kA Circuit Breaker QO120&quot;
              </p>
              <p className="text-[11px] text-[#0F172A]/70 font-medium">Unstructured supplier datasheet text</p>
            </div>

            {/* AI Extraction */}
            <div className="home-neu-inset p-5 rounded-2xl space-y-2 border-l-4 border-l-[#2563EB]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">
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
            <div className="home-neu-inset p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Stage 8: Governed Taxonomy
              </span>
              <p className="text-xs font-bold text-[#000000]">
                Electrical &gt; Distribution &gt; Circuit Breakers &gt; Miniature
              </p>
              <div className="flex items-center gap-2 pt-1">
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
      <section id="workflow" className="py-20 bg-[#FFFFFF] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="home-neu-pill px-3 py-1 text-xs font-black text-[#2563EB] uppercase tracking-wider">
              Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#000000] tracking-tight">
              Deterministic 8-Stage Pipeline
            </h2>
            <p className="text-sm text-[#0F172A]/80 font-medium">
              Every raw record travels through strict, auditable stages with clear confidence boundaries and validation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="home-neu-card home-neu-card-interactive p-6 rounded-2xl space-y-3"
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
      <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="home-neu-pill px-3 py-1 text-xs font-black text-[#0284C7] uppercase tracking-wider">
            Governance
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#000000] tracking-tight">
            Built for Industrial Catalog Scale
          </h2>
          <p className="text-sm text-[#0F172A]/80 font-medium">
            Handles complex electrical, mechanical, and industrial distributor datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="home-neu-card home-neu-card-interactive p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#000000]">Controlled Vocabulary (LOV)</h3>
            <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed">
              Standardizes variants (e.g., &quot;Polycarbonate&quot;, &quot;PC&quot;, &quot;Polycarb&quot;) into exact approved master data terms automatically.
            </p>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[#000000]">
              <span className="text-emerald-700 font-bold">&gt; 96.8%</span> LOV Resolution
            </div>
          </div>

          <div className="home-neu-card home-neu-card-interactive p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#000000]">Placeholder Detection</h3>
            <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed">
              Catches invalid tokens like <code className="bg-[#E0F2FE] px-1 py-0.5 rounded text-[#0284C7] font-bold">-- Unbranded --</code> or <code className="bg-[#E0F2FE] px-1 py-0.5 rounded text-[#0284C7] font-bold">-- No DIB Brand --</code> before publishing.
            </p>
            <div className="neu-inset p-3 rounded-xl text-xs font-mono text-[#000000]">
              <span className="text-[#2563EB] font-bold">100%</span> Governance Clean
            </div>
          </div>

          <div className="home-neu-card home-neu-card-interactive p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl home-neu-icon-well flex items-center justify-center text-[#2563EB]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#000000]">Full Audit Trail</h3>
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
       * Call to Action Footer Pod
       * ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="home-neu-card rounded-3xl p-10 sm:p-14 space-y-6 border border-[#38BDF8]/40">
          <h2 className="text-2xl sm:text-4xl font-black text-[#000000] tracking-tight">
            Ready to Automate Your Catalog Enrichment?
          </h2>
          <p className="text-sm text-[#0F172A]/80 font-medium max-w-xl mx-auto">
            Get started with CatalogForge in minutes. Ingest raw spreadsheets, inspect confidence scores, and publish clean master data.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/signup"
              className="home-neu-btn-primary px-8 py-3.5 rounded-xl font-black text-white text-sm flex items-center gap-2"
            >
              <span>Launch Your Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * Footer
       * ───────────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-8 bg-[#FFFFFF] border-t border-[#E2E8F0] text-center text-xs text-[#0F172A]/70 font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg home-neu-btn-primary text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#000000]">{BRANDING.name}</span>
          </div>
          <p>© 2026 CatalogForge.tech — Enterprise Product Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
