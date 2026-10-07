"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  UploadCloud,
  FileSpreadsheet,
  Package,
  Zap,
  HardDrive,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Sparkles,
  Database,
  X,
  FileCode,
  Users,
  UserCheck,
  Key,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserWorkspaceData } from "@/lib/auth/workspace-guard";
import { cn } from "@/lib/utils";

interface AccountSummary {
  email: string;
  displayName: string;
  uid?: string;
  creationTime?: string;
  lastSignInTime?: string;
  jobsCount: number;
  totalRows: number;
  source: string;
}

interface EnrichedProduct {
  id?: string;
  productId?: string;
  partNumber?: string;
  mfgPartNum?: string;
  sku?: string;
  manufacturerName?: string;
  brandName?: string | null;
  officialTitle?: string;
  shortDesc?: string;
  longDesc1?: string | null;
  classpath?: string;
  unspsc?: string;
  submittedBy?: string;
  batchFileName?: string;
  jobId?: string;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean; shortInfo?: string }>;
  documents?: Array<{ assetType: string; fileName: string; sourceUrl: string; shortInfo?: string }>;
  warrantyInfo?: { term?: string; shortInfo?: string; verifiedUrl?: string | null; isVerified?: boolean };
  deliveryRow?: Record<string, string>;
  attributes?: Array<{ label: string; value: string; uom?: string | null; confidence?: number }>;
  features?: string[];
  nonEmptyColumnsCount?: number;
  confidenceScore?: number;
  status?: string;
  sourceLocation?: string;
}

interface BatchRecord {
  batchId: string;
  fileName: string;
  totalRowsInFile: number;
  processedCount: number;
  createdAt: string;
  emailRecipient?: string;
  emailNotificationSent?: boolean;
  products: EnrichedProduct[];
}

interface IngestionJob {
  jobId: string;
  fileName?: string | null;
  sourceType?: string;
  rowCount?: number | null;
  processedRows?: number;
  publishedRows?: number;
  reviewRows?: number;
  failedRows?: number;
  status: string;
  stage?: string;
  progress?: number;
  submittedBy?: string;
  submittedAt?: string;
  completedAt?: string | null;
  updatedAt?: string;
}

