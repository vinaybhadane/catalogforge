"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Pencil,
  Zap,
  FileSearch,
} from "lucide-react";
import { useAuditLogs, AuditEvent, AuditAction } from "@/hooks/useAuditLogs";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ActionBadge({ action }: { action: AuditAction }) {
  const cfg: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    auto_publish: {
      cls: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <Zap className="w-3 h-3" />,
      label: "Auto Published",
    },
    approved: {
      cls: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Approved",
    },
    corrected: {
      cls: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <Pencil className="w-3 h-3" />,
      label: "Corrected",
    },
    rejected: {
      cls: "bg-red-50 border-red-200 text-red-800",
      icon: <XCircle className="w-3 h-3" />,
      label: "Rejected",
    },
  };
  const c = cfg[action] ?? {
    cls: "bg-slate-50 border-slate-200 text-slate-700",
    icon: null,
    label: action,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide",
        c.cls
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function ConfidenceCell({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-[11px] text-slate-400 italic">—</span>;
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "text-[11px] font-mono font-bold",
        pct >= 85 ? "text-[#047857]" : pct >= 60 ? "text-[#B45309]" : "text-[#B91C1C]"
      )}
    >
      {pct}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Expandable Row Detail — Section 36
// ─────────────────────────────────────────────────────────────

function ExpandedDetail({ event }: { event: AuditEvent }) {
  return (
    <tr>
      <td colSpan={8} className="px-4 pb-4 bg-[#F8FAFC]">
        <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-4 mt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source Snippet */}
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Source Snippet
              </p>
              {event.sourceSnippet ? (
                <blockquote className="text-xs text-slate-700 bg-blue-50 border border-blue-200 rounded-lg p-3 leading-relaxed italic">
                  {event.sourceSnippet}
                </blockquote>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No source snippet recorded.
                </p>
              )}
            </div>

            {/* Previous Value */}
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Previous Value
              </p>
              {event.previousValue !== null ? (
                <code className="text-xs bg-red-50 border border-red-200 text-red-900 px-2 py-1.5 rounded block break-all">
                  {event.previousValue}
                </code>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No previous value recorded.
                </p>
              )}
            </div>

            {/* Final Value */}
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Final Value
              </p>
              {event.finalValue !== null ? (
                <code className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-1.5 rounded block break-all">
                  {event.finalValue}
                </code>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No final value recorded.
                </p>
              )}
            </div>
          </div>

          {/* Validation Flags */}
          {event.validationFlags.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Validation Flags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {event.validationFlags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-800"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Table Row
// ─────────────────────────────────────────────────────────────

function AuditRow({ event }: { event: AuditEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand toggle */}
        <td className="pl-3 pr-1 py-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </td>

        {/* Timestamp */}
        <td className="px-3 py-3 whitespace-nowrap text-[11px] text-slate-500">
          {formatDate(event.timestamp)}
        </td>

        {/* Product ID */}
        <td className="px-3 py-3">
          <span className="font-mono text-[11px] text-slate-700">
            {event.productId}
          </span>
        </td>

        {/* Field */}
        <td className="px-3 py-3">
          <span className="font-mono text-[11px] text-slate-600 uppercase">
            {event.fieldName}
          </span>
        </td>

        {/* Generated Value */}
        <td className="px-3 py-3 max-w-[180px]">
          <span className="text-[11px] text-slate-800 truncate block">
            {event.generatedValue ?? (
              <span className="text-slate-400 italic">—</span>
            )}
          </span>
        </td>

        {/* Confidence */}
        <td className="px-3 py-3">
          <ConfidenceCell value={event.confidence} />
        </td>

        {/* Validation Flags count */}
        <td className="px-3 py-3">
          {event.validationFlags.length > 0 ? (
            <span className="text-[11px] font-bold text-amber-700">
              {event.validationFlags.length} flag{event.validationFlags.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">—</span>
          )}
        </td>

        {/* Reviewer */}
        <td className="px-3 py-3">
          <span className="text-[11px] text-slate-600">
            {event.reviewer ?? <span className="text-slate-400 italic">—</span>}
          </span>
        </td>

        {/* Action */}
        <td className="px-3 py-3">
          <ActionBadge action={event.action} />
        </td>
      </tr>

      {/* Expandable detail — Section 36 */}
      {expanded && <ExpandedDetail event={event} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="pl-3 py-3">
        <div className="w-4 h-4 bg-slate-200 rounded" />
      </td>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-slate-200 rounded w-4/5" />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Audit Page
// ─────────────────────────────────────────────────────────────

export default function AuditPage() {
  const {
    events,
    hookState,
    errorMessage,
    page,
    totalPages,
    total,
    setPage,
    refresh,
  } = useAuditLogs(25);

  const isLoading = hookState === "idle" || hookState === "loading";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Field-level enrichment decisions, reviewer actions, and pipeline outcomes.
            {total !== null && (
              <span className="ml-1 font-semibold text-slate-700">
                {total.toLocaleString()} events total.
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {hookState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load audit events.</p>
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

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Audit log events">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th scope="col" className="pl-3 py-3 w-8" aria-label="Expand" />
                {[
                  "Timestamp",
                  "Product ID",
                  "Field",
                  "Generated Value",
                  "Confidence",
                  "Flags",
                  "Reviewer",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {/* Loading skeletons — Section 38 */}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {/* Section 37: Empty state */}
              {!isLoading && events.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No audit events available.
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Audit events are recorded when the enrichment pipeline processes rows and reviewers take actions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!isLoading &&
                events.map((event) => (
                  <AuditRow key={event.auditId} event={event} />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — Section 36: server-paginated */}
        {!isLoading && events.length > 0 && (
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ""}
              {total !== null ? ` · ${total.toLocaleString()} total events` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
