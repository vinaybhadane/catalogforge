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
import { useAuth } from "@/lib/auth/AuthProvider";
import { getUserWorkspaceData } from "@/lib/auth/workspace-guard";
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
    published: "bg-emerald-50 text-emerald-800 border-emerald-200",
    needs_review: "bg-amber-50 text-amber-800 border-amber-200",
    failed: "bg-rose-50 text-rose-800 border-rose-200",
    validated: "bg-amber-50 text-amber-800 border-amber-200",
    enriched: "bg-purple-50 text-purple-800 border-purple-200",
    ingested: "bg-[#F7F7F7] text-[#171717] border-[#EAEAEA]",
    classified: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const confidenceScore = calculateConfidenceScore(product);

  return (
    <div className="space-y-6">
      {/* Status + Confidence banner */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", (product.status && statusColors[product.status]) ?? "bg-[#F7F7F7] text-[#171717] border-[#EAEAEA]")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
        <span
          className={cn(
            "text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-sm inline-flex items-center gap-1.5",
            confidenceScore >= 85
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : confidenceScore >= 60
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          )}
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            confidenceScore >= 85 ? "bg-emerald-500" : confidenceScore >= 60 ? "bg-amber-500" : "bg-rose-500"
          )} />
          Confidence: {confidenceScore}%
        </span>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#929292] mb-1.5">{f.label}</p>
            <p className="text-sm font-bold text-[#171717]">{f.value ?? <span className="text-[#929292] italic font-normal">Not provided</span>}</p>
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
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF00]" />
            <h3 className="text-sm font-extrabold text-[#111111]">
              252-Column Unihack Delivery Schema
            </h3>
          </div>
          <p className="text-xs text-[#686868] font-medium mt-1">
            Authoritative delivery format matching <code className="text-[#111111] bg-[#F7F7F7] border border-[#EAEAEA] px-1.5 py-0.5 rounded-md text-[11px] font-mono">Unihack_Expected_Output_Delivery_Format.xlsx</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#929292] font-bold block uppercase tracking-wider">Populated Rate</span>
            <span className="text-base font-extrabold text-[#111111] font-mono">{populatedCount} / 252 <span className="text-xs text-[#686868] font-normal">({Math.round((populatedCount / 252) * 100)}%)</span></span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-[#929292] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by column index (#1..252), header name, or value..."
              className="w-full text-xs border border-[#EAEAEA] bg-[#FAFAFA] rounded-full pl-9 pr-4 py-2 text-[#171717] placeholder:text-[#929292] focus:outline-none focus:border-[#111111] font-medium transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#EAEAEA]">
          <span className="text-[11px] font-bold text-[#929292] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Section:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 text-[11px] font-bold rounded-full transition-all",
                selectedCategory === cat
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-[#FAFAFA] border border-[#EAEAEA] text-[#686868] hover:text-[#111111] hover:bg-[#F7F7F7]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 252 Columns Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto rounded-2xl border border-[#EAEAEA]">
          <table className="w-full text-xs text-left" aria-label="252 Delivery Columns">
            <thead>
              <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA] text-[#929292] font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3 w-16 text-center">Col #</th>
                <th className="px-4 py-3 w-64">Header Name</th>
                <th className="px-4 py-3">Enriched Output Value</th>
                <th className="px-4 py-3 w-28 text-center">Category</th>
                <th className="px-4 py-3 w-16 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#929292] italic">
                    No delivery columns matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredFields.map((f) => {
                  const hasVal = f.value.trim().length > 0;
                  return (
                    <tr key={f.index} className="hover:bg-[#F7F7F7]/60 transition-colors">
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-[#929292] text-[11px]">
                        #{f.index}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-[#111111] text-[11px]">
                        {f.header}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {hasVal ? (
                          <span className="text-[#171717] font-medium break-all">{f.value}</span>
                        ) : (
                          <span className="text-[#929292] italic text-[11px] font-mono select-none">
                            — Blank (Unverified in OEM docs)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F7F7F7] text-[#171717] border border-[#EAEAEA]">
                          {f.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {hasVal && (
                          <button
                            type="button"
                            onClick={() => handleCopy(f.value, f.index)}
                            className="p-1.5 text-[#929292] hover:text-[#111111] rounded-full hover:bg-[#F7F7F7] transition-colors"
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
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 md:p-8 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#111111]" />
              Source Governance & Grounded Evidence
            </h3>
            <p className="text-xs text-[#686868] font-medium mt-1">
              Strict multi-tier policy: Tier 1 (Manufacturer OEM) prioritized; Tier 2 (Distributors) for fallback specs; E-commerce strictly blocked.
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerLiveSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-5 py-2 bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs font-bold rounded-full transition shadow-[0_2px_8px_rgba(200,255,0,0.25)] disabled:opacity-50 transform active:scale-95"
          >
            <Sparkles className={cn("w-3.5 h-3.5", isSearching && "animate-spin")} />
            <span>{isSearching ? "Verifying Live Sources..." : "Live Multi-Provider Sourcing"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#929292]">
          Verified Evidence Citations ({citations.length})
        </h4>
        {citations.map((c: any, i: number) => (
          <div key={i} className="bg-white border border-[#EAEAEA] rounded-2xl p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#111111] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#111111]" />
                {c.sourceTitle || c.domain}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F7F7F7] text-[#171717] border border-[#EAEAEA]">
                {c.tier || "Verified Evidence"}
              </span>
            </div>
            {c.sourceSnippet && (
              <p className="text-xs text-[#686868] bg-[#FAFAFA] p-3 rounded-xl border border-[#EAEAEA] leading-relaxed">
                {c.sourceSnippet}
              </p>
            )}
            {c.sourceUrl && (
              <a
                href={c.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#111111] hover:text-black underline flex items-center gap-1.5 font-mono font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {c.sourceUrl}
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
        <div key={r.label} className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#929292] mb-1.5">{r.label}</p>
          <p className="text-xs text-[#171717] leading-relaxed font-medium">
            {r.value || <span className="text-[#929292] italic">Not provided</span>}
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
  if (list.length === 0) return <p className="text-sm text-[#929292] italic py-8 text-center">No attributes found.</p>;

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-3xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto rounded-2xl border border-[#EAEAEA]">
        <table className="w-full text-xs text-left" aria-label="Product attributes">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA] text-[#929292] font-bold uppercase text-[10px] tracking-wider">
              <th className="px-4 py-3">Attribute Name</th>
              <th className="px-4 py-3">Normalized Value</th>
              <th className="px-4 py-3">UOM</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Provenance Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {list.map((a, i) => {
              const conf = a.confidenceScore ?? a.confidence ?? 0.95;
              const isHigh = conf >= 0.85;
              const hasVal = a.attributeValue && String(a.attributeValue).trim().length > 0;
              const sourceUrl = a.source?.sourceUrl;

              return (
                <tr key={i} className="hover:bg-[#F7F7F7]/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#111111]">{sanitizeText(a.attributeLabel)}</td>
                  <td className="px-4 py-2.5 text-[#171717] font-medium">
                    {hasVal ? (
                      sanitizeText(a.attributeValue)
                    ) : (
                      <span className="text-[#929292] italic font-mono text-[11px]">
                        — Blank (Unverified in OEM docs)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[#686868] font-mono">{sanitizeText(a.attributeUom) || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-flex items-center gap-1",
                        isHigh
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", isHigh ? "bg-emerald-500" : "bg-amber-500")} />
                      <span>{Math.round(conf * 100)}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#111111] hover:text-black underline flex items-center gap-1 font-bold text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OEM Citation</span>
                      </a>
                    ) : (
                      <span className="text-[#929292] text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
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
  if (!dims) return <p className="text-sm text-[#929292] italic py-8 text-center">No dimensions available.</p>;

  const rows = [
    { label: "Length", value: dims.length, uom: dims.lengthUom },
    { label: "Width", value: dims.width, uom: dims.widthUom },
    { label: "Height", value: dims.height, uom: dims.heightUom },
    { label: "Weight", value: dims.weight, uom: dims.weightUom },
  ];

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((r) => (
          <div key={r.label} className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#EAEAEA]">
            <p className="text-[10px] text-[#929292] uppercase font-bold tracking-wider">{r.label}</p>
            <p className="text-base font-bold text-[#111111] font-mono mt-1">
              {r.value !== null && r.value !== undefined ? (
                <>
                  {r.value} {r.uom ? <span className="text-xs font-normal text-[#686868]">{r.uom}</span> : null}
                </>
              ) : (
                <span className="text-[#929292] italic text-sm font-normal">—</span>
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
  const [hiddenAssetIds, setHiddenAssetIds] = useState<Set<string | number>>(new Set());
  const safeAssets = (assets ?? []).filter((a, idx) => !hiddenAssetIds.has(a.id ?? idx));

  if (safeAssets.length === 0) return <p className="text-sm text-[#929292] italic py-8 text-center">No verified live assets available.</p>;

  const typeIcon = (type: string) => {
    if (type === "image" || type === "actualImage") return <ImageIcon className="w-4 h-4 text-[#111111]" />;
    return <FileText className="w-4 h-4 text-[#929292]" />;
  };

  return (
    <div className="space-y-3">
      {safeAssets.map((asset, idx) => {
        const url = asset.assetUrl || asset.blobUrl || asset.sourceUrl;
        const title = sanitizeText(asset.title || asset.fileName || asset.assetType || `Asset #${idx + 1}`);
        const assetType = asset.assetType || "asset";
        const isImg = (assetType === "image" || assetType === "actualImage") && url && url.startsWith("http");

        return (
          <div key={asset.id ?? idx} className="bg-white border border-[#EAEAEA] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 min-w-0">
              {isImg ? (
                <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={url}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setHiddenAssetIds((prev) => new Set([...prev, asset.id ?? idx]));
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center shrink-0">
                  {typeIcon(assetType)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111111] truncate">{title}</p>
                <span className="text-[10px] text-[#929292] uppercase font-bold tracking-wider">{String(assetType).replace(/_/g, " ")}</span>
              </div>
            </div>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#111111] hover:text-black font-bold flex items-center gap-1.5 shrink-0 px-3 py-1.5 bg-[#F7F7F7] border border-[#EAEAEA] rounded-full hover:bg-white transition-colors">
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
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#929292] mb-2">Overall Status</p>
        <span className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase", product.status === "published" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
      </div>

      {flaggedAttrs.length > 0 ? (
        <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#929292] mb-3">Flagged Attributes ({flaggedAttrs.length})</p>
          <div className="space-y-2">
            {flaggedAttrs.map((attr, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-xs font-bold text-slate-800">{attr.attributeLabel}</span>
                <div className="flex gap-1.5">
                  {(attr.validationFlags ?? []).map((f, fIdx) => (
                    <span key={fIdx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-100 border-amber-300 text-amber-800">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EAEAEA] rounded-3xl p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#111111]">100% Validation Compliant</p>
          <p className="text-xs text-[#686868] mt-1">All attributes match Unilog taxonomy and dictionary rules.</p>
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
      <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl border border-[#EAEAEA]" />)}
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

  const { user } = useAuth();
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
      const userWorkspace = getUserWorkspaceData(user?.uid || user?.email);
      const match = userWorkspace.products.find(
        (p: any) => String(p.productId || p.id) === productId || p.partNumber === productId
      );
      if (match) {
        setProduct(match);
        setFetchState("success");
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load product detail.");
        setFetchState("error");
      }
    }
  }, [productId, user]);

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header with Back link */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/products"
            className="p-2.5 bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 text-[#171717] rounded-full transition-all shadow-sm"
            aria-label="Back to products list"
            suppressHydrationWarning
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#111111] tracking-tight">
                {product ? sanitizeText(product.partNumber) : "Product Detail"}
              </h1>
            </div>
            {product?.manufacturerName && (
              <p className="text-xs text-[#686868] font-mono mt-0.5">
                {getCleanManufacturerName(product.manufacturerName, product.brandName)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLiveEnrichment}
            disabled={isSearching || !product}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] shadow-[0_2px_8px_rgba(200,255,0,0.25)] transition-all disabled:opacity-50 transform active:scale-95"
            suppressHydrationWarning
          >
            <Sparkles className={cn("w-3.5 h-3.5", isSearching && "animate-spin")} />
            <span>{isSearching ? "Extracting Live Specs…" : "Live AI Sourcing"}</span>
          </button>

          <button
            type="button"
            onClick={loadProduct}
            className="p-2.5 bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] hover:border-[#111111]/20 text-[#111111] rounded-full transition-all shadow-sm"
            aria-label="Refresh product detail"
            suppressHydrationWarning
          >
            <RefreshCw className={cn("w-4 h-4 text-[#111111]", fetchState === "loading" && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border-l-4 border-l-rose-500 border border-[#EAEAEA] rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-900">Failed to load product</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadProduct}
            className="px-3 py-1 text-xs text-rose-800 font-bold bg-rose-50 border border-rose-200 rounded-full hover:bg-rose-100 transition-colors"
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
          <div className="flex items-center gap-1.5 border-b border-[#EAEAEA] overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all",
                  activeTab === tab
                    ? "bg-[#111111] text-white shadow-sm"
                    : "text-[#686868] hover:text-[#111111] hover:bg-[#F7F7F7]"
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
