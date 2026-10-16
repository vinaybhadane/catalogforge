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
  PlusCircle,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, PaginatedResponse } from "@/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserWorkspaceData } from "@/lib/auth/workspace-guard";
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
  const completeness = product.completenessRate ?? product.completenessScore ?? pct;

  const badgeColor =
    pct >= 85
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : pct >= 60
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm inline-flex items-center gap-1.5 w-fit",
          badgeColor
        )}
      >
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          pct >= 85 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"
        )} />
        <span>{pct}% Conf</span>
      </span>
      {completeness !== undefined && completeness !== null && (
        <span className="text-[10px] text-[#686868] font-mono font-medium pl-0.5">
          {Math.round(completeness)}% verified
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    published: { dot: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" },
    validated: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" },
    enriched: { dot: "bg-purple-500", text: "text-purple-800", bg: "bg-purple-50", border: "border-purple-200" },
    needs_review: { dot: "bg-orange-500", text: "text-orange-800", bg: "bg-orange-50", border: "border-orange-200" },
    failed: { dot: "bg-rose-500", text: "text-rose-800", bg: "bg-rose-50", border: "border-rose-200" },
    ingested: { dot: "bg-[#929292]", text: "text-[#171717]", bg: "bg-[#F7F7F7]", border: "border-[#EAEAEA]" },
    classified: { dot: "bg-blue-500", text: "text-blue-800", bg: "bg-blue-50", border: "border-blue-200" },
  };

  const current = colors[status] || { dot: "bg-[#929292]", text: "text-[#171717]", bg: "bg-[#F7F7F7]", border: "border-[#EAEAEA]" };

  return (
    <span className={cn("border inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider", current.bg, current.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      <span className={current.text}>{status.replace(/_/g, " ")}</span>
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 bg-slate-100 rounded-md w-4/5" />
        </td>
      ))}
    </tr>
  );
}

export default function ProductsPage() {
  const { user, isSharedMember } = useAuth();
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

      // Standalone new user workspace isolation
      if (user && !isSharedMember) {
        try {
          const userWorkspace = getUserWorkspaceData(user.uid || user.email);
          let filtered = [...userWorkspace.products];

          if (searchToUse.trim()) {
            const query = searchToUse.trim().toLowerCase();
            filtered = filtered.filter(
              (p) =>
                (p.partNumber && p.partNumber.toLowerCase().includes(query)) ||
                (p.manufacturerName && p.manufacturerName.toLowerCase().includes(query)) ||
                (p.brandName && p.brandName.toLowerCase().includes(query)) ||
                (p.descriptions?.shortDescription && p.descriptions.shortDescription.toLowerCase().includes(query)) ||
                ((p as any).shortDesc && (p as any).shortDesc.toLowerCase().includes(query))
            );
          }

          if (statusToUse !== "all") {
            filtered = filtered.filter((p) => p.status === statusToUse);
          }

          setProducts(filtered);
          setTotalPages(1);
          setFetchState("success");
        } catch {
          setErrorMessage("Unable to load private catalog.");
          setFetchState("error");
        }
        return;
      }

      // Shared Organization Catalog for Admin & Invited Team Members
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
    [user, isSharedMember, page, search, statusFilter]
  );

  useEffect(() => {
    loadProducts(page, search, statusFilter);
  }, [page, statusFilter, loadProducts]);

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
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C8FF00] flex items-center justify-center shadow-sm shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Product Master
                </h1>
                <span className="bg-[#F7F7F7] border border-[#EAEAEA] text-[#111111] text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                  {products.length} {products.length === 1 ? "SKU" : "SKUs"}
                </span>
              </div>
              <p className="text-xs text-[#686868] font-medium mt-1">
                Authoritative multi-modal industrial catalog repository and standardized SKU registry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleExportDelivery("xlsx")}
              disabled={isExporting !== null || products.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#191919] disabled:opacity-40 text-white rounded-full text-xs font-bold transition shadow-sm"
              title="Export 252-Column Unihack Delivery Excel Workbook"
            >
              {isExporting === "xlsx" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8FF00]" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#C8FF00]" />
              )}
              <span>Export 252-Col Excel</span>
            </button>

            <button
              type="button"
              onClick={() => loadProducts(page, search, statusFilter)}
              className="bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 text-[#171717] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-[#111111]", fetchState === "loading" && "animate-spin")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/upload"
              className="bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition shadow-[0_2px_8px_rgba(200,255,0,0.25)] transform active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Ingest Dataset</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-[#929292] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by part number, manufacturer, brand, or description..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs font-medium text-[#171717] placeholder:text-[#929292] focus:outline-none focus:border-[#111111] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-[#929292]" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs font-bold text-[#171717] focus:outline-none focus:border-[#111111] cursor-pointer transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="needs_review">Needs Review</option>
            <option value="enriched">Enriched</option>
            <option value="validated">Validated</option>
            <option value="ingested">Ingested</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {fetchState === "error" && errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Table or Empty State */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {fetchState === "loading" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#EAEAEA] text-[11px] font-bold uppercase text-[#929292] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Part Number</th>
                  <th className="px-5 py-3.5">Manufacturer</th>
                  <th className="px-5 py-3.5">Brand</th>
                  <th className="px-5 py-3.5">Classpath / Leaf</th>
                  <th className="px-5 py-3.5">Confidence</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : products.length === 0 ? (
          /* Clean Initial State for New Users */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA] text-[#111111] flex items-center justify-center mx-auto shadow-sm">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#111111]">Your Product Master is Empty</h3>
              <p className="text-xs text-[#686868] leading-relaxed">
                No products have been ingested or sourced in your workspace yet. Start by uploading a dataset file or manufacturer PDF.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/upload"
                className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-[0_2px_8px_rgba(200,255,0,0.25)] transition transform active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV / XLSX / PDF</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#EAEAEA] text-[11px] font-bold uppercase text-[#929292] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Part Number</th>
                  <th className="px-5 py-3.5">Manufacturer</th>
                  <th className="px-5 py-3.5">Brand</th>
                  <th className="px-5 py-3.5">Classpath / Leaf</th>
                  <th className="px-5 py-3.5">Confidence</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {products.map((product) => {
                  const prodId = product.productId || (product as any).id || product.partNumber;
                  const resolvedMfg = getCleanManufacturerName(product.manufacturerName, product.brandName);
                  const resolvedBrand = getCleanBrandName(product.brandName, resolvedMfg);
                  const cleanClasspath = sanitizeText(product.classpath) || "Industrial > General";

                  return (
                    <tr key={prodId} className="hover:bg-[#F7F7F7]/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#111111]">
                        <Link
                          href={`/products/${encodeURIComponent(String(prodId))}`}
                          className="hover:text-black underline-offset-2 hover:underline transition-colors"
                        >
                          {sanitizeText(product.partNumber)}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#171717]">{resolvedMfg}</td>
                      <td className="px-5 py-3.5 font-medium text-[#686868]">{resolvedBrand}</td>
                      <td className="px-5 py-3.5 text-[#686868] max-w-[220px] truncate" title={cleanClasspath}>
                        {cleanClasspath}
                      </td>
                      <td className="px-5 py-3.5">
                        <ConfidenceCell product={product} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={product.status || "ingested"} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/products/${encodeURIComponent(String(prodId))}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-black group"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
