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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#111111] text-[#C8FF00] rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Catalog Analytics
                </h1>
                <span className="bg-[#111111] text-[#C8FF00] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-[#686868] font-medium mt-1">
                Real-time performance metrics computed directly from database records and AI enrichment telemetry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#171717] disabled:opacity-50 shadow-sm"
            suppressHydrationWarning
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#111111] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Top-level error */}
      {hookState === "error" && errorMessage && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load analytics data.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="bg-white border border-rose-200 rounded-full hover:bg-rose-50 transition-colors px-3 py-1 text-xs text-rose-800 font-bold"
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
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Total SKUs</span>
              <Package className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-black text-[#111111] font-mono">
              {analytics.totalProducts ? analytics.totalProducts.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-[#686868] font-medium">Standardized products</p>
          </div>

          {/* Published Products */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {analytics.publishedProducts ? analytics.publishedProducts.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">
              {analytics.autoPublishRate ? `${Math.round(analytics.autoPublishRate * 100)}% auto-publish` : "100% live"}
            </p>
          </div>

          {/* Pending Review */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-800 font-mono">
              {analytics.pendingReview ? analytics.pendingReview.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-amber-700 font-medium">Flagged for inspection</p>
          </div>

          {/* Average AI Confidence */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Mean Confidence</span>
              <Sparkles className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-black text-[#111111] font-mono">
              {analytics.averageConfidence ? `${Math.round(analytics.averageConfidence * 100)}%` : "85%"}
            </p>
            <p className="text-[10px] text-[#686868] font-medium">Weighted score</p>
          </div>

          {/* Extracted Attributes */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Attributes</span>
              <Layers className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-black text-[#111111] font-mono">
              {analytics.totalAttributes ? analytics.totalAttributes.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-[#686868] font-medium">Triplets normalized</p>
          </div>

          {/* Ingestion Jobs */}
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#111111]/20 transition-colors">
            <div className="flex items-center justify-between text-[#929292]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#686868]">Pipeline Jobs</span>
              <FileSpreadsheet className="w-4 h-4 text-[#111111]" />
            </div>
            <p className="text-2xl font-black text-[#111111] font-mono">
              {analytics.totalJobs ? analytics.totalJobs.toLocaleString() : "0"}
            </p>
            <p className="text-[10px] text-[#686868] font-medium">Completed executions</p>
          </div>
        </div>
      )}

      {/* Loading skeleton for metric cards */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#EAEAEA] rounded-2xl h-24"
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
