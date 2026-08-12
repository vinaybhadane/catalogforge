"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileText,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, ProductAttribute, ProductAsset } from "@/types";
import { DynamicFieldRenderer, FieldDefinition } from "@/components/products/DynamicFieldRenderer";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Tabs — Section 22
// ─────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
  "Descriptions",
  "Attributes",
  "Dimensions",
  "Assets",
  "Validation",
] as const;
type TabId = typeof TABS[number];

// ─────────────────────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────────────────────

function OverviewTab({ product }: { product: Product }) {
  const fields: { label: string; value: string | null }[] = [
    { label: "Part Number", value: product.partNumber },
    { label: "Manufacturer", value: product.manufacturerName },
    { label: "Brand", value: product.brandName },
    { label: "Manufacturer Part Number", value: product.manufacturerPartNumber },
    { label: "Classpath", value: product.classpath },
    { label: "UNSPSC", value: product.unspsc },
  ];

  const statusColors: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    needs_review: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* Status + Confidence banner */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={cn("px-3 py-1 rounded-lg border text-xs font-bold uppercase", statusColors[product.status] ?? "bg-slate-50 text-slate-700 border-slate-200")}>
          {product.status.replace(/_/g, " ")}
        </span>
        {product.confidence !== null ? (
          <span className={cn("text-sm font-mono font-bold", product.confidence >= 0.85 ? "text-[#047857]" : product.confidence >= 0.6 ? "text-[#B45309]" : "text-[#B91C1C]")}>
            Confidence: {Math.round(product.confidence * 100)}%
          </span>
        ) : (
          <span className="text-sm text-slate-400 italic">Confidence not available</span>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{f.label}</p>
            <p className="text-sm font-semibold text-slate-900">{f.value ?? <span className="text-slate-400 italic">Not provided</span>}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Descriptions Tab — Section 22
// ─────────────────────────────────────────────────────────────

function DescriptionsTab({ product }: { product: Product }) {
  const descriptions: { label: string; value: string | null }[] = [
    { label: "Short Description", value: product.descriptions.shortDescription },
    { label: "Long Description", value: product.descriptions.longDescription },
  ];

  return (
    <div className="space-y-4">
      {descriptions.map((d) => (
        <div key={d.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{d.label}</p>
          {d.value ? (
            <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{d.value}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Not provided</p>
          )}
        </div>
      ))}

      {product.descriptions.bulletPoints.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Bullet Points</p>
          <ul className="list-disc pl-5 space-y-1">
            {product.descriptions.bulletPoints.map((bp, idx) => (
              <li key={idx} className="text-sm text-slate-900">{bp}</li>
            ))}
          </ul>
        </div>
      )}

      {product.features.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Features</p>
          <ul className="list-disc pl-5 space-y-1">
            {product.features.map((f) => (
              <li key={f.featureId} className="text-sm text-slate-900">{f.featureText}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Attributes Tab — Section 46
// ─────────────────────────────────────────────────────────────

function AttributesTab({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) {
    return <p className="text-sm text-slate-400 italic py-8 text-center">No attributes available.</p>;
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
      <table className="w-full text-sm" aria-label="Product attributes">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            {["#", "Label", "Value", "UOM", "Confidence", "Flags"].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {attributes.map((attr) => (
            <tr key={attr.sequence} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{attr.sequence}</td>
              <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{attr.attributeLabel}</td>
              <td className="px-4 py-2.5 text-xs text-slate-900">{attr.attributeValue ?? <span className="text-slate-400 italic">—</span>}</td>
              <td className="px-4 py-2.5 text-xs text-slate-600">{attr.attributeUom ?? "—"}</td>
              <td className="px-4 py-2.5">
                {attr.confidence !== null ? (
                  <span className={cn("text-[11px] font-mono font-bold", attr.confidence >= 0.85 ? "text-[#047857]" : attr.confidence >= 0.6 ? "text-[#B45309]" : "text-[#B91C1C]")}>{Math.round(attr.confidence * 100)}%</span>
                ) : (<span className="text-[11px] text-slate-400 italic">—</span>)}
              </td>
              <td className="px-4 py-2.5">
                {attr.validationFlags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {attr.validationFlags.map((f) => (
                      <span key={f} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-800">{f}</span>
                    ))}
                  </div>
                ) : (<span className="text-[11px] text-slate-400">—</span>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dimensions Tab
// ─────────────────────────────────────────────────────────────

function DimensionsTab({ product }: { product: Product }) {
  const dims = product.dimensions;
  if (!dims) return <p className="text-sm text-slate-400 italic py-8 text-center">Dimensions not provided.</p>;

  const rows = [
    { label: "Height", value: dims.height },
    { label: "Width", value: dims.width },
    { label: "Depth", value: dims.depth },
    { label: "Weight", value: dims.weight },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
      {dims.unitOfMeasure && (
        <p className="text-xs text-slate-500">Unit: <span className="font-semibold text-slate-700">{dims.unitOfMeasure}</span></p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((r) => (
          <div key={r.label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{r.label}</p>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{r.value !== null ? r.value : <span className="text-slate-400 italic text-sm font-normal">—</span>}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Assets Tab — Section 104
// ─────────────────────────────────────────────────────────────

function AssetsTab({ assets }: { assets: ProductAsset[] }) {
  if (assets.length === 0) return <p className="text-sm text-slate-400 italic py-8 text-center">No assets available.</p>;

  const typeIcon = (type: string) => {
    if (type === "image") return <ImageIcon className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-2">
      {assets.map((asset) => (
        <div key={asset.assetId} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {typeIcon(asset.assetType)}
            <div>
              <p className="text-xs font-semibold text-slate-700">{asset.title ?? asset.assetType}</p>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{asset.assetType.replace(/_/g, " ")}</span>
            </div>
          </div>
          <a href={asset.assetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 shrink-0">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Validation Tab
// ─────────────────────────────────────────────────────────────

function ValidationTab({ product }: { product: Product }) {
  const flaggedAttrs = product.attributes.filter((a) => a.validationFlags.length > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Status</p>
        <span className={cn("px-3 py-1 rounded-lg border text-xs font-bold uppercase", product.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : product.status === "needs_review" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200")}>
          {product.status.replace(/_/g, " ")}
        </span>
      </div>

      {flaggedAttrs.length > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Flagged Attributes ({flaggedAttrs.length})</p>
          <div className="space-y-2">
            {flaggedAttrs.map((attr) => (
              <div key={attr.sequence} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-700">{attr.attributeLabel}</span>
                <div className="flex gap-1">
                  {attr.validationFlags.map((f) => (
                    <span key={f} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-100 border-amber-300 text-amber-800">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic py-4 text-center">No validation flags on this product.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page — Section 22
// ─────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("Overview");

  const loadProduct = useCallback(async () => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const data = await apiClient.get<Product>(`/products/${encodeURIComponent(productId)}`);
      setProduct(data);
      setFetchState("success");
    } catch (err) {
      if (err instanceof ApiClientError && (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")) {
        setProduct(null);
        setFetchState("success");
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load product.");
        setFetchState("error");
      }
    }
  }, [productId]);

  useEffect(() => { if (productId) loadProduct(); }, [productId, loadProduct]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb — Section 87 */}
      <div className="flex items-center gap-2">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1D4ED8] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Products
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-mono text-slate-600">{productId}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Detail</h1>
        <button type="button" onClick={loadProduct} disabled={fetchState === "loading"} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#CBD5E1] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
          <RefreshCw className={cn("w-4 h-4", fetchState === "loading" && "animate-spin")} /> Refresh
        </button>
      </div>

      {fetchState === "loading" && <DetailSkeleton />}

      {fetchState === "error" && errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}

      {fetchState === "success" && !product && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Product not found</h3>
          <p className="text-xs text-slate-500 mt-1">This product ID does not exist or the backend has not yet returned data.</p>
        </div>
      )}

      {fetchState === "success" && product && (
        <>
          {/* Tabs — Section 22 */}
          <div className="border-b border-[#E2E8F0] flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-[#1D4ED8] text-[#1D4ED8]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                {tab}
                {tab === "Attributes" && product.attributes.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{product.attributes.length}</span>
                )}
                {tab === "Assets" && product.assets.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{product.assets.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "Overview" && <OverviewTab product={product} />}
            {activeTab === "Descriptions" && <DescriptionsTab product={product} />}
            {activeTab === "Attributes" && <AttributesTab attributes={product.attributes} />}
            {activeTab === "Dimensions" && <DimensionsTab product={product} />}
            {activeTab === "Assets" && <AssetsTab assets={product.assets} />}
            {activeTab === "Validation" && <ValidationTab product={product} />}
          </div>
        </>
      )}
    </div>
  );
}
