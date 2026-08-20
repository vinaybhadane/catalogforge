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
  if (value === null) return <span className="text-xs text-[#000000]/50">Not reported</span>;
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 bg-[#F1F5F9] h-2.5 rounded-full w-24 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-[#2563EB] to-indigo-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-[#000000] shrink-0">
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#000000] tracking-tight">
                Pipeline Processing Jobs
              </h1>
              <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                Track row-level pipeline stage progression from ingestion to publish.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadJobs(page)}
              className="bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#000000]"
            >
              <RefreshCw className={cn("w-4 h-4 text-[#2563EB]", fetchState === "loading" && "animate-spin")} />
              <span>Refresh</span>
            </button>
            <Link
              href="/upload"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-sm transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>New Upload</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load processing jobs.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Table or Empty State */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        {fetchState === "loading" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-black uppercase text-slate-500 tracking-wider">
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
              <tbody className="divide-y divide-[#F1F5F9]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : jobs.length === 0 ? (
          /* Clean Initial State for New Users */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
              <Activity className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#000000]">No Ingestion Jobs Yet</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                You have not submitted any dataset files or batch enrichment jobs in your workspace. Upload your first CSV or XLSX file to trigger the 8-stage pipeline.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/upload"
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Dataset File</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-black uppercase text-slate-500 tracking-wider">
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
              <tbody className="divide-y divide-[#F1F5F9]">
                {jobs.map((job) => {
                  const jobId = job.jobId || (job as any).id || "job";
                  const stage = job.stage || (job as any).currentStage || "ingested";
                  const progress = job.progress ?? (job as any).progressPercentage ?? 100;
                  const rowCount = job.rowCount ?? (job as any).totalRows ?? "—";
                  const createdAt = job.submittedAt || (job as any).createdAt || null;

                  return (
                    <tr key={jobId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#000000]">
                        <Link
                          href={`/jobs/${jobId}`}
                          className="hover:text-[#2563EB] transition-colors"
                        >
                          {truncateJobId(jobId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {job.fileName || "Raw Ingest File"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {rowCount}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StageBadge stage={stage} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar value={progress} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/jobs/${jobId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
