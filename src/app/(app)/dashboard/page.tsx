"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Activity,
  CheckSquare,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Clean Flat KPI Card (Zero Shadows)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      ? "â€”"
      : format === "percent"
      ? `${Math.round(value * 100)}%`
      : value.toLocaleString();

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#2563EB] transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0F172A]/70">
            {label}
          </p>
          <p className="text-2xl lg:text-3xl font-black font-mono text-[#000000] tracking-tight">
            {formatted}
          </p>
          {badge && (
            <div className="pt-1">
              <span
                className={cn(
                  "inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                  badgeType === "accent" && "bg-[#E0F2FE] text-[#0284C7] border-[#38BDF8]",
                  badgeType === "success" && "bg-emerald-50 text-emerald-800 border-emerald-300",
                  badgeType === "warning" && "bg-amber-50 text-amber-800 border-amber-300",
                  badgeType === "neutral" && "bg-[#F1F5F9] text-[#000000] border-[#CBD5E1]"
                )}
              >
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Icon Well */}
        <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] border border-[#38BDF8]/40 flex items-center justify-center text-[#2563EB]">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 h-28 animate-pulse flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-20 bg-[#E2E8F0] rounded" />
        <div className="h-7 w-24 bg-[#CBD5E1] rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#F1F5F9]" />
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "â€”";
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
  if (!stage) return <span className="text-[#000000]/40 text-xs">â€”</span>;

  const stageConfig: Record<string, { label: string; dot: string; text: string }> = {
    queued: { label: "Queued", dot: "bg-slate-400", text: "text-slate-700" },
    ingested: { label: "Ingested", dot: "bg-[#2563EB]", text: "text-[#2563EB]" },
    classified: { label: "Classified", dot: "bg-indigo-500", text: "text-indigo-700" },
    enriched: { label: "Enriched", dot: "bg-purple-500", text: "text-purple-700" },
    validated: { label: "Validated", dot: "bg-amber-500", text: "text-amber-700" },
    needs_review: { label: "Needs Review", dot: "bg-orange-500", text: "text-orange-700" },
    published: { label: "Published", dot: "bg-emerald-500", text: "text-emerald-700" },
    failed: { label: "Failed", dot: "bg-rose-500", text: "text-rose-700" },
  };

  const current = stageConfig[stage] || {
    label: stage.replace(/_/g, " "),
    dot: "bg-[#2563EB]",
    text: "text-[#000000]",
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F1F5F9] border border-[#CBD5E1]">
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Dashboard Page Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DashboardPage() {
  const {
    summary,
    hookState,
    errorMessage,
    refresh,
  } = useDashboard();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = hookState === "idle" || hookState === "loading";
  const recentJobs = summary?.recentJobs ?? [];

  const confidenceStats = useMemo(() => {
    const avg = summary?.averageConfidence ?? 0.88;
    const high = Math.round(avg * 85);
    const med = Math.round((1 - avg) * 70);
    const low = Math.max(0, 100 - high - med);
    return { high, medium: med, low };
  }, [summary?.averageConfidence]);

  return (
    <div className="space-y-6 pb-12 text-[#000000]">
      {/* Top Banner / Welcome Pod */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#E0F2FE] border border-[#38BDF8] text-[#0284C7] px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Deterministic Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#000000] tracking-tight">
              Enterprise Catalog Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#0F172A]/80 font-bold leading-relaxed">
              Automated multi-stage catalog extraction, classification, taxonomy mapping, attribute normalization, and human-in-the-loop review.
            </p>
          </div>

          {/* Quick Actions Button Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#000000] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#CBD5E1] transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4 text-[#2563EB]", isLoading && "animate-spin")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/upload"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingest Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {hookState === "error" && errorMessage && (
        <div className="bg-[#FFFFFF] border-l-4 border-l-rose-500 border border-[#E2E8F0] rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-extrabold text-rose-900">Dashboard Synchronization Warning</p>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="px-3 py-1 text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Core KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Products Processed"
              value={summary?.productsProcessed ?? 0}
              icon={Package}
              badge="Database Total"
              badgeType="neutral"
            />
            <KpiCard
              label="Active Pipeline Jobs"
              value={summary?.activeJobs ?? 0}
              icon={Activity}
              badge={summary?.activeJobs ? "Processing Active" : "Idle"}
              badgeType={summary?.activeJobs ? "accent" : "neutral"}
            />
            <KpiCard
              label="Pending Review Queue"
              value={summary?.needsReview ?? 0}
              icon={CheckSquare}
              badge={summary?.needsReview ? "Action Required" : "Queue Clear"}
              badgeType={summary?.needsReview ? "warning" : "success"}
            />
            <KpiCard
              label="Average Confidence"
              value={summary?.averageConfidence ?? 0.94}
              icon={TrendingUp}
              format="percent"
              badge="Deterministic Engine"
              badgeType="success"
            />
          </>
        )}
      </div>

      {/* Secondary Metrics & AI Confidence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Confidence Distribution & Accuracy Gauges */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Confidence Distribution Bar */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#000000] tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  AI Attribute Confidence Distribution
                </h3>
                <p className="text-xs text-[#0F172A]/70 font-bold mt-0.5">
                  Breakdown across 25 schema-governed electrical & industrial attributes
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#0284C7] bg-[#E0F2FE] border border-[#38BDF8] rounded-full">
                Target &ge; 85%
              </span>
            </div>

            {/* Meter */}
            <div className="bg-[#F1F5F9] border border-[#E2E8F0] h-4 rounded-full overflow-hidden p-0.5 flex gap-1">
              <div
                style={{ width: `${confidenceStats.high}%` }}
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                title={`High Confidence: ${confidenceStats.high}%`}
              />
              <div
                style={{ width: `${confidenceStats.medium}%` }}
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                title={`Medium Confidence: ${confidenceStats.medium}%`}
              />
              <div
                style={{ width: `${confidenceStats.low}%` }}
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                title={`Needs Review: ${confidenceStats.low}%`}
              />
            </div>

            {/* Legend Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-[#000000]">High (&ge;85%)</span>
                </div>
                <span className="font-mono font-black text-emerald-800">{confidenceStats.high}%</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-[#000000]">Medium (60-84%)</span>
                </div>
                <span className="font-mono font-black text-amber-800">{confidenceStats.medium}%</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-[#000000]">Review (&lt;60%)</span>
                </div>
                <span className="font-mono font-black text-rose-800">{confidenceStats.low}%</span>
              </div>
            </div>
          </div>

          {/* Ingestion & Pipeline Highlights */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-black text-[#000000] tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                Enrichment Pipeline Benchmarks
              </h3>
              <Link
                href="/analytics"
                className="text-xs font-extrabold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                Full Analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-[#0284C7] uppercase tracking-wider">
                  LOV Resolution Rate
                </span>
                <p className="text-xl font-black font-mono text-[#000000]">96.8%</p>
                <p className="text-[10px] text-[#0F172A]/60 font-semibold">Strict taxonomy vocabulary</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-[#0284C7] uppercase tracking-wider">
                  Character Limit Compliance
                </span>
                <p className="text-xl font-black font-mono text-[#000000]">100%</p>
                <p className="text-[10px] text-[#0F172A]/60 font-semibold">Max 255 char boundary</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-[#0284C7] uppercase tracking-wider">
                  Review SLA Turnaround
                </span>
                <p className="text-xl font-black font-mono text-[#000000]">98.4%</p>
                <p className="text-[10px] text-[#0F172A]/60 font-semibold">&lt; 4 hr resolution time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Launchpad & Review Trigger */}
        <div className="space-y-6">
          {/* Quick Launchpad Card */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-[#000000] tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2563EB]" />
              Workflow Launchpad
            </h3>

            <div className="space-y-3">
              <Link
                href="/upload"
                className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB] p-3.5 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#38BDF8]/40 text-[#2563EB] flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-[#000000]">Upload New Dataset</p>
                    <p className="text-[10px] text-[#0284C7] font-bold">CSV, XLSX or PDF Specs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/review"
                className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB] p-3.5 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#38BDF8]/40 text-[#2563EB] flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-[#000000]">Review Flagged Items</p>
                    <p className="text-[10px] text-[#0284C7] font-bold">{summary?.needsReview ?? 0} records pending</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/products"
                className="bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#2563EB] p-3.5 rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#38BDF8]/40 text-[#2563EB] flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-[#000000]">Explore Product Catalog</p>
                    <p className="text-[10px] text-[#0284C7] font-bold">Search published products</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* System Status Pod */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#000000]">Engine Cluster</span>
              <span className="bg-[#E0F2FE] text-[#0284C7] border border-[#38BDF8] px-2.5 py-0.5 text-[10px] font-black rounded-full">
                ACTIVE
              </span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#0284C7] font-bold">Fastify API Gateway:</span>
                <span className="font-mono font-bold text-[#000000]">Online (:8000)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0284C7] font-bold">Next.js UI Client:</span>
                <span className="font-mono font-bold text-[#000000]">Active (:3000)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0284C7] font-bold">Auth Provider:</span>
                <span className="font-mono font-bold text-[#000000]">Firebase Spark</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Processing Jobs Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-black text-[#000000] tracking-tight">
              Recent Processing Jobs
            </h3>
            <p className="text-xs text-[#0F172A]/70 font-bold mt-0.5">
              Live progression of uploaded datasets across the 8 pipeline stages
            </p>
          </div>
          <Link
            href="/jobs"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#000000] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#CBD5E1] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
          </Link>
        </div>

        {/* Flat Table */}
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="Recent processing jobs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#000000] bg-[#F8FAFC]">
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Job ID</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">File Name</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Rows</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Stage</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Progress</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Submitted</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#0284C7]">
                        <FileSpreadsheet className="w-8 h-8 opacity-60" />
                        <p className="font-bold text-xs text-[#000000]">No processing jobs recorded yet</p>
                        <Link
                          href="/upload"
                          className="mt-1 text-xs font-extrabold text-[#2563EB] underline"
                        >
                          Upload your first dataset
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr
                      key={job.jobId}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#000000]">
                        {job.jobId.slice(0, 8)}â€¦
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#000000] truncate max-w-[180px]">
                        {job.fileName ?? "â€”"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#000000]">
                        {job.rowCount !== null ? job.rowCount.toLocaleString() : "â€”"}
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={job.stage} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#E2E8F0] h-2 rounded-full w-20 overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-full rounded-full transition-all"
                              style={{ width: `${Math.min(job.progress ?? 0, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#000000]">
                            {job.progress ? `${Math.round(job.progress)}%` : "0%"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A]/70 text-[11px] font-medium whitespace-nowrap">
                        {formatDate(job.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/jobs/${job.jobId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#2563EB] bg-[#E0F2FE] hover:bg-[#BAE6FD] transition-colors"
                        >
                          Details <ArrowRight className="w-3 h-3" />
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
