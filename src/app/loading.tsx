import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

/**
 * Global loading skeleton.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-lg animate-pulse">
          <Image
            src="/logo-icon.png"
            alt="CatalogForge Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[#3386E7] animate-spin" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Loading CatalogForge…
          </p>
        </div>
      </div>
    </div>
  );
}
