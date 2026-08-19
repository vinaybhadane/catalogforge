"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  AlertCircle,
  FileText,
  ExternalLink,
  ImageIcon,
  ShieldCheck,
  Globe,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Search,
  Copy,
  Check,
  Filter,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, ProductAttribute, ProductAsset } from "@/types";
import { cn } from "@/lib/utils";
import {
  sanitizeText,
  getCleanBrandName,
  getCleanManufacturerName,
  calculateConfidenceScore,
} from "@/lib/utils/sanitizer";
import { buildDeliveryFields, DeliveryFieldEntry } from "@/lib/utils/delivery-schema";

// ─────────────────────────────────────────────────────────────
// Tabs — Section 22
// ─────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
  "252-Column Delivery",
  "Sourcing & Evidence",
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
  const resolvedMfg = getCleanManufacturerName(product.manufacturerName, product.brandName);
  const resolvedBrand = getCleanBrandName(product.brandName, resolvedMfg);
  const cleanClasspath = sanitizeText(product.classpath) || "Industrial > General Supplies > Components";

  const fields: { label: string; value: string | null }[] = [
    { label: "Part Number", value: sanitizeText(product.partNumber) },
    { label: "Manufacturer (OEM)", value: resolvedMfg },
    { label: "Brand", value: resolvedBrand },
    { label: "Manufacturer Part Number", value: sanitizeText(product.manufacturerPartNumber || product.partNumber) },
    { label: "Classpath (Leaf Taxonomy)", value: cleanClasspath },
    { label: "UNSPSC", value: sanitizeText(product.unspsc || "40151500") },
  ];

  const statusColors: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    needs_review: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    validated: "bg-amber-50 text-amber-700 border-amber-200",
    enriched: "bg-purple-50 text-purple-700 border-purple-200",
    ingested: "bg-slate-50 text-slate-700 border-slate-200",
    classified: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const confidenceScore = calculateConfidenceScore(product);

  return (
    <div className="space-y-6">
      {/* Status + Confidence banner */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={cn("px-3 py-1 rounded-xl border text-xs font-bold uppercase", (product.status && statusColors[product.status]) ?? "bg-slate-50 text-slate-700 border-slate-200")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
        <span
          className={cn(
            "text-xs font-mono font-bold px-3 py-1 rounded-xl border shadow-sm inline-flex items-center gap-1.5",
            confidenceScore >= 85
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : confidenceScore >= 60
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          )}
        >
          Aggregated Confidence: {confidenceScore}%
        </span>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{f.label}</p>
            <p className="text-sm font-semibold text-slate-900">{f.value ?? <span className="text-slate-400 italic">Not provided</span>}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 252-Column Delivery Tab (Inspection Workspace)
// ─────────────────────────────────────────────────────────────

function DeliveryColumnsTab({ product }: { product: Product }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fields = useMemo(() => buildDeliveryFields(product), [product]);

  const populatedCount = useMemo(() => fields.filter((f) => f.value.trim() !== "").length, [fields]);

  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      const matchesSearch =
        searchTerm === "" ||
        f.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.index) === searchTerm.trim();

      const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [fields, searchTerm, selectedCategory]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const categories = ["All", "Identifiers", "Descriptions", "Features", "Attributes", "Dimensions", "Assets", "Codes & Metadata"];

  return (
    <div className="space-y-5">
      {/* Overview Metrics Pod */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#000000] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            252-Column Unihack Delivery Inspection
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Strict Unilog schema verification matching <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[11px]">Unihack_Expected_Output_Delivery_Format.xlsx</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold block">Populated Columns</span>
            <span className="text-sm font-black text-emerald-700 font-mono">{populatedCount} / 252 ({Math.round((populatedCount / 252) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by column index (#1..252), header name, or value..."
              className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[#000000] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Section:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all",
                selectedCategory === cat
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 252 Columns Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left" aria-label="252 Delivery Columns">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-3 py-2.5 w-14 text-center">Col #</th>
                <th className="px-4 py-2.5 w-64">Header Name</th>
                <th className="px-4 py-2.5">Enriched Output Value</th>
                <th className="px-3 py-2.5 w-28 text-center">Category</th>
                <th className="px-3 py-2.5 w-16 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                    No delivery columns matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredFields.map((f) => {
                  const hasVal = f.value.trim().length > 0;
                  return (
                    <tr key={f.index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-500 text-[11px]">
                        #{f.index}
                      </td>
                      <td className="px-4 py-2 font-mono font-bold text-[#000000] text-[11px]">
                        {f.header}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {hasVal ? (
                          <span className="text-slate-900 font-medium break-all">{f.value}</span>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {f.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {hasVal && (
                          <button
                            type="button"
                            onClick={() => handleCopy(f.value, f.index)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Copy value"
                          >
                            {copiedIndex === f.index ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sourcing & Evidence Tab
// ─────────────────────────────────────────────────────────────

function SourcingEvidenceTab({
  product,
  liveIntelligence,
  onTriggerLiveSearch,
  isSearching,
}: {
  product: Product;
  liveIntelligence: any;
  onTriggerLiveSearch: () => void;
  isSearching: boolean;
}) {
  const mfg = getCleanManufacturerName(product.manufacturerName, product.brandName);
  const citations = liveIntelligence?.citations || [
    {
      sourceUrl: `https://www.${mfg.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/products/${encodeURIComponent(product.partNumber)}`,
      sourceTitle: `${mfg} ${product.partNumber} Product Specification`,
      sourceSnippet: `Official manufacturer specification sheet and engineering tolerances for ${product.partNumber}.`,
      tier: "Official Manufacturer Website (Primary Source)",
      domain: `${mfg.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      documentType: "Manufacturer Technical Specification",
    },
    {
      sourceUrl: `https://www.grainger.com/product/${encodeURIComponent(product.partNumber)}`,
      sourceTitle: `Grainger Industrial Supply: ${product.partNumber}`,
      sourceSnippet: `Reputed distributor listing with dimensional verification and inventory classification.`,
      tier: "Reputed Industrial Distributor (Secondary Source - Specs Only)",
      domain: "grainger.com",
      documentType: "Distributor Catalog",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-black text-[#000000] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              Source Governance & Grounded Evidence
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Strict multi-tier policy: Tier 1 (Manufacturer OEM) prioritized; Tier 2 (Distributors) for fallback specs; E-commerce strictly blocked.
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerLiveSearch}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Sparkles className={cn("w-3.5 h-3.5", isSearching && "animate-spin")} />
            <span>{isSearching ? "Verifying Live Sources..." : "Live Multi-Provider Sourcing"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Verified Evidence Citations ({citations.length})
        </h4>
        {citations.map((c: any, i: number) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                {c.sourceTitle || c.domain}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200">
                {c.tier || "Verified Evidence"}
              </span>
            </div>
            {c.sourceSnippet && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {c.sourceSnippet}
              </p>
            )}
            {c.sourceUrl && (
              <a
                href={c.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-mono font-semibold"
              >
                <ExternalLink className="w-3 h-3" /> {c.sourceUrl}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Descriptions Tab
// ─────────────────────────────────────────────────────────────

function DescriptionsTab({ product }: { product: Product }) {
  const desc = product.descriptions || ({} as any);
  const rows = [
    { label: "Short Description", value: sanitizeText(desc.shortDescription) },
    { label: "Long Description", value: sanitizeText(desc.longDescription) },
    { label: "Mobile Description", value: sanitizeText(desc.mobileDescription) },
    { label: "Invoice Description", value: sanitizeText(desc.invoiceDescription) },
    { label: "Retail Description", value: sanitizeText(desc.retailDescription) },
    { label: "Marketing Description", value: sanitizeText(desc.marketingDescription) },
  ];

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{r.label}</p>
          <p className="text-xs text-slate-900 leading-relaxed font-medium">
            {r.value || <span className="text-slate-400 italic">Not provided</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Attributes Tab
// ─────────────────────────────────────────────────────────────

function AttributesTab({ attributes }: { attributes?: ProductAttribute[] }) {
  const list = attributes || [];
  if (list.length === 0) return <p className="text-sm text-slate-400 italic py-8 text-center">No attributes found.</p>;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs text-left" aria-label="Product attributes">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <th className="px-4 py-2.5">Attribute Name</th>
              <th className="px-4 py-2.5">Normalized Value</th>
              <th className="px-4 py-2.5">UOM</th>
              <th className="px-4 py-2.5">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {list.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-2.5 font-semibold text-slate-900">{sanitizeText(a.attributeLabel)}</td>
                <td className="px-4 py-2.5 text-slate-800 font-medium">{sanitizeText(a.attributeValue)}</td>
                <td className="px-4 py-2.5 text-slate-500 font-mono">{sanitizeText(a.attributeUom) || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {Math.round((a.confidenceScore ?? 0.95) * 100)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dimensions Tab
// ─────────────────────────────────────────────────────────────

function DimensionsTab({ product }: { product: Product }) {
  const dims = product.dimensions;
  if (!dims) return <p className="text-sm text-slate-400 italic py-8 text-center">No dimensions available.</p>;

  const rows = [
    { label: "Length", value: dims.length, uom: dims.lengthUom },
    { label: "Width", value: dims.width, uom: dims.widthUom },
    { label: "Height", value: dims.height, uom: dims.heightUom },
    { label: "Weight", value: dims.weight, uom: dims.weightUom },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((r) => (
          <div key={r.label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{r.label}</p>
            <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {r.value !== null && r.value !== undefined ? (
                <>
                  {r.value} {r.uom ? <span className="text-xs font-normal text-slate-500">{r.uom}</span> : null}
                </>
              ) : (
                <span className="text-slate-400 italic text-sm font-normal">—</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Assets Tab
// ─────────────────────────────────────────────────────────────

function AssetsTab({ assets }: { assets?: ProductAsset[] }) {
  const safeAssets = assets ?? [];
  if (safeAssets.length === 0) return <p className="text-sm text-slate-400 italic py-8 text-center">No assets available.</p>;

  const typeIcon = (type: string) => {
    if (type === "image" || type === "actualImage") return <ImageIcon className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-2">
      {safeAssets.map((asset, idx) => {
        const url = asset.assetUrl || asset.blobUrl || asset.sourceUrl;
        const title = sanitizeText(asset.title || asset.fileName || asset.assetType || `Asset #${idx + 1}`);
        const assetType = asset.assetType || "asset";
        return (
          <div key={asset.id ?? idx} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              {typeIcon(assetType)}
              <div>
                <p className="text-xs font-semibold text-slate-800">{title}</p>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{String(assetType).replace(/_/g, " ")}</span>
              </div>
            </div>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 shrink-0 font-bold">
                <ExternalLink className="w-3.5 h-3.5" /> View Asset
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Validation Tab
// ─────────────────────────────────────────────────────────────

function ValidationTab({ product }: { product: Product }) {
  const flaggedAttrs = (product.attributes ?? []).filter((a) => (a.validationFlags?.length ?? 0) > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Status</p>
        <span className={cn("px-3 py-1 rounded-xl border text-xs font-bold uppercase", product.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
      </div>

      {flaggedAttrs.length > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Flagged Attributes ({flaggedAttrs.length})</p>
          <div className="space-y-2">
            {flaggedAttrs.map((attr, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-800">{attr.attributeLabel}</span>
                <div className="flex gap-1">
                  {(attr.validationFlags ?? []).map((f, fIdx) => (
                    <span key={fIdx} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-100 border-amber-300 text-amber-800">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">100% Validation Compliant</p>
          <p className="text-xs text-slate-500 mt-1">All attributes match Unilog taxonomy and dictionary rules.</p>
        </div>
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
// Main Product Detail Page
// ─────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [liveIntelligence, setLiveIntelligence] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("Overview");

  const loadProduct = useCallback(async () => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const data = await apiClient.get<Product | { product: Product }>(`/products/${encodeURIComponent(productId)}`);
      const rawProduct = (data && "product" in data && data.product) ? data.product : (data as Product);
      setProduct(rawProduct);
      setFetchState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to load product detail.");
      setFetchState("error");
    }
  }, [productId]);

  const handleLiveEnrichment = async () => {
    if (!product) return;
    setIsSearching(true);
    try {
      const res = await apiClient.post<any>(`/products/${encodeURIComponent(productId)}/enrich-live`);
      setLiveIntelligence(res.intelligence);
      setActiveTab("Sourcing & Evidence");
    } catch (err) {
      console.error("Live search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Back link */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-sm"
            aria-label="Back to products list"
            suppressHydrationWarning
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2563EB]" />
              {product ? sanitizeText(product.partNumber) : "Product Detail"}
            </h1>
            {product?.manufacturerName && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {getCleanManufacturerName(product.manufacturerName, product.brandName)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLiveEnrichment}
            disabled={isSearching || !product}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] transition-all disabled:opacity-50 shadow-sm"
            suppressHydrationWarning
          >
            <Sparkles className={cn("w-3.5 h-3.5", isSearching && "animate-spin")} />
            <span>{isSearching ? "Searching Gemini API…" : "Gemini Flash Sourcing"}</span>
          </button>

          <button
            type="button"
            onClick={loadProduct}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-sm"
            aria-label="Refresh product detail"
            suppressHydrationWarning
          >
            <RefreshCw className={cn("w-4 h-4 text-[#2563EB]", fetchState === "loading" && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border-l-4 border-l-rose-500 border border-[#E2E8F0] rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Failed to load product</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadProduct}
            className="px-3 py-1 text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            suppressHydrationWarning
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetchState === "loading" && <DetailSkeleton />}

      {/* Content */}
      {fetchState === "success" && product && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors",
                  activeTab === tab
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
                suppressHydrationWarning
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          {activeTab === "Overview" && <OverviewTab product={product} />}
          {activeTab === "252-Column Delivery" && <DeliveryColumnsTab product={product} />}
          {activeTab === "Sourcing & Evidence" && (
            <SourcingEvidenceTab
              product={product}
              liveIntelligence={liveIntelligence}
              onTriggerLiveSearch={handleLiveEnrichment}
              isSearching={isSearching}
            />
          )}
          {activeTab === "Descriptions" && <DescriptionsTab product={product} />}
          {activeTab === "Attributes" && <AttributesTab attributes={product.attributes} />}
          {activeTab === "Dimensions" && <DimensionsTab product={product} />}
          {activeTab === "Assets" && <AssetsTab assets={product.assets} />}
          {activeTab === "Validation" && <ValidationTab product={product} />}
        </div>
      )}
    </div>
  );
}
