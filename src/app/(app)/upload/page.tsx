"use client";

import React from "react";
import {
  UploadCloud,
  FileText,
  Globe,
  Loader2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useUpload, UploadMode, UploadState } from "@/hooks/useUpload";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PreflightSummary } from "@/components/upload/PreflightSummary";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const {
    uploadMode,
    setUploadMode,
    selectedFile,
    urlInput,
    handleFileSelect,
    handleUrlChange,
    uploadState,
    progress,
    preflightResult,
    errorMessage,
    jobId,
    reset,
    submitUpload,
    proceedToJobDetail,
  } = useUpload();

  const isProcessing = uploadState === "uploading" || uploadState === "scanning";
  const isPreflightReady =
    uploadState === "completed" ||
    uploadState === "completed_with_warnings" ||
    uploadState === "rejected";

  const TABS = [
    { id: "file" as UploadMode, label: "File Upload", sublabel: "CSV / XLSX", icon: UploadCloud },
    { id: "pdf" as UploadMode, label: "Manufacturer PDF", sublabel: "PDF up to 50MB", icon: FileText },
    { id: "url" as UploadMode, label: "Manufacturer URL", sublabel: "Datasheet link", icon: Globe },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
          <UploadCloud className="w-5 h-5 text-[#3386E7]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#000000] tracking-tight">
            Dataset Upload &amp; Ingestion
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5 leading-snug">
            Ingest raw catalog CSV/XLSX files, manufacturer PDFs, or URLs for AI-powered enrichment.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered</span>
        </div>
      </div>

      {/* ── Upload Mode Tabs ──────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex gap-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = uploadMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setUploadMode(tab.id); reset(); }}
              disabled={isProcessing}
              className={cn(
                "flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-[#3386E7] text-white shadow-sm"
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#000000]",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#94A3B8]")} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.sublabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────── */}
      {uploadState === "error" && errorMessage && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 w-[18px] h-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-900">Upload Failed</h4>
            <p className="text-sm text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Processing State ─────────────────────────────────────────── */}
      {isProcessing && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#3386E7] animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-[#000000]">
              {uploadState === "uploading" ? "Uploading Dataset…" : "Running Pre-flight Schema Scan…"}
            </h3>
            <p className="text-sm text-[#64748B]">
              Validating columns, checking placeholder values, and normalising units of measure.
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-xs font-semibold text-[#94A3B8] mb-1.5">
              <span>{uploadState === "uploading" ? "Uploading" : "Scanning"}</span>
              <span>{Math.max(progress, 15)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3386E7] transition-all duration-300"
                style={{ width: `${Math.max(progress, 15)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── URL Input ────────────────────────────────────────────────── */}
      {uploadMode === "url" && uploadState === "idle" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#000000] mb-0.5">Manufacturer Datasheet URL</h3>
            <p className="text-xs text-[#64748B]">Paste a public URL to a PDF, product page, or catalog spec sheet.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://manufacturer.domain/spec-sheet.pdf"
                className="w-full pl-9 pr-4 py-2.5 text-sm text-[#000000] placeholder:text-[#94A3B8] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3386E7] focus:ring-1 focus:ring-[#3386E7]/30 bg-[#FAFAFA] transition"
              />
            </div>
            <button
              type="button"
              onClick={submitUpload}
              disabled={!urlInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#3386E7] hover:bg-[#2563EB] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Ingest</span>
            </button>
          </div>

          {/* Tips */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <CheckCircle2 className="w-4 h-4 text-[#3386E7] shrink-0 mt-0.5" />
            <p className="text-xs text-[#475569]">
              Supports publicly accessible PDF datasheets and HTML catalog pages. The AI engine will extract product attributes automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── File Dropzone ─────────────────────────────────────────────── */}
      {(uploadMode === "file" || uploadMode === "pdf") && uploadState === "idle" && (
        <UploadDropzone
          mode={uploadMode}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onUploadSubmit={submitUpload}
          isUploading={isProcessing}
        />
      )}

      {/* ── Pre-flight Summary ───────────────────────────────────────── */}
      {isPreflightReady && preflightResult && (
        <PreflightSummary
          result={preflightResult}
          state={uploadState}
          onProceed={proceedToJobDetail}
          onReset={reset}
        />
      )}
    </div>
  );
}

