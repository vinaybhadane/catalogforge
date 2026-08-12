"use client";

import React, { useEffect } from "react";
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LiveScoreboard } from "@/components/analytics/LiveScoreboard";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export default function AnalyticsPage() {
  const { analytics, hookState, errorMessage, lastRefreshedAt, refresh } =
    useAnalytics();

  // Initial load on mount
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = hookState === "idle" || hookState === "loading";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluation metrics from the enrichment pipeline compared against ground-truth data.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Section 39: Top-level error */}
      {hookState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load analytics data.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-red-700 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section 33: Metric Summary Cards — from API only */}
      {!isLoading && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Field Accuracy",
              value: analytics.fieldLevelAccuracy,
              sublabel: "vs. 200-row ground truth",
            },
            {
              label: "LOV Resolution",
              value: analytics.lovResolutionRate,
              sublabel: "Values resolved in approved vocab",
            },
            {
              label: "Char Compliance",
              value: analytics.characterComplianceRate,
              sublabel: "Within field char limits",
            },
            {
              label: "Mfr Match Rate",
              value: analytics.manufacturerMatchRate,
              sublabel: "Manufacturer name resolved",
            },
            {
              label: "Review SLA",
              value: analytics.reviewQueueSla,
              sublabel: "Queue resolved within SLA",
            },
          ].map((metric) => {
            const pct =
              metric.value !== null ? Math.round(metric.value * 100) : null;
            const textColor =
              pct === null
                ? "text-slate-400"
                : pct >= 85
                ? "text-[#047857]"
                : pct >= 60
                ? "text-[#B45309]"
                : "text-[#B91C1C]";

            return (
              <div
                key={metric.label}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
                <p
                  className={`text-2xl font-extrabold mt-1 font-mono ${textColor}`}
                >
                  {pct !== null ? `${pct}%` : "—"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  {metric.sublabel}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading skeleton for metric cards */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-xl h-24"
            />
          ))}
        </div>
      )}

      {/* Section 35: Live Accuracy Scoreboard */}
      <LiveScoreboard
        analytics={analytics}
        hookState={hookState}
        errorMessage={errorMessage}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={refresh}
      />

      {/* Section 34: Charts */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#1D4ED8]" />
          Evaluation Charts
        </h2>
        <AnalyticsCharts analytics={analytics} isLoading={isLoading} />
      </div>

      {/* Section 37: Empty state */}
      {!isLoading && !analytics && hookState === "success" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">
            No analytics data available
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Analytics will appear once processing/evaluation data is available.
          </p>
        </div>
      )}
    </div>
  );
}
