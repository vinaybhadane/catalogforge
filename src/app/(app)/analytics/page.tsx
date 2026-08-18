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

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = hookState === "idle" || hookState === "loading";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Neumorphic Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3386E7] text-white rounded-xl flex items-center justify-center text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#000000] tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-xs text-[#64748B] font-bold mt-0.5">
                Evaluation metrics from the enrichment pipeline compared against ground-truth benchmarks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#000000] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#64748B] ${isLoading ? "animate-spin" : ""}`} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Top-level error */}
      {hookState === "error" && errorMessage && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load analytics data.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Summary Cards */}
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
              sublabel: "Values in approved vocab",
            },
            {
              label: "Char Compliance",
              value: analytics.characterComplianceRate,
              sublabel: "Within field limits",
            },
            {
              label: "Mfr Match Rate",
              value: analytics.manufacturerMatchRate,
              sublabel: "Name resolved",
            },
            {
              label: "Review SLA",
              value: analytics.reviewQueueSla,
              sublabel: "Resolved within SLA",
            },
          ].map((metric) => {
            const pct =
              metric.value !== null ? Math.round(metric.value * 100) : null;
            const textColor =
              pct === null
                ? "text-[#000000]/50"
                : pct >= 85
                ? "text-emerald-700"
                : pct >= 60
                ? "text-amber-800"
                : "text-rose-700";

            return (
              <div
                key={metric.label}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-4"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  {metric.label}
                </p>
                <p
                  className={`text-2xl font-black mt-1 font-mono ${textColor}`}
                >
                  {pct !== null ? `${pct}%` : "â€”"}
                </p>
                <p className="text-[10px] text-[#000000]/60 font-semibold mt-1 leading-tight">
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
              className="bg-white border border-[#E2E8F0] rounded-2xl h-24"
            />
          ))}
        </div>
      )}

      {/* Live Accuracy Scoreboard */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <LiveScoreboard
          analytics={analytics}
          hookState={hookState}
          errorMessage={errorMessage}
          lastRefreshedAt={lastRefreshedAt}
          onRefresh={refresh}
        />
      </div>

      {/* Evaluation Charts */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="text-sm font-extrabold text-[#000000] mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#64748B]" />
          Evaluation Charts
        </h2>
        <AnalyticsCharts analytics={analytics} isLoading={isLoading} />
      </div>

      {/* Empty state */}
      {!isLoading && !analytics && hookState === "success" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] rounded-xl text-[#64748B] flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-[#000000]">
            No analytics data available
          </h3>
          <p className="text-xs text-[#64748B] font-bold max-w-sm mx-auto">
            Analytics will appear once processing/evaluation data is available.
          </p>
        </div>
      )}
    </div>
  );
}
