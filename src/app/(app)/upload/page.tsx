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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Neumorphic Page Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">Dataset Upload & Ingestion</h1>
            <p className="text-xs text-[#6D8196] font-bold mt-0.5">
              Ingest raw catalog CSV/XLSX files, manufacturer specification PDFs, or URLs for deterministic enrichment.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Mode Segmented Control Switcher */}
      <div className="neu-inset p-1.5 rounded-2xl flex flex-wrap gap-2">
        {[
          { id: "file" as UploadMode, label: "File Upload (CSV/XLSX)", icon: UploadCloud },
          { id: "pdf" as UploadMode, label: "Manufacturer PDF", icon: FileText },
          { id: "url" as UploadMode, label: "Manufacturer URL", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = uploadMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setUploadMode(tab.id);
                reset();
              }}
              disabled={isProcessing}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                isActive
                  ? "neu-btn-accent text-[#FFFFE3]"
                  : "neu-btn text-[#4A4A4A]",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {uploadState === "error" && errorMessage && (
        <div className="neu-card rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900">Upload Request Error</h4>
            <p className="text-xs text-rose-700 mt-1">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="neu-btn px-3 py-1 text-xs text-rose-800 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading / Scanning State Indicators */}
      {isProcessing && (
        <div className="neu-card rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl neu-icon-well flex items-center justify-center mx-auto text-[#6D8196]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#4A4A4A]">
              {uploadState === "uploading" ? "Uploading Dataset..." : "Performing Pre-flight Schema Scan..."}
            </h3>
            <p className="text-xs text-[#6D8196] font-bold mt-1">
              Validating columns, checking placeholder values, and normalizing units of measure.
            </p>
          </div>
          {/* Progress Bar */}
          <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5 max-w-md mx-auto">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6D8196] to-indigo-500 transition-all duration-300"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>
        </div>
      )}

      {/* URL Ingestion Input Box */}
      {uploadMode === "url" && uploadState === "idle" && (
        <div className="neu-card rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="url-input" className="block text-xs font-extrabold text-[#4A4A4A] mb-1.5">
              Manufacturer Datasheet or Catalog URL
            </label>
            <div className="flex gap-3">
              <input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://manufacturer.domain/spec-sheet.pdf"
                className="flex-1 px-4 py-2.5 text-sm neu-input placeholder:text-[#4A4A4A]/50"
              />
              <button
                type="button"
                onClick={submitUpload}
                disabled={!urlInput.trim()}
                className="neu-btn-accent px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                Ingest URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone File Upload */}
      {(uploadMode === "file" || uploadMode === "pdf") && uploadState === "idle" && (
        <UploadDropzone
          mode={uploadMode}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onUploadSubmit={submitUpload}
          isUploading={isProcessing}
        />
      )}

      {/* Pre-flight Scan Summary */}
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
