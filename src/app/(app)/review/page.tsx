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
  Filter,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ReviewItem, PaginatedResponse, ReviewStatus } from "@/types";
import { cn } from "@/lib/utils";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null)
    return (
      <span className="text-[11px] text-[#000000]/50 italic">Not available</span>
    );
  const pct = Math.round(score * 100);
  return (
    <span
      className={cn(
        "text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border rounded-full bg-[#F8FAFC]",
        pct >= 85
          ? "text-emerald-700 border-emerald-300"
          : pct >= 60
          ? "text-amber-800 border-amber-300"
          : "text-rose-700 border-rose-300"
      )}
    >
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
      return <XCircle className="w-4 h-4 text-rose-600" />;
    case "edited":
      return <CheckSquare className="w-4 h-4 text-[#64748B]" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-[#000000]/60" />;
  }
}

function SkeletonCard() {
  return (
    <div className="animate-pulse p-5 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
      <div className="h-4 bg-[#CBCBCB]/40 rounded w-1/3" />
      <div className="h-3 bg-[#CBCBCB]/40 rounded w-1/2" />
      <div className="h-3 bg-[#CBCBCB]/40 rounded w-1/4" />
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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Neumorphic Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3386E7] text-white rounded-xl flex items-center justify-center text-white">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#000000] tracking-tight">
                Review Studio
              </h1>
              <p className="text-xs text-[#64748B] font-bold mt-0.5">
                Human-in-the-loop validation for low-confidence enriched product records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadQueue}
            className="bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#000000]"
          >
            <RefreshCw className="w-4 h-4 text-[#64748B]" />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-xs font-bold text-[#000000] whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" /> Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | "all")}
              className="text-xs neu-input px-3 py-2 text-[#000000] bg-[#DCE1E5] font-bold cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="edited">Edited</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-xs font-bold text-[#000000] whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-order"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs neu-input px-3 py-2 text-[#000000] bg-[#DCE1E5] font-bold cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load review queue.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadQueue}
            className="bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-3.5">
        {fetchState === "loading" && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {fetchState === "success" && items.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] rounded-xl text-[#64748B] flex items-center justify-center mx-auto">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-extrabold text-[#000000]">
              No items require review
            </h3>
            <p className="text-xs text-[#64748B] font-bold max-w-xs mx-auto">
              All processed records are currently above the confidence threshold or not yet available.
            </p>
          </div>
        )}

        {fetchState === "success" &&
          items.map((item) => (
            <div
              key={item.reviewId}
              className="bg-white border border-[#E2E8F0] rounded-2xl bg-white border border-[#E2E8F0] rounded-2xl-interactive rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] rounded-xl flex items-center justify-center shrink-0">
                  <StatusIcon status={item.status} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-[#000000]">
                    Review ID: {item.reviewId}
                  </p>
                  <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                    Product: <span className="font-mono text-[#000000]">{item.productId}</span>
                  </p>
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border rounded-full bg-[#F8FAFC]",
                        item.status === "pending"
                          ? "text-amber-800 border-amber-300"
                          : item.status === "approved"
                          ? "text-emerald-800 border-emerald-300"
                          : item.status === "rejected"
                          ? "text-rose-800 border-rose-300"
                          : "text-[#64748B] border-[#6D8196]"
                      )}
                    >
                      {item.status}
                    </span>
                    <span className="text-[11px] text-[#000000]/60 font-bold">
                      Confidence:
                    </span>
                    <ConfidenceBadge score={item.rowConfidence} />
                    <span className="text-[11px] text-[#000000]/60 font-bold">
                      â€¢ {item.fields.length} field{item.fields.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/review/${item.reviewId}`}
                className="bg-[#3386E7] text-white rounded-xl flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
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
