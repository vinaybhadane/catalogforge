"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Activity,
  CheckSquare,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  FileSpreadsheet,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Layers,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Flat KPI Card (Zero Shadows)
// ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "percent";
  badge?: string;
  badgeType?: "accent" | "neutral" | "warning" | "success";
}

function KpiCard({
  label,
  value,
  icon: Icon,
  format = "number",
  badge,
  badgeType = "neutral",
}: KpiCardProps) {
  const formatted =
    value === null
      ? "—"
      : format === "percent"
      ? `${Math.round(value * 100)}%`
      : value.toLocaleString();

  return (
    <div className="bg-white border border-[#CBCBCB] rounded-2xl p-5 hover:border-[#6D8196] transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A4A4A]/80">
            {label}
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold font-mono text-[#4A4A4A] tracking-tight">
            {formatted}
          </p>
          {badge && (
            <div className="pt-1">
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  badgeType === "accent" && "bg-[#FFFFE3] text-[#6D8196] border-[#6D8196]",
                  badgeType === "success" && "bg-emerald-50 text-emerald-700 border-emerald-300",
                  badgeType === "warning" && "bg-amber-50 text-amber-800 border-amber-300",
                  badgeType === "neutral" && "bg-[#ECEFF2] text-[#4A4A4A] border-[#CBCBCB]"
                )}
              >
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Flat icon well */}
        <div className="w-12 h-12 rounded-xl bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white border border-[#CBCBCB] rounded-2xl p-5 h-28 animate-pulse flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-[#CBCBCB]/40 rounded" />
        <div className="h-7 w-24 bg-[#CBCBCB]/60 rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#ECEFF2]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Formatters & Stage Badge
// ─────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StageBadge({ stage }: { stage: string | null }) {
  if (!stage) return <span className="text-[#4A4A4A]/50 text-xs">—</span>;

  const stageConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    queued: { label: "Queued", dot: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-300" },
    ingested: { label: "Ingested", dot: "bg-[#6D8196]", text: "text-[#6D8196]", bg: "bg-[#FFFFE3]", border: "border-[#6D8196]" },
    classified: { label: "Classified", dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-300" },
    enriched: { label: "Enriched", dot: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
    validated: { label: "Validated", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
    needs_review: { label: "Needs Review", dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
    published: { label: "Published", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
    failed: { label: "Failed", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-300" },
  };

  const current = stageConfig[stage] || {
    label: stage.replace(/_/g, " "),
    dot: "bg-[#6D8196]",
    text: "text-[#4A4A4A]",
    bg: "bg-[#ECEFF2]",
    border: "border-[#CBCBCB]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
        current.bg,
        current.border
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Flat Dashboard
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { summary, hookState, errorMessage, refresh } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = hookState === "idle" || hookState === "loading";

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    if (!summary?.recentJobs) return [];
    return summary.recentJobs.filter((job) => {
      const matchesSearch =
        searchTerm === "" ||
        job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.fileName && job.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage =
        filterStage === "all" ||
        (filterStage === "processing" && job.status === "processing") ||
        (filterStage === "needs_review" && job.stage === "needs_review") ||
        (filterStage === "completed" && job.status === "completed");

      return matchesSearch && matchesStage;
    });
  }, [summary?.recentJobs, searchTerm, filterStage]);

  return (
    <div className="min-h-full space-y-6 pb-10">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Action Bar (Clean Flat Card)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#CBCBCB] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFFFE3] border border-[#6D8196] text-[#6D8196] flex items-center gap-1.5 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Intelligence Pipeline Active
              </span>
              <span className="text-xs text-[#4A4A4A]/60 font-mono hidden sm:inline">
                v1.0 • Fastify & Azure SQL
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#4A4A4A] tracking-tight">
              Catalog Intelligence Dashboard
            </h1>
            <p className="text-sm text-[#4A4A4A]/80 max-w-2xl">
              Monitor multi-stage ingestion pipelines, review catalog accuracy, and track
              automated attribute enrichment across all product feeds.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="bg-white hover:bg-[#ECEFF2] text-[#4A4A4A] border border-[#CBCBCB] hover:border-[#6D8196] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={cn("w-4 h-4 text-[#6D8196]", isLoading && "animate-spin")} />
              Refresh
            </button>

            <Link
              href="/review"
              className="bg-white hover:bg-[#ECEFF2] text-[#4A4A4A] border border-[#CBCBCB] hover:border-[#6D8196] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-[#6D8196]" />
              Review Queue
            </Link>

            <Link
              href="/upload"
              className="bg-[#6D8196] hover:bg-[#576A7E] text-[#FFFFE3] border border-[#576A7E] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Data
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Error Banner
      ───────────────────────────────────────────────────────────── */}
      {hookState === "error" && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-900">Unable to load dashboard data.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-xs px-3 py-1 rounded-lg bg-white border border-red-300 text-red-800 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. Flat KPI Grid (5 Cards)
      ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Products Processed"
            value={summary.productsProcessed}
            icon={Package}
            badge="+12% this week"
            badgeType="accent"
          />
          <KpiCard
            label="Active Ingestion Jobs"
            value={summary.activeJobs}
            icon={Activity}
            badge="Live in Queue"
            badgeType="accent"
          />
          <KpiCard
            label="Needs Review"
            value={summary.needsReview}
            icon={CheckSquare}
            badge="HITL Studio"
            badgeType="warning"
          />
          <KpiCard
            label="Published Catalog"
            value={summary.published}
            icon={CheckCircle2}
            badge="Verified Active"
            badgeType="success"
          />
          <KpiCard
            label="Avg AI Confidence"
            value={summary.averageConfidence}
            icon={TrendingUp}
            format="percent"
            badge="Target >= 85%"
            badgeType="accent"
          />
        </div>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          4. Dual Analytics / Pipeline Insight Panels
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confidence Distribution Panel */}
        <div className="bg-white border border-[#CBCBCB] rounded-2xl p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#4A4A4A]">
                  AI Confidence Distribution
                </h2>
                <p className="text-xs text-[#4A4A4A]/70">
                  Confidence breakdown across attribute extraction & classification
                </p>
              </div>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-bold text-[#6D8196] bg-[#FFFFE3] border border-[#6D8196] px-3 py-1 rounded-full hover:bg-[#6D8196] hover:text-[#FFFFE3] transition-colors flex items-center gap-1"
            >
              Full Report <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-1">
            {/* High Confidence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A4A4A] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  High Confidence (≥ 90%) — Auto-Approved
                </span>
                <span className="font-mono font-bold text-[#4A4A4A]">78%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ECEFF2] border border-[#CBCBCB] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#6D8196]"
                  style={{ width: "78%" }}
                />
              </div>
            </div>

            {/* Medium Confidence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A4A4A] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Medium Confidence (70% - 89%) — Standard Check
                </span>
                <span className="font-mono font-bold text-[#4A4A4A]">17%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ECEFF2] border border-[#CBCBCB] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#6D8196]"
                  style={{ width: "17%" }}
                />
              </div>
            </div>

            {/* Low Confidence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4A4A4A] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Low Confidence (&lt; 70%) — Flagged for Review
                </span>
                <span className="font-mono font-bold text-[#4A4A4A]">5%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ECEFF2] border border-[#CBCBCB] overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchpad Panel */}
        <div className="bg-white border border-[#CBCBCB] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#4A4A4A]">Quick Launchpad</h2>
              <p className="text-xs text-[#4A4A4A]/70">Fast workspace navigation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            <Link
              href="/upload"
              className="bg-white hover:bg-[#ECEFF2] border border-[#CBCBCB] hover:border-[#6D8196] p-3 rounded-xl flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A4A4A]">Ingest Catalog</p>
                  <p className="text-[10px] text-[#4A4A4A]/70">Upload CSV / XLSX datasheets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6D8196] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products"
              className="bg-white hover:bg-[#ECEFF2] border border-[#CBCBCB] hover:border-[#6D8196] p-3 rounded-xl flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A4A4A]">Product Repository</p>
                  <p className="text-[10px] text-[#4A4A4A]/70">Search enriched catalog items</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6D8196] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/review"
              className="bg-white hover:bg-[#ECEFF2] border border-[#CBCBCB] hover:border-[#6D8196] p-3 rounded-xl flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4A4A4A]">Review Studio</p>
                  <p className="text-[10px] text-[#4A4A4A]/70">Resolve flagged discrepancies</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6D8196] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. Recent Jobs Table (Clean Flat Design)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#CBCBCB] rounded-2xl space-y-4 p-5">
        {/* Table Top Bar: Title, Search, and Stage Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#4A4A4A]">Recent Processing Jobs</h2>
            <p className="text-xs text-[#4A4A4A]/70">
              Live status across file uploads, pre-flight scans, and AI enrichment stages
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Flat Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs or files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#ECEFF2] border border-[#CBCBCB] focus:border-[#6D8196] px-3 py-1.5 pl-8 text-xs rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none w-48 md:w-56"
              />
              <Search className="w-3.5 h-3.5 text-[#4A4A4A]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Pills */}
            <div className="bg-[#ECEFF2] border border-[#CBCBCB] p-1 rounded-xl flex items-center gap-1">
              {[
                { id: "all", label: "All" },
                { id: "processing", label: "Processing" },
                { id: "needs_review", label: "Review" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStage(tab.id)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors",
                    filterStage === tab.id
                      ? "bg-[#6D8196] text-[#FFFFE3]"
                      : "text-[#4A4A4A]/70 hover:text-[#4A4A4A]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              href="/jobs"
              className="bg-white hover:bg-[#ECEFF2] border border-[#CBCBCB] text-xs font-bold text-[#6D8196] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-[#CBCBCB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Recent processing jobs">
              <thead>
                <tr className="border-b border-[#CBCBCB] text-[#4A4A4A] bg-[#ECEFF2]">
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Job ID</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Source File</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Row Count</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Pipeline Stage</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Progress</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Submitted</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBCBCB]/40">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="px-4 py-3.5">
                        <div className="h-4 bg-[#CBCBCB]/40 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[#4A4A4A]/60">
                      <FileSpreadsheet className="w-8 h-8 mx-auto text-[#6D8196]/40 mb-2" />
                      <p className="font-semibold text-xs">No processing jobs match your filter.</p>
                      <p className="text-[11px] text-[#4A4A4A]/50 mt-0.5">
                        Upload a new catalog dataset to start processing.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.jobId}
                      className="hover:bg-[#FFFFE3]/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#4A4A4A]">
                        {job.jobId.length > 12 ? `${job.jobId.slice(0, 12)}…` : job.jobId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#ECEFF2] border border-[#CBCBCB] flex items-center justify-center text-[#6D8196] shrink-0">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[#4A4A4A] truncate max-w-[140px]">
                            {job.fileName ?? "datasheet.csv"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#4A4A4A]">
                        {job.rowCount !== null ? job.rowCount.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={job.stage} />
                      </td>
                      <td className="px-4 py-3">
                        {job.progress !== null ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 bg-[#ECEFF2] border border-[#CBCBCB] h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#6D8196] to-indigo-500"
                                style={{ width: `${Math.min(job.progress, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#4A4A4A]">
                              {job.progress.toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#4A4A4A]/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECEFF2] border border-[#CBCBCB] text-[#4A4A4A]">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4A4A4A]/70 whitespace-nowrap text-[11px]">
                        {formatDate(job.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/jobs/${job.jobId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6D8196] bg-[#FFFFE3] border border-[#6D8196] hover:bg-[#6D8196] hover:text-[#FFFFE3] transition-colors"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
