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
  if (!stage) return <span className="text-[#4A4A4A]/40 text-xs">—</span>;

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
    <span className="neu-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-[#4A4A4A]/50">Not reported</span>;
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 neu-inset-sm h-2.5 rounded-full w-24 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-[#6D8196] to-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-[#4A4A4A] shrink-0">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-[#CBCBCB]/40 rounded w-full max-w-[90%]" />
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Neumorphic Page Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">
                Processing Jobs
              </h1>
              <p className="text-xs text-[#6D8196] font-bold mt-0.5">
                Track row-level pipeline stage progression from ingestion to publish.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadJobs(page)}
              className="neu-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#4A4A4A]"
            >
              <RefreshCw className="w-4 h-4 text-[#6D8196]" />
              Refresh
            </button>
            <Link
              href="/upload"
              className="neu-btn-accent flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              <UploadCloud className="w-4 h-4" />
              New Upload
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="neu-card rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load processing jobs.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => loadJobs(page)}
            className="neu-btn px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Try again
          </button>
        </div>
      )}

      {/* Neumorphic Jobs Table */}
      <div className="neu-card rounded-2xl p-5 space-y-4">
        <div className="neu-inset rounded-xl overflow-hidden p-1">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-xs text-left" aria-label="Processing jobs list">
              <thead>
                <tr className="border-b border-[#CBCBCB]/40 text-[#4A4A4A] bg-[#E2E6E9]/60">
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
                      className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBCBCB]/30">
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
                        <div className="w-14 h-14 rounded-2xl neu-icon-well text-[#6D8196] flex items-center justify-center">
                          <Activity className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-extrabold text-[#4A4A4A]">
                          No processing jobs yet
                        </p>
                        <p className="text-xs text-[#6D8196] font-bold max-w-xs">
                          Upload a dataset to create a new ingestion job.
                        </p>
                        <Link
                          href="/upload"
                          className="mt-2 px-5 py-2.5 text-xs font-bold neu-btn-accent inline-flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          Upload Dataset
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {fetchState === "success" &&
                  jobs.map((job) => (
                    <tr
                      key={job.jobId}
                      className="hover:bg-[#FFFFE3]/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#4A4A4A]">
                        {truncateJobId(job.jobId)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md neu-icon-well flex items-center justify-center text-[#6D8196] shrink-0">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[#4A4A4A] truncate max-w-[140px]">
                            {job.fileName ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#4A4A4A]">
                        {job.rowCount !== null ? job.rowCount.toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={job.stage} />
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <ProgressBar value={job.progress} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="neu-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#4A4A4A]">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4A4A4A]/70 whitespace-nowrap text-[11px] font-medium">
                        {formatDate(job.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-[#4A4A4A]/70 whitespace-nowrap text-[11px] font-medium">
                        {formatDate(job.completedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/jobs/${job.jobId}`}
                          className="neu-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6D8196] hover:text-[#4A4A4A]"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {fetchState === "success" && jobs.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#4A4A4A] font-bold">
            <span>
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
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
