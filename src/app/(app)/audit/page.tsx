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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      cls: "text-emerald-800 border-emerald-200 bg-emerald-50",
      icon: <Zap className="w-3 h-3 text-emerald-600" />,
      label: "Auto Published",
    },
    approved: {
      cls: "text-[#111111] border-[#EAEAEA] bg-[#F7F7F7]",
      icon: <CheckCircle2 className="w-3 h-3 text-[#111111]" />,
      label: "Approved",
    },
    corrected: {
      cls: "text-amber-800 border-amber-200 bg-amber-50",
      icon: <Pencil className="w-3 h-3 text-amber-600" />,
      label: "Corrected",
    },
    rejected: {
      cls: "text-rose-800 border-rose-200 bg-rose-50",
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
      label: "Rejected",
    },
  };
  const c = cfg[action] ?? {
    cls: "text-[#171717] border-[#EAEAEA] bg-[#FAFAFA]",
    icon: null,
    label: action,
  };
  return (
    <span
      className={cn(
        "border inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
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
    return <span className="text-[11px] text-[#929292] italic">—</span>;
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border bg-white",
        pct >= 85
          ? "text-emerald-700 border-emerald-200 bg-emerald-50"
          : pct >= 60
          ? "text-amber-800 border-amber-200 bg-amber-50"
          : "text-rose-700 border-rose-200 bg-rose-50"
      )}
    >
      {pct}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Expandable Row Detail
// ─────────────────────────────────────────────────────────────

function ExpandedDetail({ event }: { event: AuditEvent }) {
  return (
    <tr>
      <td colSpan={9} className="px-4 py-3 bg-[#F7F7F7]/60">
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 space-y-3.5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-[#929292] uppercase text-[10px] tracking-wider block mb-1">
                Field Context:
              </span>
              <p className="font-mono font-bold text-[#111111]">{event.fieldName}</p>
            </div>

            <div>
              <span className="font-bold text-[#929292] uppercase text-[10px] tracking-wider block mb-1">
                Reviewer / Actor:
              </span>
              <p className="text-[#171717] font-medium">
                {event.reviewer ?? "Automated Enrichment Engine"}
              </p>
            </div>
          </div>

          {event.validationFlags.length > 0 && (
            <div>
              <span className="font-bold text-amber-800 block mb-1.5 text-xs">
                Validation Flags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.validationFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[10px] font-bold"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="font-bold text-[#929292] uppercase text-[10px] tracking-wider block mb-1.5">
              Value Payload:
            </span>
            <pre className="p-3.5 bg-[#FAFAFA] rounded-xl text-[11px] font-mono text-[#111111] overflow-x-auto border border-[#EAEAEA]">
              {JSON.stringify(
                {
                  generatedValue: event.generatedValue,
                  confidence: event.confidence,
                  action: event.action,
                  timestamp: event.timestamp,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </td>
    </tr>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-[#F7F7F7]/70 transition-colors">
        {/* Expand toggle */}
        <td className="pl-4 py-3 w-8">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="bg-white border border-[#EAEAEA] rounded-full hover:bg-[#F7F7F7] p-1 text-[#686868] transition-colors"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </td>

        {/* Timestamp */}
        <td className="px-3.5 py-3 whitespace-nowrap text-[11px] font-medium text-[#171717]">
          {formatDate(event.timestamp)}
        </td>

        {/* Product ID */}
        <td className="px-3.5 py-3">
          <span className="font-mono text-[11px] font-bold text-[#111111]">
            {event.productId}
          </span>
        </td>

        {/* Field */}
        <td className="px-3.5 py-3">
          <span className="font-mono text-[11px] font-bold text-[#686868] uppercase">
            {event.fieldName}
          </span>
        </td>

        {/* Generated Value */}
        <td className="px-3.5 py-3 max-w-[180px]">
          <span className="text-[11px] font-semibold text-[#171717] truncate block">
            {event.generatedValue ?? (
              <span className="text-[#929292] italic">—</span>
            )}
          </span>
        </td>

        {/* Confidence */}
        <td className="px-3.5 py-3">
          <ConfidenceCell value={event.confidence} />
        </td>

        {/* Validation Flags count */}
        <td className="px-3.5 py-3">
          {event.validationFlags.length > 0 ? (
            <span className="text-[11px] font-bold text-amber-800">
              {event.validationFlags.length} flag{event.validationFlags.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[11px] text-[#929292]">—</span>
          )}
        </td>

        {/* Reviewer */}
        <td className="px-3.5 py-3">
          <span className="text-[11px] font-medium text-[#171717]">
            {event.reviewer ?? <span className="text-[#929292] italic">—</span>}
          </span>
        </td>

        {/* Action */}
        <td className="px-3.5 py-3">
          <ActionBadge action={event.action} />
        </td>
      </tr>

      {/* Expandable detail */}
      {expanded && <ExpandedDetail event={event} />}
    </>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="pl-4 py-3.5">
        <div className="w-4 h-4 bg-slate-100 rounded-full" />
      </td>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-3.5 py-3.5">
          <div className="h-3 bg-slate-100 rounded-md w-4/5" />
        </td>
      ))}
    </tr>
  );
}

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shadow-sm shrink-0">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Audit & Governance
                </h1>
                {total !== null && (
                  <span className="bg-[#F7F7F7] border border-[#EAEAEA] text-[#111111] text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                    {total.toLocaleString()} events
                  </span>
                )}
              </div>
              <p className="text-xs text-[#686868] font-medium mt-1">
                Field-level enrichment decisions, reviewer verification actions, and pipeline provenance logs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#171717] disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#111111] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Log</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {hookState === "error" && errorMessage && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load audit events.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="bg-white border border-rose-200 rounded-full hover:bg-rose-50 transition-colors px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-[#EAEAEA]">
          <table className="w-full text-xs text-left" aria-label="Audit log events">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[#929292] bg-[#FAFAFA]">
                <th scope="col" className="pl-4 py-3.5 w-8" aria-label="Expand" />
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
                    className="px-3.5 py-3.5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

              {!isLoading && events.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] text-[#111111] flex items-center justify-center">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-[#111111]">
                        No audit events recorded yet
                      </p>
                      <p className="text-xs text-[#686868] max-w-sm">
                        Audit events are recorded when the enrichment pipeline processes rows and reviewers take actions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                events.map((event) => (
                  <AuditRow key={event.auditId} event={event} />
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && events.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#171717] font-semibold">
            <span className="text-[#686868]">
              Page <span className="font-bold text-[#111111]">{page}</span>
              {totalPages !== null ? ` of ${totalPages}` : ""}
              {total !== null ? ` · ${total.toLocaleString()} total events` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all px-4 py-1.5 rounded-full text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 transition-all px-4 py-1.5 rounded-full text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
