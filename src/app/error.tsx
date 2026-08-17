"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Global error boundary
 * Catches 5xx / unhandled client errors
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | unknown;
  reset: () => void;
}) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string"
      ? (error as any).message
      : "An unexpected error occurred.";

  const digest = error && typeof error === "object" && "digest" in error ? String((error as any).digest) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] p-4">
      <div className="text-center max-w-sm bg-white border border-[#CBCBCB] rounded-2xl p-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#4A4A4A] tracking-tight">
          Something went wrong
        </h1>
        <p className="text-xs text-[#4A4A4A]/70 mt-2">
          {errorMessage}
        </p>
        {digest && (
          <p className="text-[10px] text-[#4A4A4A]/50 font-mono mt-2">
            Reference: {digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#6D8196] hover:bg-[#576A7E] border border-[#576A7E] text-[#FFFFE3] text-xs font-bold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
