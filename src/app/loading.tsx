import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Section 38: Global loading skeleton.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading CatalogForge…
        </p>
      </div>
    </div>
  );
}
