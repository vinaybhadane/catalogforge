"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { AccuracyDataPoint } from "@/hooks/useAnalytics";
import { AnalyticsDetail } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Section 38 — Chart Skeletons
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
// Accessible Chart Wrapper — Section 34
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
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
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
// Section 34: Accuracy Time-Series Line Chart
// ─────────────────────────────────────────────────────────────

function AccuracyLineChart({ data }: { data: AccuracyDataPoint[] }) {
  const formatted = data.map((d) => ({
    ts: new Date(d.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    accuracy: d.accuracy !== null ? Math.round(d.accuracy * 100) : null,
    lovResolution: d.lovResolution !== null ? Math.round(d.lovResolution * 100) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="ts" tick={{ fontSize: 10, fill: "#94A3B8" }} />
        <YAxis
          tick={{ fontSize: 10, fill: "#94A3B8" }}
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
          name="Field Accuracy"
          stroke="#1D4ED8"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="lovResolution"
          name="LOV Resolution"
          stroke="#047857"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────
// Section 34: Progress Bar visuals for rates
// ─────────────────────────────────────────────────────────────

function RateProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) {
  const pct = value !== null ? Math.round(value * 100) : null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className={cn("font-mono font-bold", pct === null ? "text-slate-400 italic" : "")}>
          {pct !== null ? `${pct}%` : "Not available"}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
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

/**
 * Analytics chart suite — Section 34.
 * Uses Recharts with accessible text summaries per Section 34 guidance.
 * Never renders fake data — shows empty/unavailable states when API has no data.
 */
export function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const hasTimeSeries =
    analytics?.accuracyTimeSeries && analytics.accuracyTimeSeries.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Section 34: Accuracy Line Chart */}
      <ChartPanel
        title="Field Accuracy Over Time"
        description="Field-level accuracy and LOV resolution rate trends."
        isEmpty={isLoading || !hasTimeSeries}
        emptyMessage={
          isLoading
            ? "Loading chart…"
            : "Accuracy chart — Data unavailable until evaluation data is loaded."
        }
      >
        {isLoading ? (
          <ChartSkeleton height={200} />
        ) : hasTimeSeries ? (
          <AccuracyLineChart data={analytics!.accuracyTimeSeries} />
        ) : null}
      </ChartPanel>

      {/* Section 34: LOV Resolution + Character Compliance Progress Bars */}
      <ChartPanel
        title="Resolution & Compliance Rates"
        description="LOV vocabulary resolution rate and character-limit compliance."
        isEmpty={isLoading || !analytics}
        emptyMessage={
          isLoading
            ? "Loading chart…"
            : "Resolution chart — Data unavailable until evaluation data is loaded."
        }
      >
        {isLoading ? (
          <ChartSkeleton height={200} />
        ) : analytics ? (
          <div className="space-y-4 pt-2">
            <RateProgressBar
              label="LOV Resolution Rate"
              value={analytics.lovResolutionRate}
              color="#1D4ED8"
            />
            <RateProgressBar
              label="Character-Limit Compliance"
              value={analytics.characterComplianceRate}
              color="#047857"
            />
            <RateProgressBar
              label="Manufacturer Match Rate"
              value={analytics.manufacturerMatchRate}
              color="#7C3AED"
            />
            <RateProgressBar
              label="Review Queue SLA"
              value={analytics.reviewQueueSla}
              color="#B45309"
            />
          </div>
        ) : null}
      </ChartPanel>
    </div>
  );
}
