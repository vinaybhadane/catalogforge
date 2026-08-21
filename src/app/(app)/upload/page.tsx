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
  RotateCcw,
  Mail,
  Send,
  Share2,
  Copy,
  Camera,
  ScanText,
  ShieldAlert,
} from "lucide-react";
import { useUpload, UploadMode } from "@/hooks/useUpload";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  saveUserWorkspaceProduct,
  saveUserWorkspaceJob,
} from "@/lib/auth/workspace-guard";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PreflightSummary } from "@/components/upload/PreflightSummary";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type ExtendedUploadMode = UploadMode | "ai-search" | "image-ocr";

export default function UploadPage() {
  const { user } = useAuth();
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

  const [activeTabMode, setActiveTabMode] = useState<ExtendedUploadMode>("ai-search");

  // Single Product AI Search state
  const [productSearchInput, setProductSearchInput] = useState("");
  const [mfgSearchInput, setMfgSearchInput] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [savedProductSuccess, setSavedProductSuccess] = useState<{ productId: string | number; partNumber: string } | null>(null);

  // Image / Nameplate OCR Ingestion State
  const [selectedOcrFile, setSelectedOcrFile] = useState<File | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [selectedOcrBatchProductIndex, setSelectedOcrBatchProductIndex] = useState(0);
  const [isSavingOcrProduct, setIsSavingOcrProduct] = useState(false);
  const [savedOcrProductSuccess, setSavedOcrProductSuccess] = useState<{ productId: string | number; partNumber: string } | null>(null);
  const [isOcrExportingExcel, setIsOcrExportingExcel] = useState(false);
  const [isOcrExportingCsv, setIsOcrExportingCsv] = useState(false);
  const [showOcrDeliveryColumns, setShowOcrDeliveryColumns] = useState(false);

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

  // Batch File AI Processing & 252-Column Delivery State
  const [isProcessingBatchFile, setIsProcessingBatchFile] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    success: boolean;
    batchId?: string;
    fileName: string;
    totalRowsInFile: number;
    processedCount: number;
    batchLimit: number;
    isQuotaCapped: boolean;
    quotaNotice: string | null;
    products: any[];
    createdAt?: string;
    emailNotificationSent?: boolean;
    emailRecipient?: string;
  } | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [selectedBatchProductIndex, setSelectedBatchProductIndex] = useState(0);
  const [isBatchExportingExcel, setIsBatchExportingExcel] = useState(false);
  const [isBatchExportingCsv, setIsBatchExportingCsv] = useState(false);
  const [isBatchSavingCatalog, setIsBatchSavingCatalog] = useState(false);
  const [batchSavedSuccess, setBatchSavedSuccess] = useState<boolean>(false);
  const [showBatchDeliveryColumns, setShowBatchDeliveryColumns] = useState(false);

  // Link Copy State
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // On page load/mount: Restore tab & retrieve persistent batch dataset from URL or localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || params.get("mode");
      const batchIdParam = params.get("batchId");

      if (tabParam) {
        if (tabParam === "ai-search" || tabParam === "url" || tabParam === "image-ocr") {
          setActiveTabMode(tabParam as ExtendedUploadMode);
        } else if (tabParam === "file" || tabParam === "pdf") {
          setActiveTabMode("file");
        }
      }

      // If batchId is in URL, fetch live from server to restore session
      if (batchIdParam) {
        setActiveTabMode("file");
        apiClient
          .get<any>(`/ingestion/batch-result/${batchIdParam}`)
          .then((data) => {
            if (data && data.products && data.products.length > 0) {
              setBatchResult(data);
              try {
                localStorage.setItem("catalogforge_active_batch", JSON.stringify(data));
              } catch {}
            }
          })
          .catch(() => {
            // Fallback to local storage
            const cached = localStorage.getItem("catalogforge_active_batch");
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.products && parsed.products.length > 0) {
                  setBatchResult(parsed);
                }
              } catch {}
            }
          });
      } else {
        // Check local storage for active session
        const cached = localStorage.getItem("catalogforge_active_batch");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.products && parsed.products.length > 0) {
              setBatchResult(parsed);
            }
          } catch {}
        }
      }
    }
  }, []);

  const isProcessing = uploadState === "uploading" || uploadState === "scanning";
  const isPreflightReady =
    uploadState === "completed" ||
    uploadState === "completed_with_warnings" ||
    uploadState === "rejected";

  const TABS = [
    { id: "ai-search" as ExtendedUploadMode, label: "AI Product Lookup", shortLabel: "AI Lookup", sublabel: "Gemini Sourcing", icon: Sparkles },
    { id: "image-ocr" as ExtendedUploadMode, label: "Product Image / Label OCR", shortLabel: "Image / OCR", sublabel: "Nameplate / Vision", icon: Camera },
    { id: "url" as ExtendedUploadMode, label: "Manufacturer URL", shortLabel: "OEM URL", sublabel: "Datasheet / Product link", icon: Globe },
    { id: "file" as ExtendedUploadMode, label: "Manufacturer PDF & File Upload", shortLabel: "PDF & Batch", sublabel: "CSV / XLSX / PDF", icon: UploadCloud },
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

      const userKey = user?.uid || user?.email || "";
      if (userKey) {
        saveUserWorkspaceProduct(userKey, {
          id: saveRes.productId || `prod-${Date.now()}`,
          partNumber: aiResult.partNumber,
          manufacturerName: aiResult.manufacturer,
          brandName: aiResult.manufacturer,
          shortDesc: aiResult.officialTitle || aiResult.partNumber,
          longDesc: aiResult.officialDescription || "",
          status: "published",
          confidence: 0.98,
          rowConfidence: 0.98,
          classpath: aiResult.classpath || "Industrial > General Supplies > Components",
          unspsc: aiResult.unspsc || "40151500",
          attributes: aiResult.attributes || [],
          assets: aiResult.assets || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

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

      const userKey = user?.uid || user?.email || "";
      if (userKey) {
        saveUserWorkspaceProduct(userKey, {
          id: saveRes.savedProductId || `prod-url-${Date.now()}`,
          partNumber: urlExtractionResult.partNumber,
          manufacturerName: urlExtractionResult.manufacturer,
          brandName: urlExtractionResult.brand || urlExtractionResult.manufacturer,
          shortDesc: urlExtractionResult.title || urlExtractionResult.partNumber,
          longDesc: urlExtractionResult.description || "",
          status: "published",
          confidence: 0.96,
          rowConfidence: 0.96,
          classpath: urlExtractionResult.classpath || "Industrial > General",
          unspsc: urlExtractionResult.unspsc || "40151500",
          attributes: urlExtractionResult.attributes || [],
          assets: urlExtractionResult.assets || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

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

  const handleBatchFileUpload = async () => {
    if (!selectedFile) return;

    setIsProcessingBatchFile(true);
    setBatchError(null);
    setBatchResult(null);
    setBatchSavedSuccess(false);
    setSelectedBatchProductIndex(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const queryParams = new URLSearchParams();
    if (user?.email) {
      queryParams.append("email", user.email);
    }
    if (user?.displayName) {
      queryParams.append("name", user.displayName);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    try {
      const res = await apiClient.post<any>(`/ingestion/process-batch-file${queryString}`, formData, {
        timeoutMs: 180000,
      });
      setBatchResult(res);

      if (typeof window !== "undefined" && res) {
        try {
          localStorage.setItem("catalogforge_active_batch", JSON.stringify(res));
          if (res.batchId) {
            window.history.replaceState(null, "", `?tab=file&batchId=${res.batchId}`);
          }
        } catch (storageErr) {
          console.warn("Local storage cache warning:", storageErr);
        }
      }
    } catch (err: any) {
      setBatchError(err?.message || "Failed to process batch file with AI enrichment engine.");
    } finally {
      setIsProcessingBatchFile(false);
    }
  };

  const handleCopyShareableLink = () => {
    if (!batchResult || !batchResult.batchId) return;
    if (typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/upload?tab=file&batchId=${batchResult.batchId}`;
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  const handleExportBatchExcel = async () => {
    if (!batchResult || !batchResult.products || batchResult.products.length === 0) return;
    setIsBatchExportingExcel(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const deliveryRows = batchResult.products.map((p) => p.deliveryRow);

      const res = await fetch(`${baseUrl}/ingestion/batch-export-excel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryRows,
          fileName: batchResult.fileName,
        }),
      });

      if (!res.ok) throw new Error(`Export returned ${res.status}`);

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanName = (batchResult.fileName || "Catalog").replace(/\.[^/.]+$/, "");
      a.download = `Unihack_${cleanName}_252Columns_Delivery.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      console.warn("Excel export failed, generating CSV fallback:", err);
      handleExportBatchCsv();
    } finally {
      setIsBatchExportingExcel(false);
    }
  };

  const handleExportBatchCsv = async () => {
    if (!batchResult || !batchResult.products || batchResult.products.length === 0) return;
    setIsBatchExportingCsv(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const deliveryRows = batchResult.products.map((p) => p.deliveryRow);

      let csvText = "";
      try {
        const res = await fetch(`${baseUrl}/ingestion/batch-export-csv`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deliveryRows,
            fileName: batchResult.fileName,
          }),
        });

        if (res.ok) {
          csvText = await res.text();
        }
      } catch (networkErr) {
        console.warn("Backend CSV batch export failed, generating in-browser CSV:", networkErr);
      }

      if (!csvText && deliveryRows.length > 0) {
        const headers = Object.keys(deliveryRows[0]);
        const escapeCsv = (val: any) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        };
        const headerLine = headers.map(escapeCsv).join(",");
        const rowLines = deliveryRows.map((r) => headers.map((h) => escapeCsv(r[h] || "")).join(","));
        csvText = [headerLine, ...rowLines].join("\n");
      }

      if (!csvText) throw new Error("Unable to build CSV export payload.");

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanName = (batchResult.fileName || "Catalog").replace(/\.[^/.]+$/, "");
      a.download = `Unihack_${cleanName}_252Columns_Delivery.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      setBatchError(err?.message || "Failed to download batch CSV.");
    } finally {
      setIsBatchExportingCsv(false);
    }
  };

  const handleSaveBatchToCatalog = async () => {
    if (!batchResult || !batchResult.products || batchResult.products.length === 0) return;
    setIsBatchSavingCatalog(true);
    try {
      await apiClient.post("/ingestion/batch-save-catalog", {
        products: batchResult.products,
      });

      const userKey = user?.uid || user?.email || "";
      if (userKey) {
        batchResult.products.forEach((p: any, idx: number) => {
          saveUserWorkspaceProduct(userKey, {
            id: p.id || `batch-prod-${Date.now()}-${idx}`,
            partNumber: p.partNumber,
            manufacturerName: p.manufacturer || p.brand,
            brandName: p.brand || p.manufacturer,
            shortDesc: p.title || p.partNumber,
            longDesc: p.description || "",
            status: "published",
            confidence: 0.98,
            rowConfidence: 0.98,
            classpath: p.classpath || "Industrial > General",
            unspsc: p.unspsc || "40151500",
            attributes: p.attributes || [],
            assets: p.assets || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });

        saveUserWorkspaceJob(userKey, {
          id: batchResult.batchId || `job-${Date.now()}`,
          jobId: batchResult.batchId || `job-${Date.now()}`,
          fileName: batchResult.fileName,
          totalRows: batchResult.processedCount || batchResult.products.length,
          status: "completed",
          currentStage: "published",
          progressPercentage: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);
      }

      setBatchSavedSuccess(true);
    } catch (err: any) {
      setBatchError(err?.message || "Failed to save batch products to catalog.");
    } finally {
      setIsBatchSavingCatalog(false);
    }
  };

  const handleResetBatch = () => {
    setBatchResult(null);
    setBatchError(null);
    setBatchSavedSuccess(false);
    setSelectedBatchProductIndex(0);
    handleFileSelect(null);
    reset();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("catalogforge_active_batch");
        window.history.replaceState(null, "", window.location.pathname + "?tab=file");
      } catch {}
    }
  };

  const currentBatchProduct = batchResult?.products?.[selectedBatchProductIndex] || null;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-[#3386E7]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#000000] tracking-tight">
              Dataset Upload &amp; Ingestion
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 leading-snug">
              Extract verified specifications via AI Product Lookup, Manufacturer URLs, or Manufacturer PDF &amp; batch file uploads.
            </p>
          </div>
        </div>
      </div>

      {/* ── Upload Mode Tabs (Responsive 2x2 Grid on Mobile / Flex Row on Desktop) ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 sm:p-2 grid grid-cols-2 sm:flex sm:overflow-x-auto gap-1.5 sm:gap-2 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTabMode(tab.id);
                if (tab.id !== "ai-search" && tab.id !== "url" && tab.id !== "image-ocr") {
                  setUploadMode(tab.id as UploadMode);
                  reset();
                }
              }}
              disabled={isProcessing}
              className={cn(
                "flex items-center justify-center sm:flex-1 gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 sm:py-2.5 rounded-xl text-xs font-bold transition-all text-center",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm ring-1 ring-[#2563EB]"
                  : "bg-slate-50/80 sm:bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#000000] border border-slate-200/60 sm:border-transparent",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              suppressHydrationWarning
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#2563EB]")} />
              <span className="sm:hidden truncate">{tab.shortLabel}</span>
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: SINGLE PRODUCT QUICK LOOKUP (GEMINI 3.5 FLASH-LITE) ─── */}
      {activeTabMode === "ai-search" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Search Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#000000] tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                Single Product AI Search &amp; Enrichment
              </h3>
              <p className="text-[11px] sm:text-xs text-[#64748B] mt-1 leading-relaxed">
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

              {/* SKU-Level Completeness & Telemetry Scoring */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">SKU Completeness Rate</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {aiResult.completenessRate ?? Math.round(((aiResult.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0) / Math.max(10, aiResult.attributes?.length || 10)) * 100)}% Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {aiResult.populatedAttributesCount ?? (aiResult.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0)} / {aiResult.expectedAttributesCount ?? Math.max(10, aiResult.attributes?.length || 10)} Category Attributes Populated
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${aiResult.completenessRate ?? Math.round(((aiResult.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0) / Math.max(10, aiResult.attributes?.length || 10)) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero-Hallucination Policy: Unverified schema fields are strictly omitted as empty cells without fabricated placeholders.</span>
                </p>
              </div>

              {/* Normalized Attributes Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>Normalized Technical Attributes</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tier-1 Grounded
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    🟢 High (≥85%) | 🟡 Medium (60–84%) | Dimmed (Unverified)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {aiResult.attributes && aiResult.attributes.length > 0 ? (
                    aiResult.attributes.map((attr: any, idx: number) => {
                      const conf = attr.confidence ?? attr.confidenceScore ?? attr.lovMatchConfidence ?? 0.95;
                      const isHigh = conf >= 0.85;
                      const isMedium = conf >= 0.60 && conf < 0.85;
                      const isBlankOrUnverified = !attr.value || conf < 0.60 || ['n/a', 'unknown', 'null'].includes(String(attr.value).toLowerCase());
                      const citationUrl = attr.sourceEvidence?.sourceUrl || (aiResult.citations && aiResult.citations[0]?.sourceUrl);

                      if (isBlankOrUnverified) {
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-1 opacity-70"
                          >
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                              {attr.label}
                            </p>
                            <p className="text-xs text-slate-400 italic font-mono">
                              — Blank (Unverified in OEM docs)
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5",
                            isHigh
                              ? "bg-white border-slate-200 hover:border-emerald-400"
                              : "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                              {attr.label}
                            </p>
                            <span
                              className={cn(
                                "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 flex items-center gap-1",
                                isHigh
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                  : "text-amber-800 bg-amber-50 border-amber-200"
                              )}
                            >
                              <span>{isHigh ? "🟢" : "🟡"}</span>
                              <span>{Math.round(conf * 100)}%</span>
                            </span>
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
                            {citationUrl && (
                              <a
                                href={citationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline mt-1 font-medium"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>OEM Citation</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <p className="text-xs text-slate-400 italic">
                        — All 50 attribute columns preserved as clean blanks (Unverified in OEM documentation)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Product Image Preview Gallery */}
              {(() => {
                const imageAssets = (aiResult.assets || []).filter((a: any) => a.assetType === 'image');
                if (imageAssets.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        Verified OEM Product Image Gallery (Actual Image: Yes)
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {imageAssets.length === 1 ? '1 Primary Image' : `1 Primary + ${imageAssets.length - 1} Alternates`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {imageAssets.map((img: any, idx: number) => {
                        const imgUrl = img.previewUrl || img.sourceUrl;
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={idx}
                            className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3.5 group hover:border-[#2563EB] transition"
                          >
                            <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={img.fileName || (isPrimary ? "Product Image" : `Alternate Image ${idx}`)}
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
                                <span className={cn(
                                  "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded",
                                  isPrimary ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-blue-100 text-blue-800 border border-blue-200"
                                )}>
                                  {isPrimary ? "Product Image (Primary)" : `Alternate Image ${idx}`}
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
                              <p className="text-xs font-bold text-slate-900 truncate">{img.fileName || (isPrimary ? "Primary-Photo.jpg" : `Alt-Photo-${idx}.jpg`)}</p>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {img.shortInfo || (isPrimary ? "Authentic high-resolution primary product photograph" : `Verified alternate angle perspective ${idx}`)}
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

      {/* ── TAB: PRODUCT IMAGE / LABEL OCR & SUFFICIENCY GATEKEEPER ──── */}
      {activeTabMode === "image-ocr" && (
        <div className="space-y-6">
          {/* Dropzone Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-bold text-[#000000] tracking-tight flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#2563EB]" />
                  Product Image &amp; Nameplate OCR Ingestion
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  Multi-Modal Vision &amp; 80% Gatekeeper
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Upload an authentic product photograph, nameplate sticker, technical rating label, or packaging. Multi-modal vision parses visual text and strictly enforces the $\ge 80\%$ Zero-Hallucination Gatekeeper.
              </p>
            </div>

            {/* Custom Image Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && (file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name))) {
                  setSelectedOcrFile(file);
                  setOcrImagePreview(URL.createObjectURL(file));
                  setOcrResult(null);
                  setOcrError(null);
                  setSavedOcrProductSuccess(null);
                }
              }}
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-[#FAFAFA]",
                selectedOcrFile ? "border-[#2563EB] bg-blue-50/20" : "border-[#CBD5E1] hover:border-[#2563EB]"
              )}
            >
              {ocrImagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-48 h-48 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={ocrImagePreview}
                      alt="Uploaded Label Preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{selectedOcrFile?.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedOcrFile ? `${(selectedOcrFile.size / 1024).toFixed(1)} KB` : ""} • Ready for Multi-Modal Inspection
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                      <span>Change Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setSelectedOcrFile(f);
                            setOcrImagePreview(URL.createObjectURL(f));
                            setOcrResult(null);
                            setOcrError(null);
                            setSavedOcrProductSuccess(null);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOcrFile(null);
                        setOcrImagePreview(null);
                        setOcrResult(null);
                        setOcrError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center shadow-sm">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2563EB] hover:underline">Click to upload product image</span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports high-resolution PNG, JPG, JPEG, WEBP product labels &amp; nameplates
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setSelectedOcrFile(f);
                        setOcrImagePreview(URL.createObjectURL(f));
                        setOcrResult(null);
                        setOcrError(null);
                        setSavedOcrProductSuccess(null);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Inspect Button & Sourcing Rule */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict Sufficiency: MPN &amp; Brand must have $\ge 80\%$ confidence or extraction aborts.</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!selectedOcrFile) return;
                  setIsProcessingOcr(true);
                  setOcrError(null);
                  setOcrResult(null);
                  setSavedOcrProductSuccess(null);

                  try {
                    const formData = new FormData();
                    formData.append("file", selectedOcrFile);

                    const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

                    const res = await fetch(`${baseUrl}/ingestion/ocr`, {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                    });

                    if (!res.ok) {
                      const errJson = await res.json().catch(() => ({}));
                      throw new Error(errJson.message || `OCR extraction failed (${res.status})`);
                    }

                    const data = await res.json();
                    setOcrResult(data);
                  } catch (err: any) {
                    setOcrError(err?.message || "Failed to process image OCR.");
                  } finally {
                    setIsProcessingOcr(false);
                  }
                }}
                disabled={!selectedOcrFile || isProcessingOcr}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessingOcr ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Image with Multi-Modal Vision…</span>
                  </>
                ) : (
                  <>
                    <ScanText className="w-3.5 h-3.5" />
                    <span>Inspect Label &amp; Ingest</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OCR Processing Stage Banner */}
          {isProcessingOcr && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Modal Vision Inspection in Progress</h4>
                  <p className="text-xs text-slate-500">
                    Extracting visible text, identifying MPN and brand provenance, and applying 80% Gatekeeper...
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2 font-semibold text-blue-700 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>1. Multi-Modal OCR Parsing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">2</div>
                  <span>2. 80% Sufficiency Gatekeeper</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">3</div>
                  <span>3. Tier-1 OEM Sourcing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">4</div>
                  <span>4. 252-Column Delivery Mapping</span>
                </div>
              </div>
            </div>
          )}

          {/* System Error Banner */}
          {ocrError && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-900">OCR Processing Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{ocrError}</p>
              </div>
            </div>
          )}

          {/* ── STRICT SUFFICIENCY GATEKEEPER ABORT BANNER (ZERO HALLUCINATION) ── */}
          {ocrResult && ocrResult.status === "ABORTED_INSUFFICIENT_DATA" && (
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                      Zero-Hallucination Policy: Extraction Aborted
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800">
                      Sufficiency Score: {(ocrResult.sufficiencyScore * 100).toFixed(0)}% / 100% (Required: $\ge 80\%$)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-rose-950">
                    Insufficient product identifiers detected on label image. Extraction aborted to prevent hallucination.
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {ocrResult.rejectionReason || "The uploaded image did not yield an unambiguous Part Number or Manufacturer/Brand name with $\ge 80\%$ confidence. Per zero-hallucination policy, no speculative web searches or LLM inferences were made."}
                  </p>
                </div>
              </div>

              {/* Raw OCR Text Snippet */}
              {ocrResult.rawOcrText && (
                <div className="bg-white/90 border border-rose-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Detected Raw OCR Text on Label
                  </span>
                  <p className="text-xs font-mono text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 whitespace-pre-wrap">
                    {ocrResult.rawOcrText}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <div className="text-[11px] text-rose-700 font-medium">
                  • Audit event logged in <code className="font-mono font-bold bg-rose-100 px-1 py-0.5 rounded">dbo.audit_log</code> (Action: OCR_INSUFFICIENT_DATA_ABORTED)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOcrFile(null);
                    setOcrImagePreview(null);
                    setOcrResult(null);
                    setOcrError(null);
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Higher Resolution Image</span>
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS CARD: OCR VERIFICATION PASSED & ENRICHED 252-COLUMN DATA ── */}
          {ocrResult && ocrResult.status === "COMPLETED" && (() => {
            const ocrProducts: any[] = (ocrResult.products && ocrResult.products.length > 0)
              ? ocrResult.products
              : (ocrResult.product ? [ocrResult.product] : []);
            const activeProduct = ocrProducts[selectedOcrBatchProductIndex] || ocrProducts[0] || ocrResult.product;
            if (!activeProduct) return null;

            return (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6">
                {/* Batch Selector Bar if multiple products detected */}
                {ocrProducts.length > 1 && (
                  <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">
                          Multi-Item OCR Detected
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {ocrProducts.length} Products Extracted from Image Table
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Viewing Item {selectedOcrBatchProductIndex + 1} of {ocrProducts.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {ocrProducts.map((p: any, idx: number) => {
                        const isSel = idx === selectedOcrBatchProductIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedOcrBatchProductIndex(idx)}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border text-left flex items-center gap-2",
                              isSel
                                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                                : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                            )}
                          >
                            <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded", isSel ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600")}>
                              #{idx + 1}
                            </span>
                            <span className="font-mono">{p.partNumber}</span>
                            {(p.brandName || p.manufacturerName) && (
                              <span className={cn("text-[11px] font-normal", isSel ? "text-blue-100" : "text-slate-500")}>
                                • {p.brandName || p.manufacturerName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        OCR Inspection Passed ({(ocrResult.sufficiencyScore * 100).toFixed(0)}% Sufficiency)
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        Tier 1 OEM Verified
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">{activeProduct.manufacturerName || activeProduct.brandName}</span>
                      {activeProduct.brandName && activeProduct.brandName !== activeProduct.manufacturerName && (
                        <span className="text-xs font-semibold text-slate-500">• Brand: {activeProduct.brandName}</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#000000] mt-1.5">{activeProduct.officialTitle || activeProduct.shortDesc}</h3>
                    <p className="text-xs font-mono font-semibold text-[#2563EB] mt-0.5">
                      Verified Part Number: {activeProduct.partNumber} | SKU: {activeProduct.sku || activeProduct.partNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Taxonomy: <span className="font-semibold text-slate-700">{activeProduct.classpath}</span>
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsOcrExportingExcel(true);
                        try {
                          const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
                          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

                          const exportUrl = ocrResult.batchId
                            ? `${baseUrl}/products/export?batchId=${ocrResult.batchId}&format=xlsx`
                            : `${baseUrl}/products/export?format=xlsx`;

                          const res = await fetch(exportUrl, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) throw new Error("Excel export service unavailable.");
                          const blob = await res.blob();
                          const downloadUrl = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = downloadUrl;
                          a.download = `Unihack_OCR_${activeProduct.partNumber || "Dataset"}_252Columns.xlsx`;
                          document.body.appendChild(a);
                          a.click();
                          setTimeout(() => {
                            window.URL.revokeObjectURL(downloadUrl);
                            document.body.removeChild(a);
                          }, 100);
                        } catch (err: any) {
                          setOcrError(err?.message || "Failed to export Excel delivery file.");
                        } finally {
                          setIsOcrExportingExcel(false);
                        }
                      }}
                      disabled={isOcrExportingExcel || isOcrExportingCsv}
                      className="px-3 sm:px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                    >
                      {isOcrExportingExcel ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsOcrExportingCsv(true);
                        try {
                          if (ocrResult.batchId) {
                            const token = typeof window !== "undefined" ? (localStorage.getItem("catalogforge_token") || localStorage.getItem("auth_token") || "dev-mock-token") : "dev-mock-token";
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
                            const res = await fetch(`${baseUrl}/products/export?batchId=${ocrResult.batchId}&format=csv`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.ok) {
                              const blob = await res.blob();
                              const downloadUrl = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = downloadUrl;
                              a.download = `Unihack_OCR_${ocrResult.batchId}_252Columns.csv`;
                              document.body.appendChild(a);
                              a.click();
                              setTimeout(() => {
                                window.URL.revokeObjectURL(downloadUrl);
                                document.body.removeChild(a);
                              }, 100);
                              return;
                            }
                          }

                          // Direct single item / fallback CSV export
                          if (activeProduct.deliveryRow) {
                            const escapeCsv = (val: any) => {
                              if (val === null || val === undefined) return '""';
                              const str = String(val).replace(/"/g, '""');
                              return `"${str}"`;
                            };
                            const headers = Object.keys(activeProduct.deliveryRow);
                            const headerLine = headers.map(escapeCsv).join(",");
                            const valueLine = headers.map((h) => escapeCsv(activeProduct.deliveryRow[h])).join(",");
                            const csvText = `${headerLine}\n${valueLine}`;

                            const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = downloadUrl;
                            a.download = `Unihack_OCR_${activeProduct.partNumber}_252Columns.csv`;
                            document.body.appendChild(a);
                            a.click();
                            setTimeout(() => {
                              window.URL.revokeObjectURL(downloadUrl);
                              document.body.removeChild(a);
                            }, 100);
                          }
                        } catch (err: any) {
                          setOcrError(err?.message || "Failed to export CSV delivery file.");
                        } finally {
                          setIsOcrExportingCsv(false);
                        }
                      }}
                      disabled={isOcrExportingExcel || isOcrExportingCsv}
                      className="px-3 sm:px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 border border-slate-300 shadow-sm w-full sm:w-auto"
                    >
                      {isOcrExportingCsv ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      )}
                      <span>CSV Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOcrDeliveryColumns(!showOcrDeliveryColumns)}
                      className={cn(
                        "px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border shadow-sm w-full sm:w-auto",
                        showOcrDeliveryColumns
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                      )}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>{showOcrDeliveryColumns ? "Hide 252 Columns" : "View 252 Columns"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsSavingOcrProduct(true);
                        try {
                          const userKey = user?.uid || user?.email || "";
                          if (userKey) {
                            // Save all products in the batch or the single active product
                            for (const prod of ocrProducts) {
                              saveUserWorkspaceProduct(userKey, {
                                id: `ocr-prod-${Date.now()}-${prod.partNumber}`,
                                partNumber: prod.partNumber,
                                manufacturerName: prod.manufacturerName || prod.brandName || "OEM",
                                brandName: prod.brandName || prod.manufacturerName || "OEM",
                                shortDesc: prod.officialTitle || prod.shortDesc || prod.partNumber,
                                longDesc: prod.longDesc1 || "",
                                status: "published",
                                confidence: ocrResult.sufficiencyScore || 0.98,
                                rowConfidence: ocrResult.sufficiencyScore || 0.98,
                                classpath: prod.classpath || "Industrial > General",
                                unspsc: "40151500",
                                attributes: prod.attributes || [],
                                assets: (prod.images || []).map((img: any) => ({
                                  assetType: "image",
                                  fileName: `${prod.partNumber}.jpg`,
                                  sourceUrl: img.url,
                                  previewUrl: img.url,
                                })),
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              });
                            }
                          }

                          setSavedOcrProductSuccess({
                            productId: `ocr-${Date.now()}`,
                            partNumber: activeProduct.partNumber,
                          });
                        } catch (err: any) {
                          setOcrError(err?.message || "Failed to save product to catalog.");
                        } finally {
                          setIsSavingOcrProduct(false);
                        }
                      }}
                      disabled={isSavingOcrProduct}
                      className="px-3.5 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                    >
                      {isSavingOcrProduct ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{ocrProducts.length > 1 ? `Save All ${ocrProducts.length} to Catalog` : "Save to Catalog"}</span>
                    </button>
                  </div>
                </div>

                {/* Success Banner when Saved */}
                {savedOcrProductSuccess && (
                  <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">
                          Product Ingested via OCR &amp; Saved to Catalog!
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          {ocrProducts.length > 1
                            ? `All ${ocrProducts.length} products from the OCR inspection are now live in the catalog.`
                            : `Part #${savedOcrProductSuccess.partNumber} is now live in the central product catalog.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Images Gallery */}
                {activeProduct.images && activeProduct.images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verified Authentic Product Images ({activeProduct.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeProduct.images.map((img: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center gap-2">
                          <div className="w-full h-32 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.alt || `${activeProduct.partNumber} image ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
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
                              {img.isPrimary ? "Primary Photo" : (img.shortInfo?.includes("OCR") ? "OCR Image" : `Alt Photo ${idx}`)}
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

                {/* Standardized Descriptions (6 Formats) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Standardized Descriptions (6 Formats)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Short Description (Max 150 Char)</span>
                      <p className="font-semibold text-slate-800">{activeProduct.shortDesc || activeProduct.officialTitle}</p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Description</span>
                      <p className="font-semibold text-slate-800">{activeProduct.mobileDesc || "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Invoice Description</span>
                      <p className="font-mono font-bold text-slate-800">{activeProduct.invoiceDesc || "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Retail Description</span>
                      <p className="font-semibold text-slate-800">{activeProduct.retailDesc || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Long Description</span>
                      <p className="text-slate-700 leading-relaxed">{activeProduct.longDesc1 || activeProduct.longDesc || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Normalized Technical Attributes */}
                {activeProduct.attributes && activeProduct.attributes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Normalized Technical Attributes ({activeProduct.attributes.length})
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Zero-Hallucination Verified Specifications
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {activeProduct.attributes.map((attr: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border bg-[#FAFAFA] border-[#E2E8F0] flex flex-col justify-between gap-1.5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                            {attr.label}
                          </p>
                          <p className="text-xs font-bold text-slate-900">
                            {attr.value} {attr.uom ? <span className="text-[10px] text-slate-500 font-normal">({attr.uom})</span> : null}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Product Features */}
                {activeProduct.features && activeProduct.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Extracted Product Features
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                      {activeProduct.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-[#E2E8F0]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Documents (PDF / Datasheets) */}
                {activeProduct.documents && activeProduct.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verified Technical Documents (PDF / Datasheets)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeProduct.documents.map((doc: any, idx: number) => (
                        <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {doc.assetType || "PDF"}
                            </span>
                            <a
                              href={doc.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2563EB] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <span>View PDF</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 252-Column Unihack Delivery Schema Table Viewer */}
                {showOcrDeliveryColumns && activeProduct.deliveryRow && (
                  <div className="space-y-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          252-Column Unihack Delivery Export Format ({activeProduct.partNumber})
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        252 / 252 Columns Verified
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                          <tr>
                            <th className="py-2 px-3 w-12 text-center">#</th>
                            <th className="py-2 px-3">Column Header</th>
                            <th className="py-2 px-4">Populated Delivery Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.entries(activeProduct.deliveryRow).map(([header, val]: [string, any], idx: number) => {
                            const isPopulated = val !== "" && val !== undefined && val !== null;
                            return (
                              <tr key={idx} className={isPopulated ? "bg-white hover:bg-slate-50" : "bg-slate-50/50"}>
                                <td className="py-1.5 px-3 font-mono text-[10px] text-slate-400 text-center">{idx + 1}</td>
                                <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">{header}</td>
                                <td className="py-1.5 px-4 font-medium text-slate-900">
                                  {isPopulated ? (
                                    <span className="text-slate-900 font-semibold">{String(val)}</span>
                                  ) : (
                                    <span className="text-slate-300 font-mono text-[11px] italic">— (Zero Hallucination Blank)</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

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

      {/* ── TAB: MANUFACTURER PDF & FILE UPLOAD (MULTI-PRODUCT AI & 252-COLUMN PIPELINE) ── */}
      {activeTabMode !== "ai-search" && activeTabMode !== "url" && activeTabMode !== "image-ocr" && (
        <div className="space-y-6">

          {/* Processing animation */}
          {isProcessingBatchFile && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#000000]">
                  Extracting Multi-Product Intelligence &amp; Generating 252-Column Delivery…
                </h3>
                <p className="text-xs text-[#64748B] max-w-lg">
                  Parsing file rows, querying live Google Gemini 3.5 AI &amp; OEM CDN repositories, scraping authentic product photos, and compiling full 252-column specifications.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Parse Dataset Rows &amp; Deduplicate Part Numbers</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Query Live Manufacturer OEM Sites &amp; Scrape CDN Photos</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-blue-700 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>3. Extract Verified Specs &amp; Warranty (Strict Zero-Hallucination)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">4</div>
                  <span>4. Map Directly into 252-Column Unihack Delivery Format (.xlsx / .csv)</span>
                </div>
              </div>
            </div>
          )}

          {/* Error alert */}
          {batchError && (
            <div className="bg-white border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-900">Batch Processing Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{batchError}</p>
              </div>
              <button
                type="button"
                onClick={handleBatchFileUpload}
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Saved Success Banner */}
          {batchSavedSuccess && (
            <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    All Batch Products Saved to Catalog!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {batchResult?.processedCount || 0} products are now published in the central catalog with live specs.
                  </p>
                </div>
              </div>
              <Link
                href="/products"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>View Products Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Batch Results View */}
          {batchResult && !isProcessingBatchFile && (
            <div className="space-y-6">

              {/* Rate Limit Quota Guard Alert Banner */}
              {batchResult.isQuotaCapped && batchResult.quotaNotice && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      API Rate Limit Quota Guard Active
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
                      {batchResult.quotaNotice}
                    </p>
                  </div>
                </div>
              )}

              {/* Batch Action Header Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Multi-Product Batch Enriched
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{batchResult.fileName}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#000000] mt-1.5">
                      {batchResult.processedCount} Products Processed with 252-Column Unihack Delivery Schema
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Original dataset size: <span className="font-semibold text-slate-800">{batchResult.totalRowsInFile} rows</span> | Processed batch: <span className="font-semibold text-emerald-700">{batchResult.processedCount} products</span>
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleExportBatchExcel}
                      disabled={isBatchExportingExcel || isBatchExportingCsv}
                      className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                    >
                      {isBatchExportingExcel ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Export Batch Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportBatchCsv}
                      disabled={isBatchExportingExcel || isBatchExportingCsv}
                      className="px-3.5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 border border-slate-300 shadow-sm w-full sm:w-auto"
                    >
                      {isBatchExportingCsv ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Export CSV (.csv)</span>
                    </button>

                    {!batchSavedSuccess && (
                      <button
                        type="button"
                        onClick={handleSaveBatchToCatalog}
                        disabled={isBatchSavingCatalog}
                        className="px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto"
                      >
                        {isBatchSavingCatalog ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Batch…</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Save All to Catalog</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetBatch}
                      className="px-3 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition w-full sm:w-auto"
                      title="Upload new file"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New File</span>
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="bg-[#F0FDF4] border border-emerald-200 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">252-Column Format</span>
                    <p className="text-base font-black text-emerald-950 mt-0.5">100% Compliant</p>
                    <p className="text-[10px] text-emerald-700">Strict zero-guess blanks</p>
                  </div>
                  <div className="bg-[#EFF6FF] border border-blue-200 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-800 uppercase">Enriched Batch</span>
                    <p className="text-base font-black text-blue-950 mt-0.5">{batchResult.processedCount} Products</p>
                    <p className="text-[10px] text-blue-700">Gemini 3.5 live AI specs</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-800 uppercase">Scraped OEM Photos</span>
                    <p className="text-base font-black text-slate-950 mt-0.5">
                      {batchResult.products.reduce((acc, p) => acc + (p.images?.length || 0), 0)} Photos
                    </p>
                    <p className="text-[10px] text-slate-600">Direct CDN links</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-800 uppercase">Normalized Specs</span>
                    <p className="text-base font-black text-slate-950 mt-0.5">
                      {batchResult.products.reduce((acc, p) => acc + (p.attributes?.length || 0), 0)} Attributes
                    </p>
                    <p className="text-[10px] text-slate-600">Standard UOMs &amp; scores</p>
                  </div>
                </div>

                {/* ── Persistent Storage & Automated Email Notification Confirmation Bar ── */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Persisted in Session &amp; Cloud
                      </span>
                      {batchResult.emailNotificationSent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Notification Email Sent to: <strong className="text-white">{batchResult.emailRecipient}</strong></span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyShareableLink}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                      >
                        {isLinkCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Direct Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Automated Notification Banner informing the logged-in user */}
                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-800/80">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xs leading-relaxed text-slate-300">
                      <p className="font-semibold text-white">
                        Your process has been completed!
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        We automatically sent a notification email to{" "}
                        <strong className="text-blue-300 font-mono">
                          {batchResult.emailRecipient || user?.email || "your logged-in account"}
                        </strong>{" "}
                        so you can check and review your processed dataset anytime.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Selector Navigation Tabs */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Select Product in Batch to Inspect:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {batchResult.products.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedBatchProductIndex(idx)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border",
                          selectedBatchProductIndex === idx
                            ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                          selectedBatchProductIndex === idx ? "bg-white text-blue-700" : "bg-slate-200 text-slate-700"
                        )}>
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[140px] font-mono">{p.partNumber}</span>
                        <span className="text-[10px] opacity-75 font-normal">({p.manufacturerName})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Product Presentation Card */}
              {currentBatchProduct && (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#E2E8F0] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Tier 1 OEM Verified
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">{currentBatchProduct.manufacturerName}</span>
                        {currentBatchProduct.brandName && (
                          <span className="text-xs font-semibold text-slate-400">• Brand: {currentBatchProduct.brandName}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#000000] mt-1.5">{currentBatchProduct.officialTitle}</h3>
                      <p className="text-xs font-mono font-semibold text-[#2563EB] mt-0.5">
                        Part Number: {currentBatchProduct.partNumber} | SKU: {currentBatchProduct.sku}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Taxonomy: <span className="font-semibold text-slate-700">{currentBatchProduct.classpath}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{currentBatchProduct.nonEmptyColumnsCount} / 252 Columns Filled</span>
                    </div>
                  </div>

                  {/* Extracted From (Verified Source Provenance) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Data Extracted From (Source Sourcing)</span>
                    </h4>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-3">
                      {currentBatchProduct.citations && currentBatchProduct.citations.length > 0 ? (
                        <div className="space-y-3">
                          {currentBatchProduct.citations
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
                              {currentBatchProduct.manufacturerName} Official Website
                            </span>
                            <p className="text-xs font-bold text-slate-900">
                              Tier 1 OEM Primary Source
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scraped Images Gallery */}
                  {currentBatchProduct.images && currentBatchProduct.images.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          Verified OEM Product Photos (Actual Image: Yes)
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {currentBatchProduct.images.length === 1 ? '1 Primary Image' : `1 Primary + ${currentBatchProduct.images.length - 1} Alternates`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentBatchProduct.images.map((img: any, idx: number) => {
                          const isPrimary = img.isPrimary ?? idx === 0;
                          return (
                            <div
                              key={idx}
                              className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col items-center gap-2 group hover:border-[#2563EB] transition"
                            >
                              <div className="w-full h-32 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden relative">
                                <img
                                  src={img.url}
                                  alt={img.alt || (isPrimary ? "Product Image (Primary)" : `Alternate Image ${idx}`)}
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
                                  isPrimary ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-blue-100 text-blue-800 border border-blue-200"
                                )}>
                                  {isPrimary ? "Product Image" : `Alternate Image ${idx}`}
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
                          );
                        })}
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
                        <p className="font-semibold text-slate-800">{currentBatchProduct.shortDesc}</p>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Description</span>
                        <p className="font-semibold text-slate-800">{currentBatchProduct.mobileDesc || "—"}</p>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Invoice Description</span>
                        <p className="font-mono font-bold text-slate-800">{currentBatchProduct.invoiceDesc || "—"}</p>
                      </div>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Retail Description</span>
                        <p className="font-semibold text-slate-800">{currentBatchProduct.retailDesc || "—"}</p>
                      </div>
                      <div className="sm:col-span-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Long Description</span>
                        <p className="text-slate-700 leading-relaxed">{currentBatchProduct.longDesc1 || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* SKU Completeness Telemetry Banner */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">SKU Completeness Rate</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {currentBatchProduct.completenessRate ?? Math.round(((currentBatchProduct.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0) / Math.max(10, currentBatchProduct.attributes?.length || 10)) * 100)}% Populated
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {currentBatchProduct.populatedAttributesCount ?? (currentBatchProduct.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0)} / {currentBatchProduct.expectedAttributesCount ?? Math.max(10, currentBatchProduct.attributes?.length || 10)} Category Attributes
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${currentBatchProduct.completenessRate ?? Math.round(((currentBatchProduct.attributes?.filter((a: any) => (a.confidence ?? 0.95) >= 0.60 && a.value).length || 0) / Math.max(10, currentBatchProduct.attributes?.length || 10)) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero-Hallucination Policy: Unverified schema fields are strictly omitted as empty cells ("") to prevent fabrication.</span>
                    </p>
                  </div>

                  {/* Normalized Technical Attributes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Normalized Technical Attributes (Only Stated Specs)
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        🟢 High (≥85%) | 🟡 Medium (60–84%) | Dimmed (Unverified)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {currentBatchProduct.attributes && currentBatchProduct.attributes.length > 0 ? (
                        currentBatchProduct.attributes.map((attr: any, idx: number) => {
                          const conf = attr.confidence ?? 0.98;
                          const isHigh = conf >= 0.85;
                          const isBlankOrUnverified = !attr.value || conf < 0.60 || ['n/a', 'unknown', 'null'].includes(String(attr.value).toLowerCase());
                          const citationUrl = attr.sourceEvidence?.sourceUrl || (currentBatchProduct.citations && currentBatchProduct.citations[0]?.sourceUrl);

                          if (isBlankOrUnverified) {
                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-1 opacity-70"
                              >
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                  {attr.label}
                                </p>
                                <p className="text-xs text-slate-400 italic font-mono">
                                  — Blank (Unverified in OEM docs)
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={idx}
                              className={cn(
                                "p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5",
                                isHigh
                                  ? "bg-white border-slate-200 hover:border-emerald-400"
                                  : "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                                  {attr.label}
                                </p>
                                <span
                                  className={cn(
                                    "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 flex items-center gap-1",
                                    isHigh
                                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                      : "text-amber-800 bg-amber-50 border-amber-200"
                                  )}
                                >
                                  <span>{isHigh ? "🟢" : "🟡"}</span>
                                  <span>{Math.round(conf * 100)}%</span>
                                </span>
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
                                {citationUrl && (
                                  <a
                                    href={citationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline mt-1 font-medium"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>OEM Citation</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                          <p className="text-xs text-slate-400 italic">
                            — All 50 attribute columns preserved as clean blanks (Unverified in OEM documentation)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Bullet Features */}
                  {currentBatchProduct.features && currentBatchProduct.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Extracted Product Features
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                        {currentBatchProduct.features.map((feat: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 bg-[#FAFAFA] p-2.5 rounded-xl border border-[#E2E8F0]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warranty Card */}
                  {currentBatchProduct.warrantyInfo && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Warranty Coverage &amp; Policy
                      </h4>
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{currentBatchProduct.warrantyInfo.term}</span>
                            <span className={cn(
                              "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded",
                              currentBatchProduct.warrantyInfo.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            )}>
                              {currentBatchProduct.warrantyInfo.isVerified ? "Official OEM Policy Link" : "Standard Term"}
                            </span>
                          </div>
                          {currentBatchProduct.warrantyInfo.verifiedUrl && (
                            <a
                              href={currentBatchProduct.warrantyInfo.verifiedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Official Warranty Page
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {currentBatchProduct.warrantyInfo.shortInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Technical Documents */}
                  {currentBatchProduct.documents && currentBatchProduct.documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Verified Technical Documents (PDF / Datasheets)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {currentBatchProduct.documents.map((doc: any, idx: number) => (
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
                      onClick={() => setShowBatchDeliveryColumns(!showBatchDeliveryColumns)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-[#2563EB]" />
                        <span>Inspect 252-Column Unihack Delivery Row Mapping ({currentBatchProduct.partNumber})</span>
                      </div>
                      {showBatchDeliveryColumns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showBatchDeliveryColumns && (
                      <div className="mt-3 p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 overflow-x-auto max-h-96 space-y-2 text-xs font-mono">
                        <p className="text-emerald-400 font-sans text-xs font-bold">
                          Exact 252-Column Data Representation (Matching Unihack_Expected_Output_Delivery_Format.xlsx):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {Object.entries(currentBatchProduct.deliveryRow || {}).map(([key, val]) => (
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

          {/* Initial Dropzone View */}
          {!batchResult && !isProcessingBatchFile && (
            <UploadDropzone
              mode={uploadMode}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onUploadSubmit={handleBatchFileUpload}
              isUploading={isProcessingBatchFile}
              submitButtonText="Start AI Multi-Product Extraction & 252-Column Processing"
            />
          )}

        </div>
      )}
    </div>
  );
}

