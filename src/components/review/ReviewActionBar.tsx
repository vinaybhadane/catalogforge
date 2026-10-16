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
    <span className="flex items-center gap-1.5 text-[10px] text-[#686868]">
      <kbd className="px-1.5 py-0.5 rounded-md bg-[#FAFAFA] border border-[#EAEAEA] font-mono text-[#111111] font-bold text-[10px] leading-none">
        {keys}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

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
    <div className="bg-white border-t border-[#EAEAEA] px-5 py-4 space-y-3.5">
      {/* Error Banner */}
      {recordActionState === "error" && recordActionError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-900 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="flex-1">{recordActionError}</span>
        </div>
      )}

      {/* Resolved Banner */}
      {isResolved && (
        <div
          className={cn(
            "p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold",
            recordStatus === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          )}
        >
          {recordStatus === "approved" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>
            Record {recordStatus === "approved" ? "Approved" : "Rejected"}
          </span>
        </div>
      )}

      {/* Primary Review Actions */}
      {!isResolved && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Approve */}
          <button
            type="button"
            onClick={onApprove}
            disabled={isSaving}
            aria-label="Approve record (A)"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full shadow-[0_2px_8px_rgba(200,255,0,0.25)] transition-all disabled:opacity-50 transform active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
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
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111111] hover:bg-[#191919] text-white text-xs font-bold rounded-full shadow-sm transition-all disabled:opacity-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={onReject}
            disabled={isSaving}
            aria-label="Reject record (R)"
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 border border-[#EAEAEA] hover:border-rose-300 text-rose-700 text-xs font-bold rounded-full transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}

      {/* Queue Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || isSaving}
          aria-label="Previous review item (K)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#EAEAEA] text-[#171717] text-xs font-bold rounded-full hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {/* Position Indicator */}
        <span className="text-xs font-mono font-bold text-[#686868]">
          {currentIndex !== null && totalItems !== null
            ? `${currentIndex} / ${totalItems}`
            : "—"}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || isSaving}
          aria-label="Next review item (J)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#EAEAEA] text-[#171717] text-xs font-bold rounded-full hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Keyboard Shortcut Hints */}
      {showShortcuts && (
        <div className="pt-2 border-t border-[#EAEAEA] flex flex-wrap gap-x-4 gap-y-1">
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
