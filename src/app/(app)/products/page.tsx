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
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function ConfidenceCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-slate-400 italic">—</span>;
  const pct = Math.round(value * 100);
  return (
    <span className={cn("text-[11px] font-mono font-bold", pct >= 85 ? "text-[#047857]" : pct >= 60 ? "text-[#B45309]" : "text-[#B91C1C]")}>
      {pct}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700",
    validated: "bg-amber-50 text-amber-700",
    enriched: "bg-purple-50 text-purple-700",
    needs_review: "bg-orange-50 text-orange-700",
    failed: "bg-red-50 text-red-700",
    ingested: "bg-blue-50 text-blue-700",
    classified: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide", colors[status] ?? "bg-slate-100 text-slate-600")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-slate-200 rounded w-4/5" /></td>
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

  const loadProducts = useCallback(async (p: number, q: string, status: string) => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const params: Record<string, string | number> = { page: p, pageSize: 20 };
      if (q.trim()) params.search = q.trim();
      if (status !== "all") params.status = status;

      const res = await apiClient.get<PaginatedResponse<Product>>("/products", { params });
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setFetchState("success");
    } catch (err) {
      if (err instanceof ApiClientError && (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")) {
        setProducts([]);
        setTotalPages(null);
        setFetchState("success");
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load products.");
        setFetchState("error");
      }
    }
  }, []);

  useEffect(() => {
    loadProducts(page, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // Debounced search — Section 53 (300ms)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Browse and filter enriched product records.</p>
        </div>
        <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
          <UploadCloud className="w-4 h-4" /> Upload Data
        </Link>
      </div>

      {/* Filter / Search Bar — Section 21, 53, 54 */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by part number, manufacturer…"
            className="w-full text-xs border-0 bg-transparent text-slate-700 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="product-status" className="text-xs font-semibold text-slate-600 whitespace-nowrap">Status:</label>
          <select
            id="product-status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            <option value="all">All</option>
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

      {/* Error */}
      {fetchState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">Unable to load products.</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Enriched products">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Part Number", "Manufacturer", "Brand", "Classpath", "Confidence", "Status", "Updated", "Action"].map((col) => (
                  <th key={col} scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {fetchState === "loading" && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

              {fetchState === "success" && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No products yet</p>
                      <p className="text-xs text-slate-500 max-w-xs">Upload a dataset to begin enrichment.</p>
                      <Link href="/upload" className="mt-1 px-4 py-2 text-xs font-semibold bg-[#1D4ED8] text-white rounded-lg hover:bg-[#1E40AF] transition-colors">
                        Upload Data
                      </Link>
                    </div>
                  </td>
                </tr>
              )}

              {fetchState === "success" && products.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.partNumber}</td>
                  <td className="px-4 py-3 text-xs text-slate-800">{p.manufacturerName ?? <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate-800">{p.brandName ?? <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[180px]">{p.classpath ?? <span className="text-slate-400 italic">—</span>}</td>
                  <td className="px-4 py-3"><ConfidenceCell value={p.confidence} /></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.productId}`} className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fetchState === "success" && products.length > 0 && (
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-slate-500">
            <span>Page {page}{totalPages !== null ? ` of ${totalPages}` : ""}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">Previous</button>
              <button type="button" disabled={totalPages !== null && page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
