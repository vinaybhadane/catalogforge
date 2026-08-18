"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckSquare,
  Clock,
  Hash,
  Activity,
  ArrowRight,
  Info,
} from "lucide-react";
import { useJobStatus } from "@/hooks/useJobStatus";
import { PipelineStageStepper } from "@/components/jobs/PipelineStageStepper";
import { cn } from "@/lib/utils";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Not yet";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Metadata Summary Card
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MetaCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function MetaCard({ label, value, icon: Icon }: MetaCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
          {value}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Row Stats Table
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface RowStatsProps {
  rowStats: {
    total: number | null;
    ingested: number | null;
    classified: number | null;
    enriched: number | null;
    validated: number | null;
    published: number | null;
    needsReview: number | null;
    failed: number | null;
  };
}

function RowStatsPanel({ rowStats }: RowStatsProps) {
  const rows = [
    { label: "Total Rows",    value: rowStats.total,       color: "text-slate-900" },
    { label: "Ingested",      value: rowStats.ingested,    color: "text-blue-700" },
    { label: "Classified",    value: rowStats.classified,  color: "text-indigo-700" },
    { label: "Enriched",      value: rowStats.enriched,    color: "text-purple-700" },
    { label: "Validated",     value: rowStats.validated,   color: "text-amber-700" },
    { label: "Published",     value: rowStats.published,   color: "text-emerald-700" },
    { label: "Needs Review",  value: rowStats.needsReview, color: "text-orange-700" },
    { label: "Failed",        value: rowStats.failed,      color: "text-red-700" },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Row-Level Status Distribution
        </h3>
      </div>
      <table className="w-full text-sm" aria-label="Row status distribution">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase">Status</th>
            <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-400 uppercase">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-slate-50/60">
              <td className="px-4 py-2.5 text-xs font-medium text-slate-700">
                {row.label}
              </td>
              <td className={cn("px-4 py-2.5 text-right text-xs font-mono font-bold", row.color)}>
                {row.value !== null ? row.value.toLocaleString() : (
                  <span className="text-slate-400 font-normal">Not reported</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-[#F1F5F9] bg-slate-50">
        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Row counts are API-sourced and may update during active processing.
        </p>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Skeleton Loader
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function JobDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-slate-200 rounded-xl" />
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Page Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId ?? null;

  const { jobStatus, hookState, errorMessage, refresh } = useJobStatus(jobId);

  const showReviewLink =
    jobStatus?.stage === "needs_review" ||
    (jobStatus?.rowStats?.needsReview !== null &&
      (jobStatus?.rowStats?.needsReview ?? 0) > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1D4ED8] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Processing Jobs
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Job Detail
            </h1>
            {jobId && (
              <p className="text-xs font-mono text-slate-500 mt-1">
                ID: {jobId}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={hookState === "loading"}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", hookState === "loading" && "animate-spin")} />
              Refresh
            </button>

            {showReviewLink && (
              <Link
                href="/review"
                className="flex items-center gap-2 px-4 py-2 bg-[#B45309] hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Open Review Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {hookState === "loading" && !jobStatus && <JobDetailSkeleton />}

      {/* Error State */}
      {hookState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load job status.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-red-700 hover:text-red-900 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Not Found */}
      {hookState === "not_found" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Job not found</h3>
          <p className="text-xs text-slate-500 mt-1">
            The requested job ID does not exist or has been removed.
          </p>
        </div>
      )}

      {/* Live job data */}
      {jobStatus && (
        <>
          {/* Live indicator */}
          {hookState === "loading" && (
            <div className="flex items-center gap-1.5 text-xs text-[#1D4ED8] font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Refreshing statusâ€¦
            </div>
          )}

          {/* Metadata Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetaCard
              label="File"
              value={jobStatus.fileName ?? "â€”"}
              icon={FileSpreadsheet}
            />
            <MetaCard
              label="Total Rows"
              value={
                jobStatus.rowCount !== null
                  ? jobStatus.rowCount.toLocaleString()
                  : "Not reported"
              }
              icon={Hash}
            />
            <MetaCard
              label="Submitted"
              value={formatDate(jobStatus.submittedAt)}
              icon={Clock}
            />
            <MetaCard
              label="Completed"
              value={formatDate(jobStatus.completedAt)}
              icon={Activity}
            />
          </div>

          {/* Current Stage + Progress Banner */}
          {jobStatus.stage && (
            <div
              className={cn(
                "p-4 rounded-xl border flex items-center justify-between gap-4",
                jobStatus.stage === "failed"
                  ? "bg-red-50 border-red-200"
                  : jobStatus.stage === "published"
                  ? "bg-emerald-50 border-emerald-200"
                  : jobStatus.stage === "needs_review"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-blue-50 border-blue-200"
              )}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Current Pipeline Stage
                </p>
                <p className="text-lg font-bold text-slate-900 capitalize mt-0.5">
                  {jobStatus.stage.replace(/_/g, " ")}
                </p>
              </div>

              {jobStatus.progress !== null && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-2xl font-extrabold text-[#1D4ED8] font-mono">
                    {jobStatus.progress.toFixed(0)}%
                  </span>
                  <div className="w-32 bg-white/70 rounded-full h-2 overflow-hidden border border-blue-200">
                    <div
                      className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(jobStatus.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Two-column layout: Pipeline Stepper + Row Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 19.2 / 20 â€” Pipeline Stage Stepper */}
            <PipelineStageStepper
              currentStage={jobStatus.stage}
              jobStatus={jobStatus.status}
            />

            {/* Row-level status breakdown */}
            <RowStatsPanel rowStats={jobStatus.rowStats} />
          </div>

          {/* Review Studio CTA if rows need attention */}
          {showReviewLink && (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  Human Review Required
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  One or more rows have been routed to the Review Studio for manual validation.
                </p>
              </div>
              <Link
                href="/review"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B45309] hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
              >
                <CheckSquare className="w-4 h-4" />
                Open Review Studio
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
