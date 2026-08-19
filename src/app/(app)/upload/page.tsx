"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  Globe,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Download,
  ImageIcon,
  XCircle,
  PlusCircle,
  Search,
} from "lucide-react";
import { useUpload, UploadMode } from "@/hooks/useUpload";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PreflightSummary } from "@/components/upload/PreflightSummary";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type ExtendedUploadMode = UploadMode | "ai-search";

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
    reset,
    submitUpload,
    proceedToJobDetail,
  } = useUpload();

  const [activeTabMode, setActiveTabMode] = useState<ExtendedUploadMode>("file");

  // Single Product AI Search state
  const [productSearchInput, setProductSearchInput] = useState("");
  const [mfgSearchInput, setMfgSearchInput] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [savedProductSuccess, setSavedProductSuccess] = useState<{ productId: string | number; partNumber: string } | null>(null);

  const isProcessing = uploadState === "uploading" || uploadState === "scanning";
  const isPreflightReady =
    uploadState === "completed" ||
    uploadState === "completed_with_warnings" ||
    uploadState === "rejected";

  const TABS = [
    { id: "file" as ExtendedUploadMode, label: "File Upload", sublabel: "CSV / XLSX", icon: UploadCloud },
    { id: "ai-search" as ExtendedUploadMode, label: "AI Product Lookup", sublabel: "Gemini Sourcing", icon: Sparkles },
    { id: "pdf" as ExtendedUploadMode, label: "Manufacturer PDF", sublabel: "PDF up to 50MB", icon: FileText },
    { id: "url" as ExtendedUploadMode, label: "Manufacturer URL", sublabel: "Datasheet link", icon: Globe },
  ];

  const handleRunAiLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productSearchInput.trim()) return;

    setIsAiSearching(true);
    setAiSearchError(null);
    setAiResult(null);
    setSavedProductSuccess(null);

    try {
      const res = await apiClient.post<any>("/products/search-live", {
        partNumber: productSearchInput.trim(),
        manufacturer: mfgSearchInput.trim() || undefined,
      });
      setAiResult(res);
    } catch (err: any) {
      setAiSearchError(err?.message || "Failed to retrieve product intelligence with Gemini API.");
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!aiResult) return;
    setIsSavingProduct(true);
    try {
      const saveRes = await apiClient.post<any>("/ingestion/single-product", {
        partNumber: aiResult.partNumber,
        manufacturer: aiResult.manufacturer,
        officialTitle: aiResult.officialTitle,
        officialDescription: aiResult.officialDescription,
        features: aiResult.features,
        attributes: aiResult.attributes,
        assets: aiResult.assets,
      });

      setSavedProductSuccess({
        productId: saveRes.productId,
        partNumber: aiResult.partNumber,
      });
    } catch (err: any) {
      setAiSearchError(err?.message || "Failed to save product to catalog.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-[#3386E7]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000] tracking-tight">
              Dataset Upload &amp; Ingestion
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5 leading-snug">
              Ingest raw catalog CSV/XLSX files, manufacturer PDFs, or search products with Google Gemini 3.5 Flash-Lite.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.5 AI</span>
        </div>
      </div>

      {/* ── Upload Mode Tabs ──────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTabMode(tab.id);
                if (tab.id !== "ai-search") {
                  setUploadMode(tab.id as UploadMode);
                  reset();
                }
              }}
              disabled={isProcessing}
              className={cn(
                "flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#000000]",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              suppressHydrationWarning
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#94A3B8]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SINGLE PRODUCT QUICK LOOKUP (GEMINI 3.5 FLASH-LITE) ─── */}
      {activeTabMode === "ai-search" && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#000000] tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                Single Product AI Search &amp; Enrichment
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Enter a product part number or name. Google Gemini 3.5 Flash-Lite extracts verified specs from the official manufacturer website.
              </p>
            </div>

            <form onSubmit={handleRunAiLookup} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={productSearchInput}
                    onChange={(e) => setProductSearchInput(e.target.value)}
                    placeholder="Enter Part Number or Name (e.g. DCB518ASTS06G, 7100075678, QO120)..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs text-[#000000] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={mfgSearchInput}
                    onChange={(e) => setMfgSearchInput(e.target.value)}
                    placeholder="Manufacturer (e.g. Freud Inc, 3M)..."
                    className="w-full px-3 py-2.5 text-xs text-[#000000] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Strict Sourcing: Tier 1 OEM Mandatory for PDFs/Images; E-Commerce 100% Blocked</span>
                </div>
                <button
                  type="submit"
                  disabled={!productSearchInput.trim() || isAiSearching}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  suppressHydrationWarning
                >
                  {isAiSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting with Gemini 3.5…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error state */}
          {aiSearchError && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-900">Extraction Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{aiSearchError}</p>
              </div>
            </div>
          )}

          {/* Success Banner when Saved */}
          {savedProductSuccess && (
            <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Product Successfully Ingested &amp; Published!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Part #{savedProductSuccess.partNumber} is now live in the central product catalog with full AI specifications.
                  </p>
                </div>
              </div>
              <Link
                href={`/products/${savedProductSuccess.productId}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>View Product Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* AI Result Presentation Card */}
          {aiResult && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Tier 1 Verified OEM
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{aiResult.manufacturer}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#000000] mt-1.5">{aiResult.officialTitle}</h3>
                  <p className="text-xs font-mono font-semibold text-[#2563EB] mt-0.5">Part Number: {aiResult.partNumber}</p>
                </div>

                {!savedProductSuccess && (
                  <button
                    type="button"
                    onClick={handleSaveToCatalog}
                    disabled={isSavingProduct}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Catalog…</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Directly to Catalog</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Sourcing Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F0FDF4] border border-emerald-200 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
                    <span>Tier 1 Manufacturer</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-black text-emerald-950 mt-1">{aiResult.searchSummary?.primarySourceDomain}</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Primary authoritative domain</p>
                </div>

                <div className="bg-[#EFF6FF] border border-blue-200 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
                    <span>Tier 2 Distributor</span>
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-sm font-black text-blue-950 mt-1">{aiResult.searchSummary?.distributorResults || 1} Verified Specs</p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Fallback catalog data</p>
                </div>

                <div className="bg-[#FEF2F2] border border-rose-200 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-800 uppercase">
                    <span>E-Commerce Blacklist</span>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <p className="text-sm font-black text-rose-950 mt-1">100% Prohibited</p>
                  <p className="text-[10px] text-rose-700 mt-0.5">Amazon/eBay/Walmart excluded</p>
                </div>
              </div>

              {/* Official Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Standardized B2B Description</h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  {aiResult.officialDescription}
                </p>
              </div>

              {/* Normalized Attributes Grid */}
              {aiResult.attributes && aiResult.attributes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Normalized Technical Attributes</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {aiResult.attributes.map((attr: any, idx: number) => (
                      <div key={idx} className="bg-[#FAFAFA] border border-[#E2E8F0] p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{attr.label}</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {attr.value} {attr.uom ? <span className="text-[10px] text-slate-500 font-normal">{attr.uom}</span> : null}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Manufacturer Assets (Spec Sheet, Warranty, Image) */}
              {aiResult.assets && aiResult.assets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Manufacturer Assets (Tier 1 Only)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {aiResult.assets.map((ast: any, idx: number) => (
                      <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {ast.assetType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700">OEM ONLY</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{ast.fileName}</p>
                        <a
                          href={ast.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 pt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Asset Link
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2 & 3: ERROR BANNER ──────────────────────────────────────── */}
      {activeTabMode !== "ai-search" && uploadState === "error" && errorMessage && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertCircle className="w-[18px] h-[18px] text-rose-600" />
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

      {/* ── TAB 2 & 3: PROCESSING STATE ─────────────────────────────────── */}
      {activeTabMode !== "ai-search" && isProcessing && (
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

      {/* ── TAB 4: URL INPUT ────────────────────────────────────────────── */}
      {activeTabMode === "url" && (uploadState === "idle" || uploadState === "selected" || uploadState === "error") && (
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
                className="w-full pl-9 pr-4 py-2.5 text-sm text-[#000000] placeholder:text-[#94A3B8] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3386E7] bg-[#FAFAFA] transition"
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
        </div>
      )}

      {/* ── TAB 2 & 3: FILE / PDF DROPZONE ──────────────────────────────── */}
      {(activeTabMode === "file" || activeTabMode === "pdf") && (uploadState === "idle" || uploadState === "selected" || uploadState === "error") && (
        <UploadDropzone
          mode={uploadMode}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onUploadSubmit={submitUpload}
          isUploading={isProcessing}
        />
      )}

      {/* ── PRE-FLIGHT SUMMARY ────────────────────────────────────────── */}
      {activeTabMode !== "ai-search" && isPreflightReady && preflightResult && (
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
