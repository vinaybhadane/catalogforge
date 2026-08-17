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
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

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

function ConfidenceCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[11px] text-[#4A4A4A]/50 italic">—</span>;
  const pct = Math.round(value * 100);
  return (
    <span
      className={cn(
        "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full neu-pill",
        pct >= 85
          ? "text-emerald-700 border-emerald-300"
          : pct >= 60
          ? "text-amber-800 border-amber-300"
          : "text-rose-700 border-rose-300"
      )}
    >
      {pct}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { dot: string; text: string }> = {
    published: { dot: "bg-emerald-500", text: "text-emerald-700" },
    validated: { dot: "bg-amber-500", text: "text-amber-700" },
    enriched: { dot: "bg-purple-500", text: "text-purple-700" },
    needs_review: { dot: "bg-orange-500", text: "text-orange-700" },
    failed: { dot: "bg-rose-500", text: "text-rose-700" },
    ingested: { dot: "bg-[#6D8196]", text: "text-[#6D8196]" },
    classified: { dot: "bg-indigo-500", text: "text-indigo-700" },
  };

  const current = colors[status] || { dot: "bg-[#6D8196]", text: "text-[#4A4A4A]" };

  return (
    <span className="neu-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
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
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")
      ) {
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
      {/* Neumorphic Header */}
      <div className="neu-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl neu-btn-accent flex items-center justify-center text-[#FFFFE3]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#4A4A4A] tracking-tight">Product Repository</h1>
              <p className="text-xs text-[#6D8196] font-bold mt-0.5">Browse, search, and inspect enriched catalog records.</p>
            </div>
          </div>
          <Link
            href="/upload"
            className="neu-btn-accent flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Ingest Data
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="neu-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-[#6D8196] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by part number, manufacturer, brand, classpath..."
              className="w-full text-xs neu-input pl-9 pr-4 py-2.5 text-[#4A4A4A] placeholder:text-[#4A4A4A]/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="product-status" className="text-xs font-bold text-[#4A4A4A] whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#6D8196]" /> Status:
            </label>
            <select
              id="product-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs neu-input px-3 py-2 text-[#4A4A4A] bg-[#DCE1E5] font-bold cursor-pointer"
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
        <div className="neu-card rounded-2xl p-4 border-l-4 border-l-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Unable to load products.</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Neumorphic Table */}
      <div className="neu-card rounded-2xl p-5 space-y-4">
        <div className="neu-inset rounded-xl overflow-hidden p-1">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-xs text-left" aria-label="Enriched products">
              <thead>
                <tr className="border-b border-[#CBCBCB]/40 text-[#4A4A4A] bg-[#E2E6E9]/60">
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
              <tbody className="divide-y divide-[#CBCBCB]/30">
                {fetchState === "loading" && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {fetchState === "success" && products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl neu-icon-well text-[#6D8196] flex items-center justify-center">
                          <Package className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-extrabold text-[#4A4A4A]">No products found</p>
                        <p className="text-xs text-[#6D8196] font-bold max-w-xs">Upload a dataset to begin structured catalog enrichment.</p>
                        <Link
                          href="/upload"
                          className="mt-2 px-5 py-2.5 text-xs font-bold neu-btn-accent inline-flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" /> Upload Data
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {fetchState === "success" &&
                  products.map((p) => (
                    <tr key={p.productId} className="hover:bg-[#FFFFE3]/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#4A4A4A]">{p.partNumber}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#4A4A4A]">
                        {p.manufacturerName ?? <span className="text-[#4A4A4A]/40 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#4A4A4A]">
                        {p.brandName ?? <span className="text-[#4A4A4A]/40 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6D8196] font-bold truncate max-w-[180px]">
                        {p.classpath ?? <span className="text-[#4A4A4A]/40 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <ConfidenceCell value={p.confidence} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-[#4A4A4A]/70 whitespace-nowrap text-[11px] font-medium">
                        {formatDate(p.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/products/${p.productId}`}
                          className="neu-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6D8196] hover:text-[#4A4A4A]"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {fetchState === "success" && products.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#4A4A4A] font-bold">
            <span>
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={totalPages !== null && page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
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
