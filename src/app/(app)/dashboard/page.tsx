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
// Neumorphic KPI Card
// ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "percent";
  badge?: string;
  badgeType?: "accent" | "neutral" | "warning" | "success";
  accentColor?: string;
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
    <div className="neu-card neu-card-interactive rounded-2xl p-5 relative overflow-hidden group">
      {/* Top subtle highlight rim */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFFFE3]/80 to-transparent" />

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
                  "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full neu-pill",
                  badgeType === "accent" && "text-[#6D8196] border-[#6D8196]/30",
                  badgeType === "success" && "text-emerald-700 border-emerald-500/30",
                  badgeType === "warning" && "text-amber-800 border-amber-500/30",
                  badgeType === "neutral" && "text-[#4A4A4A]/70 border-[#CBCBCB]"
                )}
              >
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Embossed tactile icon well */}
        <div className="w-12 h-12 rounded-xl neu-icon-well flex items-center justify-center text-[#6D8196] shadow-sm group-hover:scale-105 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="neu-card rounded-2xl p-5 h-28 animate-pulse flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-[#CBCBCB]/40 rounded" />
        <div className="h-7 w-24 bg-[#CBCBCB]/60 rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl neu-inset" />
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

  const stageConfig: Record<string, { label: string; dot: string; text: string }> = {
    queued: { label: "Queued", dot: "bg-slate-400", text: "text-slate-700" },
    ingested: { label: "Ingested", dot: "bg-[#6D8196]", text: "text-[#6D8196]" },
    classified: { label: "Classified", dot: "bg-indigo-500", text: "text-indigo-700" },
    enriched: { label: "Enriched", dot: "bg-purple-500", text: "text-purple-700" },
    validated: { label: "Validated", dot: "bg-amber-500", text: "text-amber-700" },
    needs_review: { label: "Needs Review", dot: "bg-orange-500", text: "text-orange-700" },
    published: { label: "Published", dot: "bg-emerald-500", text: "text-emerald-700" },
    failed: { label: "Failed", dot: "bg-rose-500", text: "text-rose-700" },
  };

  const current = stageConfig[stage] || {
    label: stage.replace(/_/g, " "),
    dot: "bg-[#6D8196]",
    text: "text-[#4A4A4A]",
  };

  return (
    <span className="neu-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider">
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Neumorphic Dashboard
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
    <div className="min-h-full space-y-7 pb-10">
      {/* ─────────────────────────────────────────────────────────────
          1. Neumorphic Header & Action Bar
      ───────────────────────────────────────────────────────────── */}
      <div className="neu-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="neu-pill px-3 py-1 rounded-full text-[11px] font-bold text-[#6D8196] flex items-center gap-1.5 tracking-wide">
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

          {/* Tactile Action Buttons */}
          <div className="flex items-center flex-wrap gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="neu-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all disabled:opacity-50"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={cn("w-4 h-4 text-[#6D8196]", isLoading && "animate-spin")} />
              Refresh
            </button>

            <Link
              href="/review"
              className="neu-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#4A4A4A] tracking-wide transition-all"
            >
              <CheckSquare className="w-4 h-4 text-[#6D8196]" />
              Review Queue
            </Link>

            <Link
              href="/upload"
              className="neu-btn-accent flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all"
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
        <div className="neu-card rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load dashboard data.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="neu-btn text-xs px-3 py-1 rounded-lg text-rose-800 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. Tactile KPI Grid (5 Cards)
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
          4. Neumorphic Dual Analytics / Pipeline Insight Cards
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confidence Distribution Panel */}
        <div className="neu-card rounded-2xl p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
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
              className="neu-pill text-xs font-semibold text-[#6D8196] px-3 py-1 rounded-full hover:text-[#4A4A4A] transition-colors flex items-center gap-1"
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
              <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#6D8196] transition-all duration-500"
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
              <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#6D8196] transition-all duration-500"
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
              <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchpad Panel */}
        <div className="neu-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
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
              className="neu-btn neu-card-interactive p-3 rounded-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
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
              className="neu-btn neu-card-interactive p-3 rounded-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
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
              className="neu-btn neu-card-interactive p-3 rounded-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg neu-icon-well flex items-center justify-center text-[#6D8196]">
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
          5. Neumorphic Recent Jobs Table
      ───────────────────────────────────────────────────────────── */}
      <div className="neu-card rounded-2xl overflow-hidden space-y-4 p-5">
        {/* Table Top Bar: Title, Search, and Stage Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#4A4A4A]">Recent Processing Jobs</h2>
            <p className="text-xs text-[#4A4A4A]/70">
              Live status across file uploads, pre-flight scans, and AI enrichment stages
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Sunken Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs or files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-inset-sm px-3 py-1.5 pl-8 text-xs rounded-xl text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none w-48 md:w-56"
              />
              <Search className="w-3.5 h-3.5 text-[#4A4A4A]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Pills */}
            <div className="neu-inset-sm p-1 rounded-xl flex items-center gap-1">
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
                    "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all",
                    filterStage === tab.id
                      ? "neu-btn-accent text-white"
                      : "text-[#4A4A4A]/70 hover:text-[#4A4A4A]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              href="/jobs"
              className="neu-btn text-xs font-bold text-[#6D8196] px-3 py-1.5 rounded-xl flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tactile Table Inset Wrapper */}
        <div className="neu-inset rounded-xl overflow-hidden p-1">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-xs text-left" aria-label="Recent processing jobs">
              <thead>
                <tr className="border-b border-[#CBCBCB]/40 text-[#4A4A4A]/80 bg-[#E2E6E9]/60">
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
              <tbody className="divide-y divide-[#CBCBCB]/25">
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
                      className="hover:bg-[#FFFFE3]/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#4A4A4A]">
                        {job.jobId.length > 12 ? `${job.jobId.slice(0, 12)}…` : job.jobId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md neu-icon-well flex items-center justify-center text-[#6D8196] shrink-0">
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
                            <div className="w-20 neu-inset-sm h-2 rounded-full overflow-hidden p-0.5">
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
                        <span className="neu-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#4A4A4A]">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4A4A4A]/70 whitespace-nowrap text-[11px]">
                        {formatDate(job.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/jobs/${job.jobId}`}
                          className="neu-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6D8196] hover:text-[#4A4A4A] transition-colors"
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
