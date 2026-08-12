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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dataset Upload & Ingestion</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingest raw catalog CSV/XLSX files, manufacturer specification PDFs, or document URLs for deterministic enrichment.
        </p>
      </div>

      {/* Section 15.1 Upload Mode Segmented Control Switcher */}
      <div className="bg-white p-1 rounded-xl border border-[#E2E8F0] inline-flex w-full sm:w-auto shadow-sm">
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
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all",
                isActive
                  ? "bg-[#1D4ED8] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner for Section 18 Error state */}
      {uploadState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">Upload Request Error</h4>
            <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-red-700 hover:text-red-900 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section 18 Loading / Scanning State Indicators */}
      {isProcessing && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#1D4ED8] animate-spin" />
              {uploadState === "uploading" ? "Uploading payload to ingestion server..." : "Running pre-flight schema & placeholder scan..."}
            </span>
            <span className="font-mono text-[#1D4ED8]">{progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#1D4ED8] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Upload Inputs based on mode */}
      {uploadState !== "completed" &&
        uploadState !== "completed_with_warnings" &&
        uploadState !== "rejected" && (
          <div>
            {uploadMode === "url" ? (
              /* Manufacturer URL Input Control */
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                <div>
                  <label htmlFor="url-input" className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Manufacturer Document URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      id="url-input"
                      type="url"
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://manufacturer.com/catalog/specifications.pdf"
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent text-slate-900"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Source URL domain governance check will be validated authoritative server-side.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={submitUpload}
                    disabled={!urlInput.trim() || isProcessing}
                    className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>Analyze Document URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Dropzone Component for File & PDF */
              <UploadDropzone
                mode={uploadMode}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onUploadSubmit={submitUpload}
                isUploading={isProcessing}
              />
            )}
          </div>
        )}

      {/* Pre-flight Scan Results Summary */}
      {(uploadState === "completed" ||
        uploadState === "completed_with_warnings" ||
        uploadState === "rejected") && (
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
