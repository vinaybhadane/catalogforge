import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

/**
 * 404 Not Found Page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] p-4">
      <div className="text-center max-w-sm bg-white border border-[#CBCBCB] rounded-2xl p-6">
        <div className="w-14 h-14 rounded-2xl bg-[#ECEFF2] border border-[#CBCBCB] text-[#6D8196] flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#4A4A4A] tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-[#4A4A4A]/70 mt-2">
          The requested page or resource could not be found.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#6D8196] hover:bg-[#576A7E] border border-[#576A7E] text-[#FFFFE3] text-xs font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
