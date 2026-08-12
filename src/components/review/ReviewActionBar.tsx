"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ReviewStatus } from "@/types";
import { ReviewActionState } from "@/hooks/useReview";
import { cn } from "@/lib/utils";

interface ReviewActionBarProps {
  reviewId: string;
  recordStatus: ReviewStatus;
  recordActionState: ReviewActionState;
  recordActionError: string | null;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Current position in queue (1-indexed) */
  currentIndex: number | null;
  totalItems: number | null;
  /** Show keyboard shortcut hints */
  showShortcuts?: boolean;
}

function ShortcutHint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-400">
      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 text-[10px] leading-none">
        {keys}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

/**
 * ReviewActionBar — Section 28.
 * Approve / Edit / Reject controls with queue navigation and keyboard hint panel.
 * Never shows success state until API response is confirmed.
 */
export function ReviewActionBar({
  reviewId,
  recordStatus,
  recordActionState,
  recordActionError,
  onApprove,
  onEdit,
  onReject,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  currentIndex,
  totalItems,
  showShortcuts = true,
}: ReviewActionBarProps) {
  const isSaving = recordActionState === "saving";
  const isResolved = recordStatus === "approved" || recordStatus === "rejected";

  return (
    <div className="bg-white border-t border-[#E2E8F0] px-4 py-3 space-y-3">
      {/* Error Banner */}
      {recordActionState === "error" && recordActionError && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{recordActionError}</span>
        </div>
      )}

      {/* Resolved Banner */}
      {isResolved && (
        <div
          className={cn(
            "p-2.5 rounded-lg border flex items-center gap-2 text-xs font-semibold",
            recordStatus === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          {recordStatus === "approved" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>
            Record {recordStatus === "approved" ? "Approved" : "Rejected"}
          </span>
        </div>
      )}

      {/* Primary Review Actions */}
      {!isResolved && (
        <div className="flex items-center gap-2">
          {/* Approve */}
          <button
            type="button"
            onClick={onApprove}
            disabled={isSaving}
            aria-label="Approve record (A)"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {isSaving ? "Saving…" : "Approve"}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            disabled={isSaving}
            aria-label="Edit fields (E)"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={onReject}
            disabled={isSaving}
            aria-label="Reject record (R)"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-red-50 border border-[#B91C1C] text-[#B91C1C] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}

      {/* Queue Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || isSaving}
          aria-label="Previous review item (K)"
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Position Indicator */}
        <span className="text-xs font-medium text-slate-500">
          {currentIndex !== null && totalItems !== null
            ? `${currentIndex} / ${totalItems}`
            : "—"}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || isSaving}
          aria-label="Next review item (J)"
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcut Hints — Section 65 */}
      {showShortcuts && (
        <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap gap-x-4 gap-y-1">
          <ShortcutHint keys="A" label="Approve" />
          <ShortcutHint keys="E" label="Edit" />
          <ShortcutHint keys="R" label="Reject" />
          <ShortcutHint keys="J" label="Next" />
          <ShortcutHint keys="K" label="Previous" />
        </div>
      )}
    </div>
  );
}
