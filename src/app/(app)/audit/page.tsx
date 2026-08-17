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
      cls: "text-emerald-800 border-emerald-300",
      icon: <Zap className="w-3 h-3 text-emerald-600" />,
      label: "Auto Published",
    },
    approved: {
      cls: "text-[#6D8196] border-[#6D8196]",
      icon: <CheckCircle2 className="w-3 h-3 text-[#6D8196]" />,
      label: "Approved",
    },
    corrected: {
      cls: "text-amber-800 border-amber-300",
      icon: <Pencil className="w-3 h-3 text-amber-600" />,
      label: "Corrected",
    },
    rejected: {
      cls: "text-rose-800 border-rose-300",
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
      label: "Rejected",
    },
  };
  const c = cfg[action] ?? {
    cls: "text-[#4A4A4A] border-[#CBCBCB]",
    icon: null,
    label: action,
  };
  return (
    <span
      className={cn(
        "neu-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
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
    return <span className="text-[11px] text-[#4A4A4A]/40 italic">—</span>;
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full neu-pill",
        pct >= 85
          ? "text-emerald-700 border-emerald-300"
          : pct >= 60
          ? "text-amber-800 border-amber-300"
          : "text-rose-700 border-rose-300"
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
      <td colSpan={9} className="px-4 py-3 bg-[#DEE3E7]/50">
        <div className="neu-inset p-4 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-[#6D8196] block mb-1">
                Field Context:
              </span>
              <p className="font-mono text-[#4A4A4A]">{event.fieldName}</p>
            </div>

            <div>
              <span className="font-bold text-[#6D8196] block mb-1">
                Reviewer / Actor:
              </span>
              <p className="text-[#4A4A4A] font-medium">
                {event.reviewer ?? "Automated Enrichment Engine"}
              </p>
            </div>
          </div>

          {event.validationFlags.length > 0 && (
            <div>
              <span className="font-bold text-amber-800 block mb-1 text-xs">
                Validation Flags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.validationFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-md text-[10px] font-bold"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="font-bold text-[#6D8196] block mb-1 text-xs">
              Value Payload:
            </span>
            <pre className="p-3 bg-white/70 rounded-lg text-[11px] font-mono text-[#4A4A4A] overflow-x-auto border border-[#CBCBCB]/40">
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
      <tr className="hover:bg-[#FFFFE3]/40 transition-colors">
        {/* Expand toggle */}
        <td className="pl-3 py-3 w-8">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="neu-btn p-1 text-[#6D8196] rounded-md"
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
        <td className="px-3 py-3 whitespace-nowrap text-[11px] font-medium text-[#4A4A4A]">
          {formatDate(event.timestamp)}
        </td>

        {/* Product ID */}
        <td className="px-3 py-3">
          <span className="font-mono text-[11px] font-bold text-[#4A4A4A]">
            {event.productId}
          </span>
        </td>

        {/* Field */}
        <td className="px-3 py-3">
          <span className="font-mono text-[11px] font-bold text-[#6D8196] uppercase">
            {event.fieldName}
          </span>
        </td>

        {/* Generated Value */}
        <td className="px-3 py-3 max-w-[180px]">
          <span className="text-[11px] font-semibold text-[#4A4A4A] truncate block">
            {event.generatedValue ?? (
              <span className="text-[#4A4A4A]/40 italic">—</span>
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
            <span className="text-[11px] font-bold text-amber-800">
              {event.validationFlags.length} flag{event.validationFlags.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[11px] text-[#4A4A4A]/40">—</span>
          )}
        </td>

        {/* Reviewer */}
        <td className="px-3 py-3">
          <span className="text-[11px] font-medium text-[#4A4A4A]">
            {event.reviewer ?? <span className="text-[#4A4A4A]/40 italic">—</span>}
          </span>
        </td>

        {/* Action */}
        <td className="px-3 py-3">
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
      <td className="pl-3 py-3">
        <div className="w-4 h-4 bg-[#CBCBCB]/40 rounded" />
      </td>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-[#CBCBCB]/40 rounded w-4/5" />
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
      {/* Neumorphic Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">
                Audit Trail & Governance Log
              </h1>
              <p className="text-xs text-[#6D8196] font-bold mt-0.5">
                Field-level enrichment decisions, reviewer actions, and pipeline outcomes.
                {total !== null && (
                  <span className="ml-1 font-extrabold text-[#4A4A4A]">
                    ({total.toLocaleString()} total events)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="neu-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#4A4A4A] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#6D8196] ${isLoading ? "animate-spin" : ""}`} />
            Refresh Log
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {hookState === "error" && errorMessage && (
        <div className="neu-card rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load audit events.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="neu-btn px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Neumorphic Table */}
      <div className="neu-card rounded-2xl p-5 space-y-4">
        <div className="neu-inset rounded-xl overflow-hidden p-1">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-xs text-left" aria-label="Audit log events">
              <thead>
                <tr className="border-b border-[#CBCBCB]/40 text-[#4A4A4A] bg-[#E2E6E9]/60">
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
                      className="px-3 py-3 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBCBCB]/30">
                {isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {!isLoading && events.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl neu-icon-well text-[#6D8196] flex items-center justify-center">
                          <ClipboardList className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-extrabold text-[#4A4A4A]">
                          No audit events available
                        </p>
                        <p className="text-xs text-[#6D8196] font-bold max-w-xs">
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
        </div>

        {!isLoading && events.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#4A4A4A] font-bold">
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
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
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
