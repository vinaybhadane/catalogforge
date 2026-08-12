"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  Clock,
  Hash,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ProcessingJob } from "@/types";
import { PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Helpers
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

function truncateJobId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

// ─────────────────────────────────────────────────────────────
// Stage & Status Badge Helpers
// ─────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: string | null }) {
  if (!stage) return <span className="text-slate-400 text-xs">—</span>;
  const colors: Record<string, string> = {
    queued:       "bg-slate-100 text-slate-600",
    ingested:     "bg-blue-50 text-blue-700",
    classified:   "bg-indigo-50 text-indigo-700",
    enriched:     "bg-purple-50 text-purple-700",
    validated:    "bg-amber-50 text-amber-700",
    needs_review: "bg-orange-50 text-orange-700",
    published:    "bg-emerald-50 text-emerald-700",
    failed:       "bg-red-50 text-red-700",
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

function ProgressBar({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-slate-400">Not reported</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20 overflow-hidden">
        <div
          className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-700 shrink-0">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton rows
// ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-200 rounded w-full max-w-[90%]" />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────

type FetchState = "loading" | "success" | "error";

export default function JobsPage() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const loadJobs = async (p: number) => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const res = await apiClient.get<PaginatedResponse<ProcessingJob>>(
        "/ingestion/jobs",
        { params: { page: p, pageSize: 20 } }
      );
      setJobs(res.items);
      setTotalPages(res.totalPages);
      setFetchState("success");
    } catch (err) {
      // Graceful empty state when backend not yet connected
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")
      ) {
        setJobs([]);
        setTotalPages(null);
        setFetchState("success");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to load processing jobs."
        );
        setFetchState("error");
      }
    }
  };

  useEffect(() => {
    loadJobs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Processing Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track row-level pipeline stage progression from ingestion to publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadJobs(page)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            New Upload
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load processing jobs.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => loadJobs(page)}
            className="text-xs text-red-700 hover:text-red-900 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Processing jobs list">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {[
                  "Job ID",
                  "File",
                  "Rows",
                  "Stage",
                  "Progress",
                  "Status",
                  "Created",
                  "Updated",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {fetchState === "loading" && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {fetchState === "success" && jobs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No processing jobs yet
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Upload a dataset to create a new ingestion job.
                      </p>
                      <Link
                        href="/upload"
                        className="mt-1 px-4 py-2 text-xs font-semibold bg-[#1D4ED8] text-white rounded-lg hover:bg-[#1E40AF] transition-colors"
                      >
                        Upload Data
                      </Link>
                    </div>
                  </td>
                </tr>
              )}

              {fetchState === "success" &&
                jobs.map((job) => (
                  <tr
                    key={job.jobId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Job ID */}
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs text-slate-600"
                        title={job.jobId}
                      >
                        {truncateJobId(job.jobId)}
                      </span>
                    </td>

                    {/* File */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-800 truncate max-w-[140px]">
                          {job.fileName ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Rows */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-700">
                        {job.rowCount !== null
                          ? job.rowCount.toLocaleString()
                          : "—"}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <StageBadge stage={job.stage} />
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3 min-w-[130px]">
                      <ProgressBar value={job.progress} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-700 capitalize">
                        {job.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(job.submittedAt)}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(job.completedAt)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${job.jobId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors"
                      >
                        View
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {fetchState === "success" && jobs.length > 0 && (
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
