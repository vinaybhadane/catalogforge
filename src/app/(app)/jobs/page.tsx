"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  CheckCircle2,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ProcessingJob, PaginatedResponse } from "@/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserWorkspaceData } from "@/lib/auth/workspace-guard";
import { cn } from "@/lib/utils";

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

function StageBadge({ stage }: { stage: string | null }) {
  if (!stage) return <span className="text-[#000000]/40 text-xs">—</span>;

  const stageConfig: Record<string, { label: string; dot: string; text: string }> = {
    queued: { label: "Queued", dot: "bg-slate-400", text: "text-slate-700" },
    ingested: { label: "Ingested", dot: "bg-[#6D8196]", text: "text-[#64748B]" },
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
    text: "text-[#000000]",
  };

  return (
    <span className="border rounded-full bg-[#F8FAFC] inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{current.label}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-[#8E8E8E]">Not reported</span>;
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 bg-[#F2F2F2] h-2 rounded-full w-24 overflow-hidden p-0.5">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-[#171717] shrink-0">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-[#EAEAEA] rounded-full w-full max-w-[90%]" />
        </td>
      ))}
    </tr>
  );
}

type FetchState = "loading" | "success" | "error";

export default function JobsPage() {
  const { user, isSharedMember } = useAuth();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const loadJobs = useCallback(
    async (p: number) => {
      setFetchState("loading");
      setErrorMessage(null);

      // Standalone new user workspace isolation
      if (user && !isSharedMember) {
        try {
          const userWorkspace = getUserWorkspaceData(user.uid || user.email);
          setJobs(userWorkspace.jobs || []);
          setTotalPages(1);
          setFetchState("success");
        } catch {
          setErrorMessage("Unable to load private jobs list.");
          setFetchState("error");
        }
        return;
      }

      // Shared Organization Jobs for Admin & Invited Team Members
      try {
        const res = await apiClient.get<PaginatedResponse<ProcessingJob>>("/ingestion/jobs", {
          params: { page: p, pageSize: 20 },
        });
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
          setErrorMessage(err instanceof Error ? err.message : "Unable to load processing jobs.");
          setFetchState("error");
        }
      }
    },
    [user, isSharedMember]
  );

  useEffect(() => {
    loadJobs(page);
  }, [page, loadJobs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                Pipeline Processing Jobs
              </h1>
              <p className="text-xs sm:text-sm text-[#686868] mt-0.5 font-normal">
                Track row-level pipeline stage progression from ingestion to publish.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadJobs(page)}
              className="bg-white border border-[#EAEAEA] rounded-full hover:bg-[#F7F7F7] transition-all flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#171717] shadow-sm active:scale-95"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-[#171717]", fetchState === "loading" && "animate-spin")} />
              <span>Refresh</span>
            </button>
            <Link
              href="/upload"
              className="bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] rounded-full flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.2]" />
              <span>New Upload</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load processing jobs.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Table or Empty State */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        {fetchState === "loading" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFB] border-b border-[#EAEAEA] text-[10px] font-bold uppercase text-[#686868] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Job ID</th>
                  <th className="px-4 py-3.5">Source File</th>
                  <th className="px-4 py-3.5">Total Rows</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Started At</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : jobs.length === 0 ? (
          /* Clean Initial State for New Users */
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center mx-auto shadow-sm">
              <Activity className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-extrabold text-[#171717]">No Ingestion Jobs Yet</h3>
              <p className="text-xs text-[#686868] leading-relaxed">
                You have not submitted any dataset files or batch enrichment jobs in your workspace. Upload your first CSV or XLSX file to trigger the 8-stage pipeline.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/upload"
                className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <UploadCloud className="w-4 h-4 stroke-[2.2]" />
                <span>Upload Dataset File</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFB] border-b border-[#EAEAEA] text-[10px] font-bold uppercase text-[#686868] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Job ID</th>
                  <th className="px-4 py-3.5">Source File</th>
                  <th className="px-4 py-3.5">Total Rows</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Started At</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {jobs.map((job) => {
                  const jobId = job.jobId || (job as any).id || "job";
                  const stage = job.stage || (job as any).currentStage || "ingested";
                  const progress = job.progress ?? (job as any).progressPercentage ?? 100;
                  const rowCount = job.rowCount ?? (job as any).totalRows ?? "—";
                  const createdAt = job.submittedAt || (job as any).createdAt || null;

                  return (
                    <tr key={jobId} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#171717]">
                        <Link
                          href={`/jobs/${jobId}`}
                          className="hover:text-black hover:underline transition-colors"
                        >
                          {truncateJobId(jobId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#171717]">
                        {job.fileName || "Raw Ingest File"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#171717]">
                        {rowCount}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          job.status === "completed"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-[#F2F2F2] text-[#171717] border border-[#EAEAEA]"
                        )}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StageBadge stage={stage} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar value={progress} />
                      </td>
                      <td className="px-4 py-3.5 text-[#8E8E8E] font-mono text-[11px]">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/jobs/${jobId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
