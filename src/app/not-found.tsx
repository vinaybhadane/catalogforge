import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

/**
 * 404 Not Found Page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 text-[#000000]">
      <div className="text-center max-w-sm bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] p-2 flex items-center justify-center mx-auto mb-4">
          <Image
            src="/logo-icon.png"
            alt="CatalogForge Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-[#000000] tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          The requested page or resource could not be located in this workspace.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#3386E7] hover:bg-[#2563EB] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
