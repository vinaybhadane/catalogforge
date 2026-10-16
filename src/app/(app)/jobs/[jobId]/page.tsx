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
  Package,
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

interface MetaCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function MetaCard({ label, value, icon: Icon }: MetaCardProps) {
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-3 hover:border-[#111111]/20 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] text-[#111111] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#686868] uppercase tracking-wider truncate">
          {label}
        </p>
        <div className="text-sm font-bold text-[#171717] mt-0.5 font-mono truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

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
    { label: "Total Rows",    value: rowStats.total,       color: "text-[#171717]" },
    { label: "Ingested",      value: rowStats.ingested,    color: "text-[#111111]" },
    { label: "Classified",    value: rowStats.classified,  color: "text-slate-700" },
    { label: "Enriched",      value: rowStats.enriched,    color: "text-slate-700" },
    { label: "Validated",     value: rowStats.validated,   color: "text-emerald-700" },
    { label: "Published",     value: rowStats.published,   color: "text-emerald-700" },
    { label: "Needs Review",  value: rowStats.needsReview, color: "text-amber-700" },
    { label: "Failed",        value: rowStats.failed,      color: "text-red-700" },
  ];

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="px-5 py-4 border-b border-[#EAEAEA] bg-[#FAFAFA] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
          Row-Level Status Distribution
        </h3>
        <span className="text-[11px] font-medium text-[#686868]">Live Telemetry</span>
      </div>
      <table className="w-full text-sm" aria-label="Row status distribution">
        <thead>
          <tr className="border-b border-[#EAEAEA]">
            <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-[#929292] uppercase">Status</th>
            <th scope="col" className="px-5 py-3 text-right text-[11px] font-semibold text-[#929292] uppercase">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAEAEA]">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-[#F7F7F7]/60 transition-colors">
              <td className="px-5 py-2.5 text-xs font-medium text-[#171717]">
                {row.label}
              </td>
              <td className={cn("px-5 py-2.5 text-right text-xs font-mono font-bold", row.color)}>
                {row.value !== null ? row.value.toLocaleString() : (
                  <span className="text-[#929292] font-normal">Not reported</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-[#EAEAEA] bg-[#FAFAFA]">
        <p className="text-[11px] text-[#686868] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#929292]" />
          Row counts are API-sourced and continuously reconciled during pipeline execution.
        </p>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl border border-[#EAEAEA]" />
        ))}
      </div>
      <div className="h-80 bg-slate-100 rounded-2xl border border-[#EAEAEA]" />
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId ?? null;

  const { jobStatus, hookState, errorMessage, refresh } = useJobStatus(jobId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#686868] hover:text-[#111111] transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Pipeline Jobs
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
              Job Execution Detail
            </h1>
            {jobId && (
              <p className="text-xs font-mono text-[#686868] mt-1 flex items-center gap-2">
                <span>Execution ID:</span>
                <span className="bg-[#F7F7F7] border border-[#EAEAEA] px-2 py-0.5 rounded-md text-[#111111] font-semibold">{jobId}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={refresh}
              disabled={hookState === "loading"}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EAEAEA] text-[#171717] text-xs font-bold rounded-full hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", hookState === "loading" && "animate-spin")} />
              Refresh
            </button>

            <Link
              href="/products"
              className="flex items-center gap-2 px-5 py-2 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full shadow-[0_2px_8px_rgba(200,255,0,0.25)] transition-all transform active:scale-95"
            >
              <Package className="w-3.5 h-3.5" />
              View Ingested Products
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {hookState === "loading" && !jobStatus && <JobDetailSkeleton />}

      {/* Error State */}
      {hookState === "error" && errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load job status.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-red-700 hover:text-red-900 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Not Found */}
      {hookState === "not_found" && (
        <div className="bg-white border border-[#EAEAEA] rounded-3xl p-12 text-center shadow-sm">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111111]">Job execution not found</h3>
          <p className="text-xs text-[#686868] mt-1">
            The requested job ID does not exist or has been removed from telemetry logs.
          </p>
        </div>
      )}

      {/* Live job data */}
      {jobStatus && (
        <>
          {/* Live indicator */}
          {hookState === "loading" && (
            <div className="flex items-center gap-2 text-xs text-[#111111] font-semibold bg-[#FAFAFA] border border-[#EAEAEA] px-3 py-1.5 rounded-full w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#111111]" />
              Refreshing pipeline telemetry…
            </div>
          )}

          {/* Metadata Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetaCard
              label="Source File"
              value={jobStatus.fileName ?? "—"}
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
              label="Submitted At"
              value={formatDate(jobStatus.submittedAt)}
              icon={Clock}
            />
            <MetaCard
              label="Completed At"
              value={formatDate(jobStatus.completedAt)}
              icon={Activity}
            />
          </div>

          {/* Current Stage + Progress Banner */}
          {jobStatus.stage && (
            <div
              className={cn(
                "p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all",
                jobStatus.stage === "failed"
                  ? "bg-red-50 border-red-200"
                  : jobStatus.stage === "published"
                  ? "bg-[#111111] text-white border-[#111111]"
                  : jobStatus.stage === "needs_review"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-[#111111] text-white border-[#111111]"
              )}
            >
              <div>
                <p className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  jobStatus.stage === "published" || (jobStatus.stage !== "failed" && jobStatus.stage !== "needs_review")
                    ? "text-[#929292]"
                    : "text-slate-600"
                )}>
                  Current Stage Progression
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    jobStatus.stage === "failed"
                      ? "bg-red-500"
                      : jobStatus.stage === "published"
                      ? "bg-[#C8FF00]"
                      : "bg-[#C8FF00] animate-pulse"
                  )} />
                  <p className={cn(
                    "text-lg font-bold capitalize",
                    jobStatus.stage === "published" || (jobStatus.stage !== "failed" && jobStatus.stage !== "needs_review")
                      ? "text-white"
                      : "text-slate-900"
                  )}>
                    {jobStatus.stage.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {jobStatus.progress !== null && (
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={cn(
                    "text-2xl font-black font-mono",
                    jobStatus.stage === "published" || (jobStatus.stage !== "failed" && jobStatus.stage !== "needs_review")
                      ? "text-[#C8FF00]"
                      : "text-[#111111]"
                  )}>
                    {jobStatus.progress.toFixed(0)}%
                  </span>
                  <div className="w-36 bg-white/20 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        jobStatus.stage === "failed"
                          ? "bg-red-500"
                          : "bg-[#C8FF00]"
                      )}
                      style={{ width: `${Math.min(jobStatus.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Two-column layout: Pipeline Stepper + Row Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineStageStepper
              currentStage={jobStatus.stage}
              jobStatus={jobStatus.status}
            />

            <RowStatsPanel rowStats={jobStatus.rowStats} />
          </div>

          {/* Catalog Products CTA */}
          <div className="p-6 rounded-3xl bg-[#111111] text-white border border-[#191919] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8FF00] mb-1 inline-block">
                Catalog Ready
              </span>
              <h3 className="font-bold text-white text-base">
                Dataset Products Normalized & Ready
              </h3>
              <p className="text-xs text-[#929292] mt-0.5 max-w-xl">
                Processed industrial records are taxonomically classified, OEM source-grounded, and indexed in the Product Master.
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full shadow-[0_2px_8px_rgba(200,255,0,0.25)] transition-all transform active:scale-95 shrink-0"
            >
              <Package className="w-4 h-4" />
              Explore Products
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
