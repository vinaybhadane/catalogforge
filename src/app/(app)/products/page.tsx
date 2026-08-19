"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  Search,
  Filter,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";
import {
  sanitizeText,
  getCleanBrandName,
  getCleanManufacturerName,
  calculateConfidenceScore,
} from "@/lib/utils/sanitizer";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ConfidenceCell({ product }: { product: Product }) {
  const pct = calculateConfidenceScore(product);

  const badgeColor =
    pct >= 85
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : pct >= 60
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <span
      className={cn(
        "text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm inline-flex items-center",
        badgeColor
      )}
    >
      {pct}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    published: { dot: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" },
    validated: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
    enriched: { dot: "bg-purple-500", text: "text-purple-800", bg: "bg-purple-50", border: "border-purple-200" },
    needs_review: { dot: "bg-orange-500", text: "text-orange-800", bg: "bg-orange-50", border: "border-orange-200" },
    failed: { dot: "bg-rose-500", text: "text-rose-800", bg: "bg-rose-50", border: "border-rose-200" },
    ingested: { dot: "bg-[#6D8196]", text: "text-[#64748B]", bg: "bg-slate-50", border: "border-slate-200" },
    classified: { dot: "bg-indigo-500", text: "text-indigo-800", bg: "bg-indigo-50", border: "border-indigo-200" },
  };

  const current = colors[status] || { dot: "bg-[#6D8196]", text: "text-[#000000]", bg: "bg-slate-50", border: "border-slate-200" };

  return (
    <span className={cn("border inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider", current.bg, current.border)}>
      <span className={cn("w-2 h-2 rounded-full", current.dot)} />
      <span className={current.text}>{status.replace(/_/g, " ")}</span>
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-[#CBCBCB]/40 rounded w-4/5" />
        </td>
      ))}
    </tr>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isExporting, setIsExporting] = useState<"xlsx" | "csv" | null>(null);

  const handleExportDelivery = async (format: "xlsx" | "csv" = "xlsx") => {
    try {
      setIsExporting(format);
      const params: Record<string, string | number> = { format };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const blob = await apiClient.downloadBlob("/products/export", { params });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CatalogForge_Delivery_Export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export delivery file. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  const loadProducts = useCallback(
    async (pageToLoad = page, searchToUse = search, statusToUse = statusFilter) => {
      setFetchState("loading");
      setErrorMessage(null);
      try {
        const params: Record<string, string | number> = {
          page: pageToLoad,
          limit: 20,
        };
        if (searchToUse.trim()) params.search = searchToUse.trim();
        if (statusToUse !== "all") params.status = statusToUse;

        const data = await apiClient.get<PaginatedResponse<Product> | Product[]>("/products", { params });

        if (Array.isArray(data)) {
          setProducts(data);
          setTotalPages(1);
        } else {
          setProducts(data.items ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
        setFetchState("success");
      } catch (err) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to fetch products.");
        }
        setFetchState("error");
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    loadProducts(page, search, statusFilter);
  }, [page, statusFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      setPage(1);
      loadProducts(1, val, statusFilter);
    }, 300);
    setSearchTimer(timer);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#000000] tracking-tight">Product Repository</h1>
              <p className="text-xs text-[#64748B] font-bold mt-0.5">
                Browse, search, and inspect enriched catalog records in the 252-column delivery format.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleExportDelivery("xlsx")}
              disabled={isExporting !== null}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              title="Download full catalog in 252-column Expected Output Delivery Format (.xlsx)"
            >
              {isExporting === "xlsx" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              Export Delivery Format (.xlsx)
            </button>
            <Link
              href="/upload"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
            >
              <UploadCloud className="w-4 h-4" /> Ingest Data
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by part number, manufacturer, brand, classpath..."
              className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[#000000] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] font-medium"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="product-status" className="text-xs font-bold text-[#000000] whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" /> Status:
            </label>
            <select
              id="product-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-[#000000] bg-slate-50 font-bold cursor-pointer focus:outline-none focus:border-[#2563EB]"
              suppressHydrationWarning
            >
              <option value="all">All Stages</option>
              <option value="ingested">Ingested</option>
              <option value="classified">Classified</option>
              <option value="enriched">Enriched</option>
              <option value="validated">Validated</option>
              <option value="needs_review">Needs Review</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load products.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Product Master Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden p-1">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-xs text-left" aria-label="Enriched products">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#000000] bg-slate-100/75">
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Part Number</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Manufacturer</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Brand</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Classpath</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Confidence</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Updated</th>
                  <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fetchState === "loading" && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {fetchState === "success" && products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
                          <Package className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-extrabold text-[#000000]">No products found</p>
                        <p className="text-xs text-[#64748B] font-bold max-w-xs">Upload a dataset to begin structured catalog enrichment.</p>
                        <Link
                          href="/upload"
                          className="mt-2 px-5 py-2.5 text-xs font-bold bg-[#2563EB] text-white rounded-xl inline-flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" /> Upload Data
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {fetchState === "success" &&
                  products.map((p) => {
                    const resolvedMfg = getCleanManufacturerName(p.manufacturerName, p.brandName);
                    const resolvedBrand = getCleanBrandName(p.brandName, resolvedMfg);
                    const cleanClasspath = sanitizeText(p.classpath) || "Industrial > General Supplies > Components";
                    const cleanPart = sanitizeText(p.partNumber);

                    return (
                      <tr key={p.productId} className="hover:bg-[#EFF6FF]/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#000000]">{cleanPart}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#000000]">
                          {resolvedMfg}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#000000]">
                          {resolvedBrand}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B] font-bold truncate max-w-[200px]" title={cleanClasspath}>
                          {cleanClasspath}
                        </td>
                        <td className="px-4 py-3">
                          <ConfidenceCell product={p} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px] font-medium">
                          {formatDate(p.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/products/${p.productId}`}
                            className="bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] shadow-sm"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {fetchState === "success" && products.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#000000] font-bold">
            <span>
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
