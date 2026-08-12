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
} from "lucide-react";
import { BRANDING } from "@/lib/constants/branding";

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* 10.1 Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
                {BRANDING.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5 leading-none">
                {BRANDING.domain}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#workflow" className="hover:text-[#1D4ED8] transition-colors">
              Workflow
            </a>
            <a href="#explainability" className="hover:text-[#1D4ED8] transition-colors">
              Explainability
            </a>
            <a href="#capabilities" className="hover:text-[#1D4ED8] transition-colors">
              Capabilities
            </a>
            <a href="#security" className="hover:text-[#1D4ED8] transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-[#1D4ED8] px-3 py-2 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 10.2 Hero Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-200 text-[#1D4ED8] text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Enterprise Product Intelligence & Verification</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Transform raw product data into validated, source-grounded commerce records.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Structured enrichment, controlled vocabulary normalization, deterministic validation rules,
          and human-in-the-loop review queues for production catalog governance.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Enrichment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#workflow"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-slate-700 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center"
          >
            View Workflow
          </a>
        </div>
      </section>

      {/* 10.3 Workflow Visualization */}
      <section id="workflow" className="py-16 bg-white border-y border-[#E2E8F0] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Deterministic Product Intelligence Pipeline
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Constrained generation and auditability from ingestion to publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: "01",
                title: "Input Ingestion",
                desc: "CSV/XLSX or manufacturer PDF/URL documents",
                icon: Database,
              },
              {
                step: "02",
                title: "Classify",
                desc: "Schema detection & taxonomy mapping",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Enrich",
                desc: "Attribute extraction & LOV matching",
                icon: GitBranch,
              },
              {
                step: "04",
                title: "Validate",
                desc: "Confidence scoring & flag verification",
                icon: FileCheck2,
              },
              {
                step: "05",
                title: "Publish / Review",
                desc: "Auto-publish or human review routing",
                icon: CheckCircle2,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between hover:border-[#CBD5E1] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
                        {item.step}
                      </span>
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10.4 Explainability Section */}
      <section id="explainability" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Source-Grounded Explainability Architecture
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Every enriched attribute is traced back to explicit source evidence passages.
          </p>
        </div>

        {/* Abstract UI Diagram - Generic UI shapes (No hardcoded data) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Generated Field Value
              </span>
              <div className="mt-3 h-10 bg-slate-200 rounded animate-pulse" />
              <div className="mt-2 h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Source Evidence Snippet
              </span>
              <div className="mt-3 h-10 bg-blue-100 rounded animate-pulse" />
              <div className="mt-2 h-4 w-5/6 bg-blue-100 rounded animate-pulse" />
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Approved LOV Taxonomy Match
              </span>
              <div className="mt-3 h-10 bg-amber-100 rounded animate-pulse" />
              <div className="mt-2 h-4 w-2/3 bg-amber-100 rounded animate-pulse" />
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Deterministic Confidence Score
              </span>
              <div className="mt-3 h-10 bg-emerald-100 rounded animate-pulse" />
              <div className="mt-2 h-4 w-1/2 bg-emerald-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* 10.5 Capabilities Grid */}
      <section id="capabilities" className="py-16 bg-white border-t border-[#E2E8F0] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Enterprise Catalog Governance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Vocabulary-Constrained",
                desc: "Matches fields strictly against controlled lists of values (LOV) to ensure catalog standardization.",
                icon: Database,
              },
              {
                title: "Source-Grounded Generation",
                desc: "Extracts values backed by verifiable manufacturer snippets without hallucination.",
                icon: Search,
              },
              {
                title: "Human-in-the-Loop Review",
                desc: "Automatically routes low-confidence fields to expert review queues prior to catalog output.",
                icon: CheckCircle2,
              },
              {
                title: "Validation & Flagging",
                desc: "Enforces character limits, pattern validation, and standard unit conversion checks.",
                icon: FileCheck2,
              },
              {
                title: "Auditability & History",
                desc: "Field-level immutable tracking of generated values, evidence, and manual human overrides.",
                icon: Lock,
              },
              {
                title: "Live Quality Evaluation",
                desc: "Real-time scoreboard of LOV resolution rates, field accuracy, and SLA metrics.",
                icon: BarChart3,
              },
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{cap.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10.6 Footer */}
      <footer id="security" className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1D4ED8] text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">{BRANDING.name}</span>
            <span className="text-xs font-mono text-slate-500">({BRANDING.domain})</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Product Dashboard
            </Link>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow Spec
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security Governance
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