export default function UserDataRetrievalPage() {
  const { user } = useAuth();

  // Search & Active Account State
  const [activeEmail, setActiveEmail] = useState<string>("all");
  const [emailInput, setEmailInput] = useState<string>("");
  const [accountSearchQuery, setAccountSearchQuery] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Accounts List (Firebase + Azure SQL)
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);

  // Data Store
  const [backendBatches, setBackendBatches] = useState<BatchRecord[]>([]);
  const [backendJobs, setBackendJobs] = useState<IngestionJob[]>([]);
  const [backendProducts, setBackendProducts] = useState<EnrichedProduct[]>([]);
  const [localWorkspaceProducts, setLocalWorkspaceProducts] = useState<any[]>([]);
  const [localWorkspaceJobs, setLocalWorkspaceJobs] = useState<any[]>([]);
  const [localActiveBatch, setLocalActiveBatch] = useState<any | null>(null);

  // View & Filter State
  const [activeTab, setActiveTab] = useState<"overview" | "batches" | "products" | "jobs" | "accounts" | "storage" | "json">("overview");
  const [dataSearchFilter, setDataSearchFilter] = useState<string>("");
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [modalSearchFilter, setModalSearchFilter] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Main fetcher
  const fetchData = useCallback(async (targetEmail: string) => {
    setIsFetching(true);
    const cleanEmail = targetEmail.trim();
    setActiveEmail(cleanEmail);

    // 1. Fetch from LocalStorage for this email
    if (typeof window !== "undefined") {
      try {
        const wsData = getUserWorkspaceData(cleanEmail === "all" ? undefined : cleanEmail);
        setLocalWorkspaceProducts(wsData.products || []);
        setLocalWorkspaceJobs(wsData.jobs || []);

        const activeBatchRaw = localStorage.getItem("catalogforge_active_batch");
        if (activeBatchRaw) {
          const ab = JSON.parse(activeBatchRaw);
          if (
            cleanEmail === "all" ||
            !cleanEmail ||
            (ab?.emailRecipient && ab.emailRecipient.toLowerCase().includes(cleanEmail.toLowerCase()))
          ) {
            setLocalActiveBatch(ab);
          } else {
            setLocalActiveBatch(null);
          }
        }
      } catch (e) {
        console.warn("[UserDataRetrieval] Local workspace parse notice:", e);
      }
    }

    // 2. Fetch from Backend /api/v1/ingestion/user-uploads
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    try {
      const queryParam = cleanEmail && cleanEmail !== "all" ? `?email=${encodeURIComponent(cleanEmail)}` : "?email=all";
      const res = await fetch(`${baseUrl}/ingestion/user-uploads${queryParam}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        }
        setBackendBatches(data.batches || []);
        setBackendJobs(data.jobs || []);
        setBackendProducts(data.products || []);
      }
    } catch (err) {
      console.warn("[UserDataRetrieval] Backend fetch notice:", err);
    } finally {
      setIsFetching(false);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData("all");
  }, [fetchData]);

  const handleSelectAccount = (email: string) => {
    setEmailInput(email === "all" ? "" : email);
    fetchData(email);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      fetchData("all");
      return;
    }
    fetchData(emailInput.trim());
  };

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!accountSearchQuery.trim()) return accounts;
    const q = accountSearchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.displayName.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }, [accounts, accountSearchQuery]);

  // Combine and deduplicate products
  const combinedProducts: EnrichedProduct[] = useMemo(() => {
    const list: EnrichedProduct[] = [];
    const seenIds = new Set<string>();

    backendProducts.forEach((p) => {
      const pKey = p.id || p.productId || p.partNumber || "";
      if (pKey) seenIds.add(pKey);
      list.push(p);
    });

    backendBatches.forEach((b) => {
      (b.products || []).forEach((p) => {
        const pKey = p.partNumber || p.sku || "";
        if (!seenIds.has(pKey)) {
          seenIds.add(pKey);
          list.push({ ...p, batchFileName: b.fileName, sourceLocation: "backend_batch" });
        }
      });
    });

    localWorkspaceProducts.forEach((p: any) => {
      const pKey = p.partNumber || p.id || "";
      if (!seenIds.has(pKey)) {
        seenIds.add(pKey);
        list.push({
          partNumber: p.partNumber,
          mfgPartNum: p.manufacturerPartNumber || p.partNumber,
          manufacturerName: p.manufacturerName || p.manufacturer || "OEM",
          brandName: p.brandName || p.brand || null,
          officialTitle: p.officialTitle || p.shortDesc || p.partNumber,
          shortDesc: p.shortDesc || p.officialTitle || "",
          classpath: p.classpath || "Industrial Supplies",
          unspsc: p.unspsc || "40151500",
          images: p.images || [],
          documents: p.documents || [],
          attributes: p.attributes || [],
          confidenceScore: p.confidence || 0.98,
          status: p.status || "published",
          sourceLocation: "local_workspace",
        });
      }
    });

    return list;
  }, [backendProducts, backendBatches, localWorkspaceProducts]);

  // Filtered products by dataSearchFilter
  const filteredProducts = useMemo(() => {
    if (!dataSearchFilter.trim()) return combinedProducts;
    const q = dataSearchFilter.toLowerCase();
    return combinedProducts.filter((p) => {
      return (
        p.partNumber?.toLowerCase().includes(q) ||
        p.officialTitle?.toLowerCase().includes(q) ||
        p.manufacturerName?.toLowerCase().includes(q) ||
        p.brandName?.toLowerCase().includes(q) ||
        p.classpath?.toLowerCase().includes(q) ||
        p.submittedBy?.toLowerCase().includes(q)
      );
    });
  }, [combinedProducts, dataSearchFilter]);

  // Filtered jobs by dataSearchFilter
  const filteredJobs = useMemo(() => {
    const list = [...backendJobs];
    const seenJobIds = new Set(list.map((j) => j.jobId));

    localWorkspaceJobs.forEach((lj) => {
      const id = lj.jobId || lj.id;
      if (!seenJobIds.has(id)) {
        seenJobIds.add(id);
        list.push({
          jobId: id,
          fileName: lj.fileName || "Local Upload Run",
          sourceType: lj.sourceType || "file_upload",
          rowCount: lj.totalRows || lj.rowCount || 0,
          processedRows: lj.totalRows || lj.processedRows || 0,
          status: lj.status || "completed",
          stage: lj.currentStage || lj.stage || "published",
          progress: lj.progressPercentage || lj.progress || 100,
          submittedBy: activeEmail === "all" ? "local_user" : activeEmail,
          submittedAt: lj.createdAt || new Date().toISOString(),
        });
      }
    });

    if (!dataSearchFilter.trim()) return list;
    const q = dataSearchFilter.toLowerCase();
    return list.filter(
      (j) =>
        j.fileName?.toLowerCase().includes(q) ||
        j.jobId?.toLowerCase().includes(q) ||
        j.submittedBy?.toLowerCase().includes(q)
    );
  }, [backendJobs, localWorkspaceJobs, activeEmail, dataSearchFilter]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    if (!dataSearchFilter.trim()) return backendBatches;
    const q = dataSearchFilter.toLowerCase();
    return backendBatches.filter(
      (b) =>
        b.fileName?.toLowerCase().includes(q) ||
        b.batchId?.toLowerCase().includes(q) ||
        b.emailRecipient?.toLowerCase().includes(q)
    );
  }, [backendBatches, dataSearchFilter]);

  // Aggregated Metrics
  const metrics = useMemo(() => {
    const totalBatches = backendBatches.length + (localActiveBatch ? 1 : 0);
    const totalProducts = combinedProducts.length;
    const totalJobs = filteredJobs.length;

    let totalImages = 0;
    let totalDocs = 0;
    let totalColsPopulated = 0;

    combinedProducts.forEach((p) => {
      totalImages += p.images?.length || 0;
      totalDocs += p.documents?.length || 0;
      totalColsPopulated += p.nonEmptyColumnsCount || (p.deliveryRow ? Object.keys(p.deliveryRow).length : 15);
    });

    const avgColumns = totalProducts > 0 ? Math.round(totalColsPopulated / totalProducts) : 0;
    const avgConfidence =
      totalProducts > 0
        ? Math.round((combinedProducts.reduce((acc, p) => acc + (p.confidenceScore || 0.95), 0) / totalProducts) * 100)
        : 0;

    return {
      totalBatches,
      totalProducts,
      totalJobs,
      totalImages,
      totalDocs,
      avgColumns,
      avgConfidence,
    };
  }, [backendBatches, localActiveBatch, combinedProducts, filteredJobs]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadJson = () => {
    const payload = {
      exportMetadata: {
        filter: activeEmail,
        exportedAt: new Date().toISOString(),
        tool: "CatalogForge Local Data Retrieval Utility",
      },
      accounts,
      metrics,
      batches: backendBatches,
      jobs: filteredJobs,
      products: combinedProducts,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogforge_userdata_${activeEmail.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedAccountInfo = useMemo(() => {
    if (activeEmail === "all") return null;
    return accounts.find((a) => a.email.toLowerCase() === activeEmail.toLowerCase()) || null;
  }, [accounts, activeEmail]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* ── TOP UTILITY HEADER ───────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </Link>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight">
                <span className="text-[#38BDF8]">Catalog</span>
                <span className="text-white">Forge</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-sky-400 border border-blue-500/30">
                MULTI-ACCOUNT DATA RETRIEVAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold uppercase text-slate-400">Current Scope</div>
              <div className="text-xs font-bold text-white font-mono">
                {activeEmail === "all" ? "All Accounts (Global)" : activeEmail}
              </div>
            </div>

            <button
              onClick={() => fetchData(activeEmail)}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin text-sky-400")} />
              <span>{isFetching ? "Syncing..." : "Sync Live Data"}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (.json)</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── ACCOUNTS DIRECTORY ACCORDION / GRID ──────────────────────────── */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Registered Platform &amp; Firebase Accounts ({accounts.length} Detected)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any account card below to instantly retrieve and view all files, datasets, and catalog products
                they uploaded and processed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  placeholder="Search accounts..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <button
                onClick={() => handleSelectAccount("all")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border",
                  activeEmail === "all"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Accounts Combined</span>
              </button>
            </div>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
            {/* "All Accounts" Card */}
            <div
              onClick={() => handleSelectAccount("all")}
              className={cn(
                "p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 select-none",
                activeEmail === "all"
                  ? "bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-600 hover:bg-slate-900/60"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 font-black flex items-center justify-center text-xs border border-blue-500/30">
                    ALL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Global Workspace</div>
                    <div className="text-[10px] text-slate-400 font-mono">All Platform Uploads</div>
                  </div>
                </div>
                {activeEmail === "all" && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
              </div>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Total System Data</span>
                <span className="font-bold text-emerald-400">
                  {accounts.reduce((acc, a) => acc + a.jobsCount, 0)} jobs
                </span>
              </div>
            </div>

            {/* Individual Accounts */}
            {filteredAccounts.map((acc) => {
              const isSelected = activeEmail.toLowerCase() === acc.email.toLowerCase();
              const hasActivity = acc.jobsCount > 0;
              const initials = acc.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc.email)}
                  className={cn(
                    "p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 select-none",
                    isSelected
                      ? "bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-600 hover:bg-slate-900/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border",
                          hasActivity
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        {initials || "U"}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate" title={acc.displayName}>
                          {acc.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate" title={acc.email}>
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] font-mono border border-slate-800">
                      {acc.source}
                    </span>
                    <span
                      className={cn(
                        "font-bold font-mono",
                        hasActivity ? "text-emerald-400 font-black" : "text-slate-500"
                      )}
                    >
                      {acc.jobsCount > 0 ? `${acc.jobsCount} job${acc.jobsCount > 1 ? "s" : ""}` : "0 jobs"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Email Input Fallback */}
          <form onSubmit={handleManualSearch} className="flex gap-2 pt-2 border-t border-slate-800/60">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Or type any specific email manually..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition shrink-0"
            >
              Search Email
            </button>
          </form>
        </div>

        {/* ── SELECTED ACCOUNT BANNER ─────────────────────────────────────── */}
        {selectedAccountInfo && (
          <div className="rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-800/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 font-black flex items-center justify-center text-sm border border-blue-500/30">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{selectedAccountInfo.displayName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/10 text-sky-400 border border-blue-500/20">
                    {selectedAccountInfo.source}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                  <span>{selectedAccountInfo.email}</span>
                  {selectedAccountInfo.uid && (
                    <span className="hidden md:inline text-[11px] text-slate-500">
                      UID: <code>{selectedAccountInfo.uid}</code>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Jobs Uploaded</div>
                <div className="font-bold text-emerald-400 text-sm">{selectedAccountInfo.jobsCount}</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Rows Ingested</div>
                <div className="font-bold text-sky-400 text-sm">{selectedAccountInfo.totalRows}</div>
              </div>
              {selectedAccountInfo.creationTime && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center hidden md:block">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Created</div>
                  <div className="font-mono text-slate-300 text-xs">
                    {new Date(selectedAccountInfo.creationTime).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── METRICS SUMMARY CARDS ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Batches Uploaded</div>
            <div className="text-2xl font-black text-white flex items-baseline gap-1">
              <span>{metrics.totalBatches}</span>
              <span className="text-xs font-normal text-slate-400">runs</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-blue-400" />
              <span>CSV/XLSX Feeds</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Enriched SKUs</div>
            <div className="text-2xl font-black text-sky-400 flex items-baseline gap-1">
              <span>{metrics.totalProducts}</span>
              <span className="text-xs font-normal text-slate-400">items</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Package className="w-3 h-3 text-sky-400" />
              <span>Master Records</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Pipeline Jobs</div>
            <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
              <span>{metrics.totalJobs}</span>
              <span className="text-xs font-normal text-slate-400">jobs</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Ingestion Tasks</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Verified Photos</div>
            <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-1">
              <span>{metrics.totalImages}</span>
              <span className="text-xs font-normal text-slate-400">assets</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-emerald-400" />
              <span>Live OEM CDNs</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Verified PDFs</div>
            <div className="text-2xl font-black text-purple-400 flex items-baseline gap-1">
              <span>{metrics.totalDocs}</span>
              <span className="text-xs font-normal text-slate-400">docs</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-400" />
              <span>Datasheets/SDS</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Columns</div>
            <div className="text-2xl font-black text-rose-400 flex items-baseline gap-1">
              <span>{metrics.avgColumns}</span>
              <span className="text-xs font-normal text-slate-400">/ 252</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Zero-Hallucination</span>
            </div>
          </div>
        </div>

        {/* ── SEARCH & VIEW TABS ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Package className="w-3.5 h-3.5" />
              <span>All Products ({metrics.totalProducts})</span>
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "jobs"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Pipeline Jobs ({metrics.totalJobs})</span>
            </button>

            <button
              onClick={() => setActiveTab("batches")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "batches"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Batch Uploads ({metrics.totalBatches})</span>
            </button>

            <button
              onClick={() => setActiveTab("storage")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "storage"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Local Storage</span>
            </button>

            <button
              onClick={() => setActiveTab("json")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0",
                activeTab === "json"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={dataSearchFilter}
              onChange={(e) => setDataSearchFilter(e.target.value)}
              placeholder="Filter products / jobs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* ── TAB: OVERVIEW ───────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Actions & Provenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>Data Provenance &amp; System Health</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    Live Azure SQL + Firebase
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Current Scope Filter</span>
                    <span className="font-mono font-bold text-white">
                      {activeEmail === "all" ? "All Users (13 Accounts)" : activeEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Enriched Products</span>
                    <span className="font-bold text-sky-400">{metrics.totalProducts} master SKUs</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Total Pipeline Jobs</span>
                    <span className="font-bold text-amber-400">{metrics.totalJobs} ingestion runs</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Verified OEM Assets</span>
                    <span className="font-bold text-emerald-400">
                      {metrics.totalImages} photos &bull; {metrics.totalDocs} technical PDFs
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Strict Governance</span>
                    <span className="font-bold text-slate-200">252-Column Unihack Master Standard</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Quick Exports &amp; Ingestion Actions</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">Universal Format</span>
                </div>

                <p className="text-xs text-slate-400">
                  Export the active dataset for <strong>{activeEmail === "all" ? "all users" : activeEmail}</strong>{" "}
                  as formatted JSON or standard delivery format.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Download Full JSON</span>
                  </button>

                  <Link
                    href={`/upload?tab=file`}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition"
                  >
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    <span>Upload New Batch</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Table Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-sky-400" />
                  <span>Enriched Products Preview ({filteredProducts.length} Total)</span>
                </h3>
                <button
                  onClick={() => setActiveTab("products")}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  View All Products &rarr;
                </button>
              </div>

              <div className="rounded-xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Part Number</th>
                        <th className="py-2.5 px-4">Manufacturer &amp; Brand</th>
                        <th className="py-2.5 px-4">Official Title / Description</th>
                        <th className="py-2.5 px-4">Submitted By</th>
                        <th className="py-2.5 px-4 text-center">Assets</th>
                        <th className="py-2.5 px-4 text-center">252-Cols</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.slice(0, 8).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {p.partNumber || p.mfgPartNum || `SKU-#${idx + 1}`}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <span className="font-semibold text-white">{p.manufacturerName || "OEM"}</span>
                            {p.brandName && p.brandName !== p.manufacturerName && (
                              <span className="text-slate-400 ml-1">({p.brandName})</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={p.officialTitle || p.shortDesc}>
                            {p.officialTitle || p.shortDesc || "No title"}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[160px]">
                            {p.submittedBy || "System User"}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-sky-400">
                            {(p.images?.length || 0)} imgs / {(p.documents?.length || 0)} docs
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.nonEmptyColumnsCount || 24}/252
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedProduct(p)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PRODUCTS MASTER ────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-400" />
                <span>All Enriched Product Master Records ({filteredProducts.length})</span>
              </h2>
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Part Number</th>
                      <th className="py-3 px-4">Manufacturer &amp; Brand</th>
                      <th className="py-3 px-4">Official Title / Description</th>
                      <th className="py-3 px-4">Taxonomy Classpath</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4 text-center">Assets</th>
                      <th className="py-3 px-4 text-center">252-Cols</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {p.partNumber || p.mfgPartNum || p.sku}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="font-bold text-white">{p.manufacturerName || "OEM"}</div>
                          {p.brandName && p.brandName !== p.manufacturerName && (
                            <div className="text-[11px] text-slate-400">{p.brandName}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate" title={p.officialTitle || p.shortDesc}>
                          {p.officialTitle || p.shortDesc || "No official description"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono max-w-xs truncate" title={p.classpath}>
                          {p.classpath || "Industrial Supplies"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[160px]">
                          {p.submittedBy || "System User"}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-sky-400">
                          {(p.images?.length || 0)} imgs / {(p.documents?.length || 0)} pdfs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.nonEmptyColumnsCount || 24}/252
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                          >
                            Inspect 252-Cols
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PIPELINE JOBS ──────────────────────────────────────────── */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Ingestion &amp; Pipeline Execution Jobs ({filteredJobs.length})</span>
              </h2>
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Job ID</th>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Source Type</th>
                      <th className="py-3 px-4 text-center">Rows</th>
                      <th className="py-3 px-4 text-center">Progress</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredJobs.map((j) => (
                      <tr key={j.jobId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-sky-400">
                          {j.jobId.slice(0, 8)}...{j.jobId.slice(-4)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">{j.fileName || "Uploaded File"}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 uppercase text-[10px]">{j.sourceType}</td>
                        <td className="py-3 px-4 text-center font-bold text-white">{j.rowCount || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-24 bg-slate-800 rounded-full h-1.5 mx-auto overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${j.progress || 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{j.progress || 100}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{j.submittedBy || "System"}</td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {j.submittedAt ? new Date(j.submittedAt).toLocaleDateString() : "Recent"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: BATCHES ────────────────────────────────────────────────── */}
        {activeTab === "batches" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>Batch Upload Feeds ({filteredBatches.length})</span>
            </h2>

            {filteredBatches.length === 0 ? (
              <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-12 text-center space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No In-Memory Batches</h3>
                <p className="text-xs text-slate-500">
                  Uploaded batch spreadsheets appear here during extraction sessions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.batchId}
                    className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{batch.fileName}</h4>
                        <div className="text-xs text-slate-400 font-mono">ID: {batch.batchId}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {batch.processedCount} SKUs Enriched
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: LOCAL STORAGE ──────────────────────────────────────────── */}
        {activeTab === "storage" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Browser Private Workspace Store</span>
            </h2>

            <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-bold uppercase text-slate-400">Cached Workspace Products</div>
                  <div className="text-xl font-bold text-white">{localWorkspaceProducts.length} items</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-bold uppercase text-slate-400">Cached Workspace Jobs</div>
                  <div className="text-xl font-bold text-white">{localWorkspaceJobs.length} jobs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: RAW JSON ───────────────────────────────────────────────── */}
        {activeTab === "json" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>Consolidated Data Payload (JSON)</span>
              </h2>

              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify({ accounts, products: combinedProducts, jobs: filteredJobs }, null, 2),
                    "full_json"
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copiedKey === "full_json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "full_json" ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-4 overflow-hidden">
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed select-all">
                {JSON.stringify(
                  {
                    scope: activeEmail,
                    totalAccounts: accounts.length,
                    accounts,
                    productsCount: combinedProducts.length,
                    jobsCount: filteredJobs.length,
                    products: combinedProducts.slice(0, 20),
                    jobs: filteredJobs,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* ── 252-COLUMN INSPECTOR DRAWER / MODAL ─────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-white">
                    {selectedProduct.partNumber || selectedProduct.mfgPartNum || selectedProduct.sku}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedProduct.nonEmptyColumnsCount || 24}/252 Columns Populated
                  </span>
                  {selectedProduct.submittedBy && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
                      User: {selectedProduct.submittedBy}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {selectedProduct.manufacturerName || "OEM"}{" "}
                  {selectedProduct.brandName && `(${selectedProduct.brandName})`} &bull;{" "}
                  {selectedProduct.officialTitle || selectedProduct.shortDesc}
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Photos Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Authentic OEM CDN Photos ({selectedProduct.images.length})</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedProduct.images.map((img, i) => (
                      <a
                        key={i}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 overflow-hidden transition relative"
                      >
                        <div className="aspect-square p-2 flex items-center justify-center bg-white/5">
                          <img
                            src={img.url}
                            alt={img.alt || "Product photo"}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.target as any).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="p-2 text-[10px] text-slate-400 truncate flex items-center justify-between">
                          <span className="truncate">{img.alt || `Photo #${i + 1}`}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 ml-1 text-slate-500 group-hover:text-sky-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Technical Documents */}
              {selectedProduct.documents && selectedProduct.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Verified Technical PDFs &amp; Datasheets ({selectedProduct.documents.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProduct.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs transition group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="truncate font-semibold text-slate-200 group-hover:text-white">
                            {doc.fileName || `${doc.assetType} PDF`}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 252-Column Delivery Headers Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>252-Column Delivery Schema Mapping</span>
                  </h4>

                  <input
                    type="text"
                    value={modalSearchFilter}
                    onChange={(e) => setModalSearchFilter(e.target.value)}
                    placeholder="Search 252 column headers..."
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-60"
                  />
                </div>

                {selectedProduct.deliveryRow ? (
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 sticky top-0 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-4 w-1/3">Column Header</th>
                            <th className="py-2.5 px-4 w-2/3">Populated Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                          {Object.entries(selectedProduct.deliveryRow)
                            .filter(
                              ([k, v]) =>
                                !modalSearchFilter.trim() ||
                                k.toLowerCase().includes(modalSearchFilter.toLowerCase()) ||
                                v.toLowerCase().includes(modalSearchFilter.toLowerCase())
                            )
                            .map(([colName, colVal], idx) => {
                              const isFilled = colVal && colVal.trim().length > 0;
                              return (
                                <tr key={idx} className={cn("hover:bg-slate-900/60 transition", !isFilled && "opacity-40")}>
                                  <td className="py-2 px-4 text-slate-300 font-semibold">{colName}</td>
                                  <td className="py-2 px-4">
                                    {isFilled ? (
                                      <span className="text-emerald-400 font-semibold">{colVal}</span>
                                    ) : (
                                      <span className="text-slate-600 italic">(blank_zero_hallucination)</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    No 252-column delivery headers available for this item.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">CatalogForge 252-Column Master Standard</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
