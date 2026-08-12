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
      ? "bg-[#047857]"
      : pct >= 60
      ? "bg-[#B45309]"
      : "bg-[#B91C1C]";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span
          className={cn(
            "font-mono font-bold",
            pct === null
              ? "text-slate-400 italic"
              : pct >= 85
              ? "text-[#047857]"
              : pct >= 60
              ? "text-[#B45309]"
              : "text-[#B91C1C]"
          )}
        >
          {pct !== null ? `${pct}%` : "Not available"}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
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

/**
 * LiveScoreboard — Section 35.
 * Refreshable scoreboard showing evaluation scope + metric bars.
 * Never uses fake animation to simulate accuracy — all values from API.
 */
export function LiveScoreboard({
  analytics,
  hookState,
  errorMessage,
  lastRefreshedAt,
  onRefresh,
}: LiveScoreboardProps) {
  const isLoading = hookState === "loading" || hookState === "idle";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1D4ED8]" />
          <h2 className="text-sm font-bold text-slate-900">Live Accuracy Scoreboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Last updated: <span className="text-slate-600 font-medium">{formatTs(lastRefreshedAt)}</span>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Loading evaluation state — Section 35 */}
        {isLoading && !analytics && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#1D4ED8]" />
            Loading evaluation…
          </div>
        )}

        {/* Error state — Section 35 */}
        {hookState === "error" && errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Unable to refresh evaluation</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Empty state — Section 37 Analytics */}
        {hookState === "success" && !analytics && (
          <div className="py-6 text-center text-slate-500">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Analytics will appear once processing/evaluation data is available.</p>
          </div>
        )}

        {/* Evaluation Scope Metadata */}
        {analytics && (
          <>
            {(analytics.evaluationScope || analytics.rowsEvaluated !== null || analytics.groundTruthRows !== null) && (
              <div className="grid grid-cols-3 gap-3">
                {analytics.evaluationScope && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Scope</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{analytics.evaluationScope}</p>
                  </div>
                )}
                {analytics.rowsEvaluated !== null && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Rows Evaluated</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{analytics.rowsEvaluated.toLocaleString()}</p>
                  </div>
                )}
                {analytics.groundTruthRows !== null && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Ground Truth Rows</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{analytics.groundTruthRows.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* 5 Metric Bars — all values strictly from API */}
            <div className="space-y-3">
              <MetricBar label="Field-Level Accuracy vs. Ground Truth" value={analytics.fieldLevelAccuracy} />
              <MetricBar label="LOV Resolution Rate" value={analytics.lovResolutionRate} />
              <MetricBar label="Character-Limit Compliance" value={analytics.characterComplianceRate} />
              <MetricBar label="Manufacturer Match Rate" value={analytics.manufacturerMatchRate} />
              <MetricBar label="Review Queue SLA" value={analytics.reviewQueueSla} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
