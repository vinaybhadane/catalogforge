"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ReviewItem, PaginatedResponse, ReviewStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="text-[11px] text-slate-400 italic">Not available</span>
    );
  const pct = Math.round(score * 100);
  const cls =
    pct >= 85
      ? "confidence-high"
      : pct >= 60
      ? "confidence-medium"
      : "confidence-low";
  return (
    <span className={cn("text-[11px] font-bold font-mono px-1.5 py-0.5 rounded", cls)}>
      {pct}%
    </span>
  );
}

function StatusIcon({ status }: { status: ReviewStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4 text-amber-500" />;
    case "approved":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "edited":
      return <CheckSquare className="w-4 h-4 text-blue-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-slate-400" />;
  }
}

function SkeletonCard() {
  return (
    <div className="animate-pulse p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-1/4" />
    </div>
  );
}

type SortOption = "confidence_asc" | "newest" | "status";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "confidence_asc", label: "Lowest Confidence" },
  { value: "newest", label: "Newest" },
  { value: "status", label: "By Status" },
];

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("confidence_asc");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("pending");

  const loadQueue = async () => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const params: Record<string, string | number> = {
        sort,
        page: 1,
        pageSize: 50,
      };
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await apiClient.get<PaginatedResponse<ReviewItem>>(
        "/reviews",
        { params }
      );
      setItems(res.items);
      setFetchState("success");
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")
      ) {
        setItems([]);
        setFetchState("success");
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load review queue.");
        setFetchState("error");
      }
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, statusFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Review Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Human-in-the-loop validation for low-confidence enriched product records.
          </p>
        </div>
        <button
          type="button"
          onClick={loadQueue}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Queue
        </button>
      </div>

      {/* Filter & Sort Bar — Section 25 */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | "all")}
            className="text-xs border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="edited">Edited</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-order" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-order"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load review queue.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadQueue}
            className="text-xs text-red-700 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-3">
        {fetchState === "loading" && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {fetchState === "success" && items.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">
              No items require review
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              All processed records are currently above the confidence threshold or not yet available.
            </p>
          </div>
        )}

        {fetchState === "success" &&
          items.map((item) => (
            <div
              key={item.reviewId}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#CBD5E1] hover:shadow-md transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  <StatusIcon status={item.status} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-500">
                    Review ID: {item.reviewId}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Product: <span className="font-mono text-slate-700">{item.productId}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded",
                        item.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : item.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      )}
                    >
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Row confidence:
                    </span>
                    <ConfidenceBadge score={item.rowConfidence} />
                    <span className="text-[11px] text-slate-400">
                      {item.fields.length} field{item.fields.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/review/${item.reviewId}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm"
              >
                Open Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
