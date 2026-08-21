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
  Sparkles,
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
          "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm inline-flex items-center gap-1 w-fit",
          badgeColor
        )}
      >
        <span>{pct >= 85 ? "🟢" : pct >= 60 ? "🟡" : "🔴"}</span>
        <span>{pct}% Conf</span>
      </span>
      {completeness !== undefined && completeness !== null && (
        <span className="text-[10px] text-slate-500 font-mono font-medium">
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
    <div className="space-y-6 pb-10">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#000000] tracking-tight">
                Product Master Catalog
              </h1>
              <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                Authoritative multi-modal product intelligence repository.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleExportDelivery("xlsx")}
              disabled={isExporting !== null || products.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm"
              title="Export 252-Column Unihack Delivery Excel Workbook"
            >
              {isExporting === "xlsx" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>Export 252-Col Excel</span>
            </button>

            <button
              type="button"
              onClick={() => loadProducts(page, search, statusFilter)}
              className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#000000] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-[#2563EB]", fetchState === "loading" && "animate-spin")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/upload"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Ingest Dataset</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by part number, manufacturer, brand, or description..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#000000] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#000000] focus:outline-none focus:border-[#2563EB]"
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
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        {fetchState === "loading" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Part Number</th>
                  <th className="px-4 py-3.5">Manufacturer</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Classpath / Leaf</th>
                  <th className="px-4 py-3.5">Confidence</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : products.length === 0 ? (
          /* Clean Initial State for New Users */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#000000]">Your Catalog is Empty</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                No products have been ingested or sourced in your workspace yet. Start by uploading a dataset file or use our AI Single Product Lookup.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/upload"
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV / XLSX</span>
              </Link>
              <Link
                href="/upload?tab=ai-search"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Single Lookup</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Part Number</th>
                  <th className="px-4 py-3.5">Manufacturer</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Classpath / Leaf</th>
                  <th className="px-4 py-3.5">Confidence</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {products.map((product) => {
                  const prodId = product.productId || (product as any).id || product.partNumber;
                  const resolvedMfg = getCleanManufacturerName(product.manufacturerName, product.brandName);
                  const resolvedBrand = getCleanBrandName(product.brandName, resolvedMfg);
                  const cleanClasspath = sanitizeText(product.classpath) || "Industrial > General";

                  return (
                    <tr key={prodId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#000000]">
                        <Link
                          href={`/products/${encodeURIComponent(String(prodId))}`}
                          className="hover:text-[#2563EB] transition-colors"
                        >
                          {sanitizeText(product.partNumber)}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{resolvedMfg}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{resolvedBrand}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[220px] truncate" title={cleanClasspath}>
                        {cleanClasspath}
                      </td>
                      <td className="px-4 py-3.5">
                        <ConfidenceCell product={product} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={product.status || "ingested"} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/products/${encodeURIComponent(String(prodId))}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
