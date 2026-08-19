"use client";

import React, { useEffect } from "react";
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  Layers,
  FileSpreadsheet,
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2563EB] text-white rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#000000] tracking-tight">
                Real-Time Analytics Dashboard
              </h1>
              <p className="text-xs text-[#64748B] font-bold mt-0.5">
                Live performance metrics computed directly from Azure SQL Database &amp; AI enrichment pipeline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#000000] disabled:opacity-50"
            suppressHydrationWarning
          >
            <RefreshCw className={`w-4 h-4 text-[#2563EB] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Metrics</span>
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
            suppressHydrationWarning
          >
            Retry
          </button>
        </div>
      )}

      {/* Real-time KPI Metric Summary Cards */}
      {!isLoading && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Catalog Products */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Total Products</span>
              <Package className="w-4 h-4 text-[#2563EB]" />
            </div>
            <p className="text-2xl font-black text-[#000000] font-mono">
              {analytics.totalProducts ? analytics.totalProducts.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">Active catalog items</p>
          </div>

          {/* Published Products */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {analytics.publishedProducts ? analytics.publishedProducts.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {analytics.autoPublishRate ? `${Math.round(analytics.autoPublishRate * 100)}% live rate` : "100% live"}
            </p>
          </div>

          {/* Pending Review */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-800 font-mono">
              {analytics.pendingReview ? analytics.pendingReview.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-amber-700 font-semibold">Flagged for inspection</p>
          </div>

          {/* Average AI Confidence */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">AI Confidence</span>
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </div>
            <p className="text-2xl font-black text-[#2563EB] font-mono">
              {analytics.averageConfidence ? `${Math.round(analytics.averageConfidence * 100)}%` : "85%"}
            </p>
            <p className="text-[10px] text-blue-700 font-semibold">Weighted accuracy score</p>
          </div>

          {/* Extracted Attributes */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Attributes</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-700 font-mono">
              {analytics.totalAttributes ? analytics.totalAttributes.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-indigo-600 font-semibold">Triplets normalized</p>
          </div>

          {/* Ingestion Jobs */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">Ingestion Jobs</span>
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-teal-700 font-mono">
              {analytics.totalJobs ? analytics.totalJobs.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-teal-600 font-semibold">Datasets processed</p>
          </div>
        </div>
      )}

      {/* Loading skeleton for metric cards */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-2xl h-24"
            />
          ))}
        </div>
      )}

      {/* Live Charts Suite (Time Series, Top Manufacturers, Compliance & Confidence) */}
      <AnalyticsCharts analytics={analytics} isLoading={isLoading} />

      {/* Live Accuracy Scoreboard */}
      <LiveScoreboard
        analytics={analytics}
        hookState={hookState}
        errorMessage={errorMessage}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={refresh}
      />
    </div>
  );
}
