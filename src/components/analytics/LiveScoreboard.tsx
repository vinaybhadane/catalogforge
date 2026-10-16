"use client";

import React from "react";
import {
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";
import { AnalyticsDetail } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface LiveScoreboardProps {
  analytics: AnalyticsDetail | null;
  hookState: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
  lastRefreshedAt: Date | null;
  onRefresh: () => void;
}

function formatTs(d: Date | null): string {
  if (!d) return "Never";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const pct = value !== null ? Math.round(value * 100) : null;
  const color =
    pct === null
      ? "bg-slate-200"
      : pct >= 85
      ? "bg-[#111111]"
      : pct >= 60
      ? "bg-amber-600"
      : "bg-rose-600";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#171717]">{label}</span>
        <span
          className={cn(
            "font-mono font-bold",
            pct === null
              ? "text-[#929292] italic"
              : pct >= 85
              ? "text-[#111111]"
              : pct >= 60
              ? "text-amber-700"
              : "text-rose-700"
          )}
        >
          {pct !== null ? `${pct}%` : "Not available"}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#F7F7F7] border border-[#EAEAEA] overflow-hidden">
        {pct !== null ? (
          <div
            className={cn("h-full rounded-full transition-all duration-700", color)}
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-slate-200 rounded-full" />
        )}
      </div>
    </div>
  );
}

export function LiveScoreboard({
  analytics,
  hookState,
  errorMessage,
  lastRefreshedAt,
  onRefresh,
}: LiveScoreboardProps) {
  const isLoading = hookState === "loading" || hookState === "idle";

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#EAEAEA] bg-[#FAFAFA] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#111111]">Live Accuracy & Precision Scoreboard</h2>
            <p className="text-[11px] text-[#686868] font-medium">Reconciled against verified ground truth benchmarks.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#929292] font-mono">
            Synced: <span className="text-[#111111] font-bold">{formatTs(lastRefreshedAt)}</span>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-[#171717] bg-white border border-[#EAEAEA] rounded-full hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-[#111111]", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Loading evaluation state */}
        {isLoading && !analytics && (
          <div className="flex items-center gap-2 text-sm text-[#686868] py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
            Loading evaluation metrics…
          </div>
        )}

        {/* Error state */}
        {hookState === "error" && errorMessage && (
          <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Unable to refresh evaluation</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {hookState === "success" && !analytics && (
          <div className="py-8 text-center text-[#686868]">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#929292]" />
            <p className="text-sm font-medium">Analytics will appear once processing and evaluation data is available.</p>
          </div>
        )}

        {/* Evaluation Scope Metadata */}
        {analytics && (
          <>
            {(analytics.evaluationScope || analytics.rowsEvaluated !== null || analytics.groundTruthRows !== null) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {analytics.evaluationScope && (
                  <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#EAEAEA]">
                    <p className="text-[10px] text-[#929292] uppercase font-bold tracking-wider">Evaluation Scope</p>
                    <p className="text-sm font-bold text-[#111111] mt-1">{analytics.evaluationScope}</p>
                  </div>
                )}
                {analytics.rowsEvaluated !== null && (
                  <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#EAEAEA]">
                    <p className="text-[10px] text-[#929292] uppercase font-bold tracking-wider">Rows Evaluated</p>
                    <p className="text-base font-extrabold text-[#111111] mt-1 font-mono">{analytics.rowsEvaluated.toLocaleString()}</p>
                  </div>
                )}
                {analytics.groundTruthRows !== null && (
                  <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#EAEAEA]">
                    <p className="text-[10px] text-[#929292] uppercase font-bold tracking-wider">Ground Truth Rows</p>
                    <p className="text-base font-extrabold text-[#111111] mt-1 font-mono">{analytics.groundTruthRows.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* 5 Metric Bars — all values strictly from API */}
            <div className="space-y-4 pt-1">
              <MetricBar label="Field-Level Accuracy vs. Ground Truth" value={analytics.fieldLevelAccuracy} />
              <MetricBar label="LOV Vocabulary Resolution Rate" value={analytics.lovResolutionRate} />
              <MetricBar label="Character-Limit Taxonomy Compliance" value={analytics.characterComplianceRate} />
              <MetricBar label="Manufacturer Authority Match Rate" value={analytics.manufacturerMatchRate} />
              <MetricBar label="Review Queue Resolution SLA" value={analytics.reviewQueueSla} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
