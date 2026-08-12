"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckSquare,
  ExternalLink,
  Info,
  Pencil,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileSearch,
} from "lucide-react";
import { useReview } from "@/hooks/useReview";
import { useReviewKeyboardShortcuts } from "@/hooks/useReviewKeyboardShortcuts";
import { ReviewActionBar } from "@/components/review/ReviewActionBar";
import { ReviewField, EvidenceReference, LovMatch } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Section 29: ConfidenceBadge — never shows 0% for null
// ─────────────────────────────────────────────────────────────

function ConfidenceBadge({
  score,
  showProgress = false,
}: {
  score: number | null;
  showProgress?: boolean;
}) {
  if (score === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
        <Info className="w-3 h-3" />
        Not available
      </span>
    );
  }
  const pct = Math.round(score * 100);
  const { textCls, bgCls, borderCls, label } =
    pct >= 85
      ? { textCls: "text-[#047857]", bgCls: "bg-[#ECFDF5]", borderCls: "border-[#047857]", label: "High" }
      : pct >= 60
      ? { textCls: "text-[#B45309]", bgCls: "bg-[#FFFBEB]", borderCls: "border-[#B45309]", label: "Medium" }
      : { textCls: "text-[#B91C1C]", bgCls: "bg-[#FEF2F2]", borderCls: "border-[#B91C1C]", label: "Low" };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded border",
          textCls, bgCls, borderCls
        )}
      >
        {pct}% <span className="font-normal opacity-70">{label}</span>
      </span>
      {showProgress && (
        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full", pct >= 85 ? "bg-[#047857]" : pct >= 60 ? "bg-[#B45309]" : "bg-[#B91C1C]")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section 30: Validation Flag Chips
// ─────────────────────────────────────────────────────────────

const FLAG_STYLES: Record<string, string> = {
  OVER_CHAR_LIMIT:      "bg-red-50 text-red-700 border-red-200",
  NOT_IN_LOV:           "bg-amber-50 text-amber-700 border-amber-200",
  PLACEHOLDER_NOT_DATA: "bg-orange-50 text-orange-700 border-orange-200",
};

function ValidationFlagChip({ flag }: { flag: string }) {
  const cls = FLAG_STYLES[flag] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border leading-none",
        cls
      )}
      title={flag}
    >
      <AlertTriangle className="w-2.5 h-2.5" />
      {flag.replace(/_/g, " ")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Section 31: Character Counter
// ─────────────────────────────────────────────────────────────

function CharCounter({ current, limit }: { current: number; limit: number | null }) {
  if (limit === null) {
    return (
      <span className="text-[10px] text-slate-400 italic">
        Character limit not configured
      </span>
    );
  }
  const over = current > limit;
  return (
    <span className={cn("text-[10px] font-mono", over ? "text-[#B91C1C] font-bold" : "text-slate-500")}>
      {current} / {limit} chars{over && " — over limit"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Section 26: Editable Product Field Row
// ─────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: ReviewField;
  isActive: boolean;
  isEditing: boolean;
  actionState: "idle" | "saving" | "success" | "error";
  fieldError: string | null;
  onSelect: () => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onSave: (value: string) => void;
}

function FieldRow({
  field,
  isActive,
  isEditing,
  actionState,
  fieldError,
  onSelect,
  onEditStart,
  onEditCancel,
  onSave,
}: FieldRowProps) {
  const [editValue, setEditValue] = useState(field.generatedValue ?? "");
  const charLimit: number | null = null; // comes from backend schema in production

  useEffect(() => {
    if (isEditing) setEditValue(field.generatedValue ?? "");
  }, [isEditing, field.generatedValue]);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 border rounded-xl transition-all cursor-pointer",
        isActive
          ? "border-[#1D4ED8] bg-[#EFF6FF]"
          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
      )}
    >
      {/* Field Label */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          {field.fieldName}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">{field.label}</span>
      </div>

      {/* Generated / Edited Value */}
      {!isEditing ? (
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-sm font-semibold text-slate-900 break-words flex-1",
              !field.generatedValue && "text-slate-400 italic"
            )}
          >
            {field.generatedValue ?? "No value generated"}
          </p>
          {field.editable && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEditStart(); }}
              aria-label={`Edit field ${field.label} (E)`}
              className="p-1.5 text-slate-400 hover:text-[#1D4ED8] hover:bg-blue-50 rounded transition-colors shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-sm text-slate-900 border border-[#CBD5E1] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] resize-none"
            aria-label={`Edit value for ${field.label}`}
          />
          <div className="flex items-center justify-between">
            <CharCounter current={editValue.length} limit={charLimit} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEditCancel}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                aria-label="Cancel edit"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSave(editValue)}
                disabled={actionState === "saving"}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                aria-label="Save field value"
              >
                {actionState === "saving" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {actionState === "saving" ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          {fieldError && (
            <p className="text-xs text-[#B91C1C] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldError}
            </p>
          )}
        </div>
      )}

      {/* Confidence + Validation Flags */}
      <div className="mt-2 flex items-center flex-wrap gap-2">
        <ConfidenceBadge score={field.confidence} showProgress />
        {field.validationFlags.map((flag) => (
          <ValidationFlagChip key={flag} flag={flag} />
        ))}
        {actionState === "success" && (
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section 27 + 96: Evidence & LOV Right Panel
// ─────────────────────────────────────────────────────────────

function EvidencePanel({
  field,
}: {
  field: ReviewField | null;
}) {
  const [expanded, setExpanded] = useState(true);

  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
        <FileSearch className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">Select a field to view source evidence</p>
      </div>
    );
  }

  const evidence: EvidenceReference | null = field.evidence;
  const lovMatches: LovMatch[] = field.lovMatches;

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      {/* Field Context */}
      <div>
        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Inspecting
        </p>
        <p className="text-sm font-bold text-slate-900 mt-0.5">{field.label}</p>
        <p className="text-[11px] font-mono text-slate-500">{field.fieldName}</p>
      </div>

      {/* Source Evidence — Section 96 */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Source Evidence
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3">
            {evidence === null ? (
              /* Section 96 explicit missing state — never fabricate */
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                No source evidence returned for this field.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Source URL */}
                {evidence.sourceUrl && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                      Source
                    </p>
                    <a
                      href={evidence.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 break-all"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {evidence.sourceTitle ?? evidence.sourceUrl}
                    </a>
                  </div>
                )}

                {/* Evidence Snippet */}
                {evidence.sourceSnippet ? (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                      Excerpt
                    </p>
                    <blockquote className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-800 leading-relaxed italic">
                      {evidence.sourceSnippet}
                    </blockquote>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                    No source excerpt available.
                  </div>
                )}

                {/* Evidence Span */}
                {evidence.sourceSpan && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                      Highlighted Span
                    </p>
                    <code className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-900 px-2 py-1 rounded break-all">
                      {evidence.sourceSpan}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOV Matches — Section 27 */}
      {lovMatches.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Approved LOV Vocabulary Matches
          </p>
          <div className="space-y-1.5">
            {lovMatches.map((match, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg border text-xs",
                  match.selected
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                )}
              >
                <div className="flex items-center gap-2">
                  {match.selected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className={cn("font-medium", match.selected && "font-bold")}>
                    {match.value}
                  </span>
                  {match.selected && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      SELECTED
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-500 shrink-0">
                  {match.score !== null ? `${Math.round(match.score * 100)}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty LOV state */}
      {lovMatches.length === 0 && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
          No LOV vocabulary matches returned for this field.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

function StudioSkeleton() {
  return (
    <div className="flex gap-0 h-full animate-pulse">
      <div className="w-64 border-r border-[#E2E8F0] p-3 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="w-[380px] border-l border-[#E2E8F0] p-4 space-y-3">
        <div className="h-32 bg-slate-200 rounded-xl" />
        <div className="h-20 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Review Studio Page — Section 24
// ─────────────────────────────────────────────────────────────

export default function ReviewStudioPage() {
  const params = useParams<{ reviewId: string }>();
  const router = useRouter();
  const reviewId = params.reviewId ?? "";

  const {
    reviewItem,
    fetchState,
    errorMessage,
    loadReview,
    activeFieldName,
    setActiveFieldName,
    editingFieldName,
    setEditingFieldName,
    patchField,
    fieldActionState,
    fieldError,
    approveRecord,
    rejectRecord,
    recordActionState,
    recordActionError,
  } = useReview();

  useEffect(() => {
    if (reviewId) loadReview(reviewId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  const activeField = reviewItem?.fields.find((f) => f.fieldName === activeFieldName) ?? null;

  const handleApprove = useCallback(() => {
    if (reviewId) approveRecord(reviewId);
  }, [reviewId, approveRecord]);

  const handleEdit = useCallback(() => {
    if (activeFieldName) {
      setEditingFieldName(activeFieldName);
    } else if (reviewItem?.fields[0]) {
      setActiveFieldName(reviewItem.fields[0].fieldName);
      setEditingFieldName(reviewItem.fields[0].fieldName);
    }
  }, [activeFieldName, reviewItem, setEditingFieldName, setActiveFieldName]);

  const handleReject = useCallback(() => {
    if (reviewId && window.confirm("Reject this review record? This cannot be undone.")) {
      rejectRecord(reviewId);
    }
  }, [reviewId, rejectRecord]);

  const handleNext = useCallback(() => router.push("/review"), [router]);
  const handlePrevious = useCallback(() => router.push("/review"), [router]);

  // Section 65 — Keyboard shortcuts (disabled while editing text)
  useReviewKeyboardShortcuts(
    {
      onApprove: handleApprove,
      onEdit: handleEdit,
      onReject: handleReject,
      onNext: handleNext,
      onPrevious: handlePrevious,
    },
    fetchState === "success" && !!reviewItem
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden">
      {/* Page Header Strip */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Review Queue
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-mono text-slate-600">{reviewId}</span>
        </div>

        {reviewItem && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Row confidence:</span>
            <ConfidenceBadge score={reviewItem.rowConfidence} showProgress />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {fetchState === "error" && errorMessage && (
        <div className="p-3 mx-4 mt-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 shrink-0">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => loadReview(reviewId)}
            className="underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetchState === "loading" && (
        <div className="flex-1 overflow-hidden">
          <StudioSkeleton />
        </div>
      )}

      {/* Empty State (backend not yet connected) */}
      {fetchState === "success" && !reviewItem && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              Review record not found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              This review ID does not exist or the backend enrichment pipeline has not yet returned data.
            </p>
            <Link
              href="/review"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg hover:bg-[#1E40AF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Queue
            </Link>
          </div>
        </div>
      )}

      {/* ── Section 24.1 Three-Panel Studio Grid ── */}
      {fetchState === "success" && reviewItem && (
        <div
          className="flex-1 grid overflow-hidden"
          style={{ gridTemplateColumns: "260px 1fr 380px" }}
        >
          {/* ═══════════════════════════════════════
              LEFT PANEL — Section 25: Record Navigation
             ═══════════════════════════════════════ */}
          <aside className="border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col overflow-hidden">
            <div className="px-3 py-3 border-b border-[#E2E8F0]">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Field Navigator
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {reviewItem.fields.length} field{reviewItem.fields.length !== 1 ? "s" : ""} to review
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {reviewItem.fields.map((field) => {
                const isActive = activeFieldName === field.fieldName;
                const hasFlags = field.validationFlags.length > 0;
                return (
                  <button
                    key={field.fieldName}
                    type="button"
                    onClick={() => setActiveFieldName(field.fieldName)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-colors text-xs",
                      isActive
                        ? "bg-[#EFF6FF] border border-[#1D4ED8] text-[#1D4ED8] font-semibold"
                        : "hover:bg-white border border-transparent text-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] truncate">
                        {field.fieldName}
                      </span>
                      {hasFlags && (
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ConfidenceBadge score={field.confidence} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Row-level confidence summary */}
            <div className="p-3 border-t border-[#E2E8F0] bg-white">
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                Row Confidence
              </p>
              <ConfidenceBadge score={reviewItem.rowConfidence} showProgress />
            </div>
          </aside>

          {/* ═══════════════════════════════════════
              CENTER PANEL — Section 26: Generated Product Fields
             ═══════════════════════════════════════ */}
          <main className="flex flex-col overflow-hidden bg-white">
            <div className="px-4 py-3 border-b border-[#E2E8F0] shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated & Validated Product Fields
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click a field to inspect. Use <kbd className="bg-slate-100 px-1 rounded font-mono text-slate-600">E</kbd> to edit.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {reviewItem.fields.map((field) => (
                <FieldRow
                  key={field.fieldName}
                  field={field}
                  isActive={activeFieldName === field.fieldName}
                  isEditing={editingFieldName === field.fieldName}
                  actionState={fieldActionState[field.fieldName] ?? "idle"}
                  fieldError={fieldError[field.fieldName] ?? null}
                  onSelect={() => {
                    setActiveFieldName(field.fieldName);
                    setEditingFieldName(null);
                  }}
                  onEditStart={() => {
                    setActiveFieldName(field.fieldName);
                    setEditingFieldName(field.fieldName);
                  }}
                  onEditCancel={() => setEditingFieldName(null)}
                  onSave={(val) => patchField(reviewId, field.fieldName, val)}
                />
              ))}
            </div>

            {/* Section 28: Review Action Bar */}
            <div className="shrink-0">
              <ReviewActionBar
                reviewId={reviewId}
                recordStatus={reviewItem.status}
                recordActionState={recordActionState}
                recordActionError={recordActionError}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onReject={handleReject}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasPrevious={false}
                hasNext={false}
                currentIndex={null}
                totalItems={null}
                showShortcuts
              />
            </div>
          </main>

          {/* ═══════════════════════════════════════
              RIGHT PANEL — Section 27: Evidence & LOV
             ═══════════════════════════════════════ */}
          <aside className="border-l border-[#E2E8F0] bg-[#F8FAFC] flex flex-col overflow-hidden">
            <div className="px-3 py-3 border-b border-[#E2E8F0] shrink-0">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Evidence & LOV Inspection
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <EvidencePanel field={activeField} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
