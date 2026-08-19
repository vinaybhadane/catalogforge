"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import { AccuracyDataPoint, AnalyticsDetail } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-slate-100 animate-pulse"
      style={{ height }}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Accessible Chart Wrapper
// ─────────────────────────────────────────────────────────────

function ChartPanel({
  title,
  description,
  children,
  isEmpty,
  emptyMessage,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-[#000000]">{title}</h3>
        <p className="text-[11px] text-[#64748B] mt-0.5">{description}</p>
      </div>
      {isEmpty ? (
        <div
          className="flex items-center justify-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 italic"
          style={{ height: 180 }}
        >
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Accuracy Time-Series Line Chart
// ─────────────────────────────────────────────────────────────

function AccuracyLineChart({ data }: { data: AccuracyDataPoint[] }) {
  const formatted = data.map((d) => ({
    ts: new Date(d.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    accuracy: d.accuracy !== null ? Math.round(d.accuracy * 100) : null,
    lovResolution: d.lovResolution !== null ? Math.round(d.lovResolution * 100) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="ts" tick={{ fontSize: 10, fill: "#64748B" }} />
        <YAxis
          tick={{ fontSize: 10, fill: "#64748B" }}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value) => [value != null ? `${value}%` : "—"]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="accuracy"
          name="AI Confidence Rate"
          stroke="#2563EB"
          strokeWidth={2.5}
          dot={{ r: 4 }}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="lovResolution"
          name="LOV Taxonomies"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────
// Top Manufacturers Bar Chart
// ─────────────────────────────────────────────────────────────

function TopManufacturersChart({ data }: { data: Array<{ manufacturer: string; count: number; avgConfidence: number }> }) {
  const formatted = data.slice(0, 6).map((d) => ({
    name: d.manufacturer.length > 18 ? `${d.manufacturer.substring(0, 16)}…` : d.manufacturer,
    count: d.count,
    avgConfidence: Math.round(d.avgConfidence * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748B" }} interval={0} angle={-15} textAnchor="end" />
        <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }}
          formatter={(val, name) => [val, name === "count" ? "Total Products" : "Avg Confidence"]}
        />
        <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]}>
          {formatted.map((_, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? "#1D4ED8" : index === 1 ? "#2563EB" : "#3B82F6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────
// Rate Progress Bar
// ─────────────────────────────────────────────────────────────

function RateProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null | undefined;
  color: string;
}) {
  const pct = value !== null && value !== undefined ? Math.round(value * 100) : null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#0F172A] font-semibold">{label}</span>
        <span className={cn("font-mono font-bold", pct === null ? "text-slate-400 italic" : "text-[#000000]")}>
          {pct !== null ? `${pct}%` : "Not available"}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        {pct !== null ? (
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-slate-200 rounded-full" />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main AnalyticsCharts Export
// ─────────────────────────────────────────────────────────────

interface AnalyticsChartsProps {
  analytics: AnalyticsDetail | null;
  isLoading: boolean;
}

export function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const hasTimeSeries =
    analytics?.accuracyTimeSeries && analytics.accuracyTimeSeries.length > 0;
  const hasTopMfg =
    analytics?.topManufacturers && analytics.topManufacturers.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Real Time-Series Trend */}
        <ChartPanel
          title="Catalog Enrichment & Accuracy Trend"
          description="Real-time AI confidence score and LOV taxonomy resolution from live catalog database."
          isEmpty={isLoading || !hasTimeSeries}
          emptyMessage={
            isLoading ? "Loading metrics…" : "Real-time chart data unavailable."
          }
        >
          {isLoading ? (
            <ChartSkeleton height={220} />
          ) : hasTimeSeries ? (
            <AccuracyLineChart data={analytics!.accuracyTimeSeries} />
          ) : null}
        </ChartPanel>

        {/* Real Top Manufacturers Distribution */}
        <ChartPanel
          title="Top Manufacturers Catalog Volume"
          description="Product count distribution by verified manufacturer from Azure SQL database."
          isEmpty={isLoading || !hasTopMfg}
          emptyMessage={
            isLoading ? "Loading manufacturers…" : "Manufacturer data unavailable."
          }
        >
          {isLoading ? (
            <ChartSkeleton height={220} />
          ) : hasTopMfg ? (
            <TopManufacturersChart data={analytics!.topManufacturers!} />
          ) : null}
        </ChartPanel>
      </div>

      {/* Compliance and Quality Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartPanel
          title="Taxonomy & Compliance Rates"
          description="Live LOV vocabulary resolution rate, character-limit compliance, and name resolution."
          isEmpty={isLoading || !analytics}
          emptyMessage={
            isLoading ? "Loading compliance…" : "Compliance data unavailable."
          }
        >
          {isLoading ? (
            <ChartSkeleton height={200} />
          ) : analytics ? (
            <div className="space-y-3.5 pt-1">
              <RateProgressBar
                label="LOV Taxonomy Resolution Rate"
                value={analytics.lovResolutionRate}
                color="#2563EB"
              />
              <RateProgressBar
                label="Character-Limit Compliance (≤150 chars)"
                value={analytics.characterComplianceRate}
                color="#059669"
              />
              <RateProgressBar
                label="Manufacturer Name Match Rate"
                value={analytics.manufacturerMatchRate}
                color="#7C3AED"
              />
              <RateProgressBar
                label="Critical Field Completeness Rate"
                value={analytics.fieldLevelAccuracy}
                color="#D97706"
              />
            </div>
          ) : null}
        </ChartPanel>

        {/* Real Confidence Score Distribution */}
        <ChartPanel
          title="AI Confidence Distribution"
          description="Distribution of products by AI validation confidence threshold."
          isEmpty={isLoading || !analytics}
          emptyMessage={
            isLoading ? "Loading distribution…" : "Distribution data unavailable."
          }
        >
          {isLoading ? (
            <ChartSkeleton height={200} />
          ) : analytics ? (
            <div className="space-y-4 pt-1">
              {(analytics.confidenceDistribution || [
                { range: "High (≥85%)", count: analytics.publishedProducts || 0, color: "#10B981" },
                { range: "Medium (60-84%)", count: analytics.pendingReview || 0, color: "#F59E0B" },
                { range: "Low (<60%)", count: analytics.rejectedProducts || 0, color: "#EF4444" },
              ]).map((bin) => {
                const total = analytics.totalProducts || 1;
                const pct = Math.round((bin.count / total) * 100);
                return (
                  <div key={bin.range} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#0F172A]">{bin.range}</span>
                      <span className="font-mono font-bold text-[#000000]">
                        {bin.count.toLocaleString()} products ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: bin.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </ChartPanel>
      </div>
    </div>
  );
}
