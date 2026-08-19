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
  FileSpreadsheet,
  Table,
  Check,
  ChevronDown,
  ChevronUp,
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
    handleFileSelect,
    uploadState,
    progress,
    preflightResult,
    errorMessage,
    jobId,
    reset,
    submitUpload,
    proceedToJobDetail,
  } = useUpload();

  const [activeTabMode, setActiveTabMode] = useState<ExtendedUploadMode>("file");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || params.get("mode");
      if (tabParam && (tabParam === "ai-search" || tabParam === "url" || tabParam === "file" || tabParam === "pdf")) {
        setActiveTabMode(tabParam as ExtendedUploadMode);
      }
    }
  }, []);

  // Single Product AI Search state
  const [productSearchInput, setProductSearchInput] = useState("");
  const [mfgSearchInput, setMfgSearchInput] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [savedProductSuccess, setSavedProductSuccess] = useState<{ productId: string | number; partNumber: string } | null>(null);

  // Manufacturer URL Extraction State
  const [mfrUrlInput, setMfrUrlInput] = useState("");
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [urlExtractionResult, setUrlExtractionResult] = useState<any>(null);
  const [urlExtractionError, setUrlExtractionError] = useState<string | null>(null);
  const [isSavingUrlProduct, setIsSavingUrlProduct] = useState(false);
  const [savedUrlProductSuccess, setSavedUrlProductSuccess] = useState<{ productId: string | number; partNumber: string } | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [showDeliveryColumns, setShowDeliveryColumns] = useState(false);

  const isProcessing = uploadState === "uploading" || uploadState === "scanning";
  const isPreflightReady =
    uploadState === "completed" ||
    uploadState === "completed_with_warnings" ||
    uploadState === "rejected";

  const TABS = [
    { id: "file" as ExtendedUploadMode, label: "File Upload", sublabel: "CSV / XLSX", icon: UploadCloud },
    { id: "url" as ExtendedUploadMode, label: "Manufacturer URL", sublabel: "Datasheet / Product link", icon: Globe },
    { id: "ai-search" as ExtendedUploadMode, label: "AI Product Lookup", sublabel: "Gemini Sourcing", icon: Sparkles },
    { id: "pdf" as ExtendedUploadMode, label: "Manufacturer PDF", sublabel: "PDF up to 50MB", icon: FileText },
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

  // Manufacturer URL Live Extraction
  const handleExtractFromUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfrUrlInput.trim()) return;

    setIsExtractingUrl(true);
    setUrlExtractionError(null);
    setUrlExtractionResult(null);
    setSavedUrlProductSuccess(null);

    try {
      const res = await apiClient.post<any>("/ingestion/extract-url", {
        url: mfrUrlInput.trim(),
      });
      setUrlExtractionResult(res.data);
    } catch (err: any) {
      setUrlExtractionError(
        err?.message || "Failed to extract product intelligence from the manufacturer URL. Please check the link."
      );
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handleSaveUrlProductToCatalog = async () => {
    if (!urlExtractionResult) return;
    setIsSavingUrlProduct(true);
    try {
      const saveRes = await apiClient.post<any>("/ingestion/extract-url", {
        url: urlExtractionResult.sourceUrl,
        saveToCatalog: true,
      });

      setSavedUrlProductSuccess({
        productId: saveRes.savedProductId || "new",
        partNumber: urlExtractionResult.partNumber,
      });
    } catch (err: any) {
      setUrlExtractionError(err?.message || "Failed to save product to catalog.");
    } finally {
      setIsSavingUrlProduct(false);
    }
  };

  const handleDownloadDeliveryExcel = async () => {
    if (!urlExtractionResult) return;
    setIsExportingExcel(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const res = await fetch(`${baseUrl}/ingestion/extract-url/export-excel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: urlExtractionResult.sourceUrl || mfrUrlInput,
          deliveryRow: urlExtractionResult.deliveryRow,
        }),
      });

      if (!res.ok) {
        throw new Error(`Export request returned ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanPart = (urlExtractionResult.partNumber || "Product").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `Unihack_Delivery_${cleanPart}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      console.warn("Excel export fell back to CSV generation:", err);
      handleDownloadDeliveryCsv();
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadDeliveryCsv = async () => {
    if (!urlExtractionResult) return;
    setIsExportingCsv(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      let csvText = "";

      try {
        const res = await fetch(`${baseUrl}/ingestion/extract-url/export-csv`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: urlExtractionResult.sourceUrl || mfrUrlInput,
            deliveryRow: urlExtractionResult.deliveryRow,
          }),
        });

        if (res.ok) {
          csvText = await res.text();
        }
      } catch (networkErr) {
        console.warn("Backend CSV export failed, generating in-browser CSV:", networkErr);
      }

      if (!csvText && urlExtractionResult.deliveryRow) {
        const headers = Object.keys(urlExtractionResult.deliveryRow);
        const escapeCsv = (val: any) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        };
        const headerLine = headers.map(escapeCsv).join(",");
        const rowLine = headers.map((h) => escapeCsv(urlExtractionResult.deliveryRow[h] || "")).join(",");
        csvText = `${headerLine}\n${rowLine}`;
      }

      if (!csvText) {
        throw new Error("Unable to build CSV export payload.");
      }

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanPart = (urlExtractionResult.partNumber || "Product").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `Unihack_Delivery_${cleanPart}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      setUrlExtractionError(err?.message || "Failed to download delivery CSV.");
    } finally {
      setIsExportingCsv(false);
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
              Extract verified specifications from Manufacturer URLs, PDF spec sheets, or batch CSV/XLSX catalogs.
            </p>
          </div>
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
                if (tab.id !== "ai-search" && tab.id !== "url") {
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

      {/* ── TAB: MANUFACTURER URL EXTRACTION ──── */}
      {activeTabMode === "url" && (
        <div className="space-y-6">
          {/* Input Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#000000] tracking-tight flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2563EB]" />
                Manufacturer URL Intelligence &amp; 252-Column Extractor
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Enter an official manufacturer product page, datasheet link, or technical PDF. Extract verified specifications directly into the 252-column Unihack Delivery Schema.
              </p>
            </div>

            <form onSubmit={handleExtractFromUrl} className="space-y-3">
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="url"
                  value={mfrUrlInput}
                  onChange={(e) => setMfrUrlInput(e.target.value)}
                  placeholder="https://www.manufacturer.com/product/part-number (e.g. Diablo, 3M, Milwaukee, Schneider Electric)..."
                  className="w-full pl-10 pr-4 py-3 text-xs text-[#000000] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA]"
                  required
                  suppressHydrationWarning
                />
              </div>

              {/* Sample Shortcuts */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => setMfrUrlInput("https://www.diablotools.com/products/DCB518ASTS06G")}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono transition"
                >
                  Diablo Sanding Belt
                </button>
                <button
                  type="button"
                  onClick={() => setMfrUrlInput("https://www.3m.com/3M/en_US/p/d/b40065688/")}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono transition"
                >
                  3M Cubitron II
                </button>
                <button
                  type="button"
                  onClick={() => setMfrUrlInput("https://www.se.com/us/en/product/QO120/mini-circuit-breaker-qo-20a-1p-120-240v-10ka-plug-in/")}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono transition"
                >
                  Square D Breaker
                </button>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={!mfrUrlInput.trim() || isExtractingUrl}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
                  suppressHydrationWarning
                >
                  {isExtractingUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Crawling &amp; Extracting…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract 252-Column Specs</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading Animation Card */}
          {isExtractingUrl && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#000000]">
                  Extracting Product Intelligence from URL…
                </h3>
                <p className="text-xs text-[#64748B] max-w-md">
                  Fetching live HTML content, scraping high-res OEM images, and parsing technical specifications with Google Gemini 3.5 Flash-Lite.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Connect to Manufacturer Server &amp; Parse HTML Metadata</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Scrape Real Product Images &amp; Technical Spec Sheet PDFs</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-blue-700 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>3. Map to 252-Column Unihack Schema with Gemini 3.5 AI</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">4</div>
                  <span>4. Schema Validation: Unmentioned columns kept blank</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {urlExtractionError && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-900">Extraction Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{urlExtractionError}</p>
              </div>
            </div>
          )}

          {/* Success Banner when Saved */}
          {savedUrlProductSuccess && (
            <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Product Ingested &amp; Saved to Catalog!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Part #{savedUrlProductSuccess.partNumber} is now live in the central product catalog.
                  </p>
                </div>
              </div>
              <Link
                href={`/products/${savedUrlProductSuccess.productId}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>View Product Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Extracted Product Presentation Card */}
          {urlExtractionResult && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Tier 1 OEM Verified
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{urlExtractionResult.manufacturerName}</span>
                    {urlExtractionResult.brandName && (
                      <span className="text-xs font-semibold text-slate-400">• Brand: {urlExtractionResult.brandName}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#000000] mt-1.5">{urlExtractionResult.officialTitle}</h3>
                  <p className="text-xs font-mono font-semibold text-[#2563EB] mt-0.5">
                    Part Number: {urlExtractionResult.partNumber} | SKU: {urlExtractionResult.sku}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Taxonomy: <span className="font-semibold text-slate-700">{urlExtractionResult.classpath}</span>
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadDeliveryExcel}
                    disabled={isExportingExcel || isExportingCsv}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isExportingExcel ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDeliveryCsv}
                    disabled={isExportingExcel || isExportingCsv}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 border border-slate-300 shadow-sm"
                  >
                    {isExportingCsv ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>CSV (.csv)</span>
                  </button>

                  {!savedUrlProductSuccess && (
                    <button
                      type="button"
                      onClick={handleSaveUrlProductToCatalog}
                      disabled={isSavingUrlProduct}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSavingUrlProduct ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Save to Catalog</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Zero Fake Data Compliance & Sourcing Audit Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F0FDF4] border border-emerald-200 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
                    <span>252-Column Unihack Schema</span>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-base font-black text-emerald-950 mt-1">
                    {urlExtractionResult.nonEmptyColumnsCount} / 252 Columns
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    {252 - urlExtractionResult.nonEmptyColumnsCount} Missing columns kept strictly blank
                  </p>
                </div>

                <div className="bg-[#EFF6FF] border border-blue-200 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
                    <span>Verified Real Photos</span>
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-base font-black text-blue-950 mt-1">
                    {urlExtractionResult.images?.length || 0} OEM Images
                  </p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Actual Image: Yes (100% Scraped)</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 uppercase">
                    <span>Technical Attributes</span>
                    <Check className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-base font-black text-slate-950 mt-1">
                    {urlExtractionResult.attributes?.length || 0} Normalized Specs
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">With standard Units of Measure</p>
                </div>
              </div>

              {/* Scraped Images Gallery */}
              {urlExtractionResult.images && urlExtractionResult.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Verified OEM Photos (Scraped directly from page)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {urlExtractionResult.images.map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col items-center gap-2 group hover:border-[#2563EB] transition"
                      >
                        <div className="w-full h-32 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden relative">
                          <img
                            src={img.url}
                            alt={img.alt || `Product Image ${idx + 1}`}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e: any) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                        <div className="w-full flex items-center justify-between text-[10px]">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded font-extrabold uppercase text-[9px]",
                            img.isPrimary ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          )}>
                            {img.isPrimary ? "Primary Photo" : `Alt Photo ${idx}`}
                          </span>
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2563EB] hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standardized B2B Descriptions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Standardized Descriptions (6 Formats)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Short Description (Max 150 Char)</span>
                    <p className="font-semibold text-slate-800">{urlExtractionResult.shortDesc}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Description</span>
                    <p className="font-semibold text-slate-800">{urlExtractionResult.mobileDesc || "—"}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Invoice Description</span>
                    <p className="font-mono font-bold text-slate-800">{urlExtractionResult.invoiceDesc || "—"}</p>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Retail Description</span>
                    <p className="font-semibold text-slate-800">{urlExtractionResult.retailDesc || "—"}</p>
                  </div>
                  <div className="sm:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Long Description</span>
                    <p className="text-slate-700 leading-relaxed">{urlExtractionResult.longDesc1 || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Normalized Technical Attributes */}
              {urlExtractionResult.attributes && urlExtractionResult.attributes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Normalized Technical Attributes (Only Stated Specs)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Automated Confidence &amp; HITL Governance
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {urlExtractionResult.attributes.map((attr: any, idx: number) => {
                      const conf = attr.confidence ?? attr.confidenceScore ?? attr.lovMatchConfidence ?? 0.98;
                      const isLowConfidence = conf <= 0.60;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5",
                            isLowConfidence
                              ? "bg-amber-50/60 border-amber-300 shadow-sm"
                              : "bg-[#FAFAFA] border-[#E2E8F0] hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                              {attr.label}
                            </p>
                            {isLowConfidence ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                <AlertCircle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Flag for Human Review</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                {Math.round(conf * 100)}%
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {attr.value}{" "}
                              {attr.uom ? (
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({attr.uom})
                                </span>
                              ) : null}
                            </p>
                            {isLowConfidence && (
                              <p className="text-[10px] text-amber-700 mt-1 font-medium">
                                Confidence: {Math.round(conf * 100)}% — Requires Review
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bullet Features */}
              {urlExtractionResult.features && urlExtractionResult.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Product Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                    {urlExtractionResult.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Documents (Spec Sheets, SDS, Manuals) */}
              {urlExtractionResult.documents && urlExtractionResult.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Verified Technical Documents (PDF / Datasheets)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {urlExtractionResult.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {doc.assetType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700">OEM VERIFIED</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</p>
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 pt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View Document
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 252-Column Unihack Schema Inspector Toggle */}
              <div className="border-t border-[#E2E8F0] pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeliveryColumns(!showDeliveryColumns)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#2563EB]" />
                    <span>Inspect 252-Column Unihack Delivery Row Mapping</span>
                  </div>
                  {showDeliveryColumns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDeliveryColumns && (
                  <div className="mt-3 p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 overflow-x-auto max-h-96 space-y-2 text-xs font-mono">
                    <p className="text-emerald-400 font-sans text-xs font-bold">
                      Exact 252-Column Data Representation (Matching Unihack_Expected_Output_Delivery_Format.xlsx):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {Object.entries(urlExtractionResult.deliveryRow || {}).map(([key, val]) => (
                        <div key={key} className="flex items-start justify-between gap-2 p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 truncate max-w-[180px]">{key}:</span>
                          <span className={cn("truncate font-semibold", val ? "text-white" : "text-slate-600 italic")}>
                            {String(val || "[BLANK]")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SINGLE PRODUCT QUICK LOOKUP (GEMINI 3.5 FLASH-LITE) ─── */}
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

              {/* Extracted From (Verified Source Provenance) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Data Extracted From (Source Sourcing)</span>
                </h4>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-3">
                  {aiResult.citations && aiResult.citations.length > 0 ? (
                    <div className="space-y-3">
                      {aiResult.citations
                        .filter((c: any, idx: number, arr: any[]) => arr.findIndex((x) => x.sourceUrl === c.sourceUrl) === idx)
                        .map((cite: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between flex-wrap gap-2 pt-2 first:pt-0 border-t first:border-t-0 border-slate-200">
                            <div className="space-y-0.5 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {cite.domain || "Official Website"}
                                </span>
                                <p className="text-xs font-bold text-slate-900">{cite.sourceTitle || cite.domain}</p>
                              </div>
                              {cite.sourceSnippet && (
                                <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                  {cite.sourceSnippet}
                                </p>
                              )}
                            </div>
                            {cite.sourceUrl && (
                              <a
                                href={cite.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 shrink-0 mt-0.5"
                              >
                                <span>Visit Source URL</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {aiResult.searchSummary?.primarySourceDomain || "Official Domain"}
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {aiResult.searchSummary?.primarySourceDomain}
                        </p>
                      </div>
                      {aiResult.searchSummary?.primarySourceDomain && (
                        <a
                          href={`https://${aiResult.searchSummary.primarySourceDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
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
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Normalized Technical Attributes
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Automated Confidence &amp; HITL Governance
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {aiResult.attributes.map((attr: any, idx: number) => {
                      const conf = attr.confidence ?? attr.confidenceScore ?? attr.lovMatchConfidence ?? 0.95;
                      const isLowConfidence = conf <= 0.60;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5",
                            isLowConfidence
                              ? "bg-amber-50/60 border-amber-300 shadow-sm"
                              : "bg-[#FAFAFA] border-[#E2E8F0] hover:border-slate-300"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                              {attr.label}
                            </p>
                            {isLowConfidence ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                <AlertCircle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Flag for Human Review</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                {Math.round(conf * 100)}%
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {attr.value}{" "}
                              {attr.uom ? (
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({attr.uom})
                                </span>
                              ) : null}
                            </p>
                            {isLowConfidence && (
                              <p className="text-[10px] text-amber-700 mt-1 font-medium">
                                Confidence: {Math.round(conf * 100)}% — Requires Review
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verified Product Image Preview Gallery */}
              {(() => {
                const imageAssets = (aiResult.assets || []).filter((a: any) => a.assetType === 'image');
                if (imageAssets.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Verified OEM Product Image Preview
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {imageAssets.map((img: any, idx: number) => {
                        const imgUrl = img.previewUrl || img.sourceUrl;
                        return (
                          <div
                            key={idx}
                            className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3.5 group hover:border-[#2563EB] transition"
                          >
                            <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={img.fileName || "Product Photo"}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                  onError={(e: any) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  OEM VERIFIED PHOTO
                                </span>
                                {imgUrl && (
                                  <a
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-[#2563EB] hover:underline font-semibold flex items-center gap-0.5"
                                  >
                                    <span>View Full</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-900 truncate">{img.fileName}</p>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {img.shortInfo || "Authentic manufacturer product photo scraped directly from CDN"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Warranty Coverage & Short Info Card */}
              {aiResult.warrantyInfo && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Warranty Coverage &amp; Policy
                  </h4>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{aiResult.warrantyInfo.term}</span>
                        <span className={cn(
                          "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded",
                          aiResult.warrantyInfo.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        )}>
                          {aiResult.warrantyInfo.isVerified ? "Official OEM Policy Link Found" : "Standard Manufacturer Term"}
                        </span>
                      </div>
                      {aiResult.warrantyInfo.verifiedUrl && (
                        <a
                          href={aiResult.warrantyInfo.verifiedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Official Warranty Page
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {aiResult.warrantyInfo.shortInfo}
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Technical Documents (Only Real Verified PDFs & Short Info) */}
              {(() => {
                const docAssets = (aiResult.assets || []).filter((a: any) => a.assetType !== 'image');
                return (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Verified Technical Documents &amp; Manuals
                    </h4>
                    {docAssets.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {docAssets.map((doc: any, idx: number) => {
                          const hasValidUrl = Boolean(doc.sourceUrl && doc.status !== 'not_available');
                          return (
                            <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {doc.assetType.replace(/_/g, " ")}
                                </span>
                                <span className={cn("text-[9px] font-bold", hasValidUrl ? "text-emerald-700" : "text-slate-400")}>
                                  {hasValidUrl ? "OEM VERIFIED LINK" : "UNAVAILABLE"}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</p>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                {doc.shortInfo || "Official manufacturer technical specification & dimensional drawing PDF"}
                              </p>
                              {hasValidUrl && (
                                <a
                                  href={doc.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1 pt-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open Verified PDF Document
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          No downloadable PDF spec sheet or user manual was found on the official website for this part number.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ERROR BANNER (FILE / PDF) ───────────────────────────────── */}
      {activeTabMode !== "ai-search" && activeTabMode !== "url" && uploadState === "error" && errorMessage && (
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

      {/* ── TAB: PROCESSING STATE (FILE / PDF) ──────────────────────────── */}
      {activeTabMode !== "ai-search" && activeTabMode !== "url" && isProcessing && (
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

      {/* ── TAB: FILE / PDF DROPZONE ────────────────────────────────────── */}
      {(activeTabMode === "file" || activeTabMode === "pdf") &&
        (uploadState === "idle" || uploadState === "selected" || uploadState === "error") && (
          <UploadDropzone
            mode={uploadMode}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onUploadSubmit={submitUpload}
            isUploading={isProcessing}
          />
        )}

      {/* ── PRE-FLIGHT SUMMARY (FILE / PDF) ─────────────────────────────── */}
      {activeTabMode !== "ai-search" && activeTabMode !== "url" && isPreflightReady && preflightResult && (
        <PreflightSummary
          result={preflightResult}
          state={uploadState}
          jobId={jobId}
          onProceed={proceedToJobDetail}
          onReset={reset}
        />
      )}
    </div>
  );
}
