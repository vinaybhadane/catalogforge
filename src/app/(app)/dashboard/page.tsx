"use client";

import React, { useEffect } from "react";
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
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "percent";
  color: string;
}

function KpiCard({ label, value, icon: Icon, format = "number", color }: KpiCardProps) {
  const formatted =
    value === null
      ? "—"
      : format === "percent"
      ? `${Math.round(value * 100)}%`
      : value.toLocaleString();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className={cn("text-2xl font-extrabold mt-1.5 font-mono", value === null ? "text-slate-400" : color)}>
            {formatted}
          </p>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-opacity-10`, "bg-slate-100")}>
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return <div className="bg-slate-100 rounded-xl h-24 animate-pulse" />;
}

// ─────────────────────────────────────────────────────────────
// Recent Jobs Table — Section 14
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
  if (!stage) return <span className="text-slate-400 text-xs">—</span>;
  const colors: Record<string, string> = {
    queued: "bg-slate-100 text-slate-600",
    ingested: "bg-blue-50 text-blue-700",
    classified: "bg-indigo-50 text-indigo-700",
    enriched: "bg-purple-50 text-purple-700",
    validated: "bg-amber-50 text-amber-700",
    needs_review: "bg-orange-50 text-orange-700",
    published: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide",
        colors[stage] ?? "bg-slate-100 text-slate-600"
      )}
    >
      {stage.replace(/_/g, " ")}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-200 rounded w-4/5" />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { summary, hookState, errorMessage, refresh } = useDashboard();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = hookState === "idle" || hookState === "loading";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of processing jobs, confidence metrics, and product enrichment queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Data
          </Link>
        </div>
      </div>

      {/* Error */}
      {hookState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load dashboard data.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button type="button" onClick={refresh} className="text-xs text-red-700 font-medium underline">
            Try again
          </button>
        </div>
      )}

      {/* KPI Cards — Section 14 */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard label="Products Processed" value={summary.productsProcessed} icon={Package} color="text-slate-900" />
          <KpiCard label="Active Jobs" value={summary.activeJobs} icon={Activity} color="text-[#1D4ED8]" />
          <KpiCard label="Needs Review" value={summary.needsReview} icon={CheckSquare} color="text-[#B45309]" />
          <KpiCard label="Published" value={summary.published} icon={CheckCircle2} color="text-[#047857]" />
          <KpiCard label="Avg Confidence" value={summary.averageConfidence} icon={TrendingUp} format="percent" color="text-[#1D4ED8]" />
        </div>
      )}

      {/* Empty state when backend not connected */}
      {!isLoading && !summary && hookState === "success" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No processing data yet.</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Upload a dataset to begin structured product enrichment and validation.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Data
          </Link>
        </div>
      )}

      {/* Recent Jobs — Section 14 */}
      {!isLoading && summary && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Processing Jobs</h2>
            <Link href="/jobs" className="text-xs text-[#1D4ED8] hover:underline font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Recent processing jobs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["Job", "Input", "Rows", "Stage", "Progress", "Status", "Created", "Action"].map((col) => (
                    <th key={col} scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {summary.recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-500">
                      No recent jobs to display.
                    </td>
                  </tr>
                )}
                {summary.recentJobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{job.jobId.length > 12 ? `${job.jobId.slice(0, 12)}…` : job.jobId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-800 truncate max-w-[120px]">{job.fileName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{job.rowCount !== null ? job.rowCount.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3"><StageBadge stage={job.stage} /></td>
                    <td className="px-4 py-3">
                      {job.progress !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16 overflow-hidden">
                            <div className="bg-[#1D4ED8] h-full rounded-full" style={{ width: `${Math.min(job.progress, 100)}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-700">{job.progress.toFixed(0)}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700 capitalize">{job.status}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(job.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.jobId}`} className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
