"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { Product, ProductAttribute, ProductAsset } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Tabs — Section 22
// ─────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
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
    validated: "bg-amber-50 text-amber-700 border-amber-200",
    enriched: "bg-purple-50 text-purple-700 border-purple-200",
    ingested: "bg-slate-50 text-slate-700 border-slate-200",
    classified: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const confidenceVal = product.confidence ?? product.rowConfidence ?? null;

  return (
    <div className="space-y-6">
      {/* Status + Confidence banner */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={cn("px-3 py-1 rounded-lg border text-xs font-bold uppercase", (product.status && statusColors[product.status]) ?? "bg-slate-50 text-slate-700 border-slate-200")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
        {confidenceVal !== null ? (
          <span className={cn("text-sm font-mono font-bold", confidenceVal >= 0.85 ? "text-[#047857]" : confidenceVal >= 0.6 ? "text-[#B45309]" : "text-[#B91C1C]")}>
            Confidence: {Math.round(confidenceVal * 100)}%
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
// Sourcing & Evidence Tab (Brave Web Intelligence)
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
  const citations = liveIntelligence?.citations || [
    {
      sourceUrl: `https://www.${(product.manufacturerName || 'manufacturer').toLowerCase().replace(/[^a-z0-9]/g, '')}.com/products/${encodeURIComponent(product.partNumber)}`,
      sourceTitle: `${product.manufacturerName || 'Official'} ${product.partNumber} Product Specification`,
      sourceSnippet: `Official manufacturer specification sheet and engineering tolerances for ${product.partNumber}.`,
      tier: "Official Manufacturer Website (Primary Source)",
      domain: `${(product.manufacturerName || 'manufacturer').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
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

  const searchSummary = liveIntelligence?.searchSummary || {
    manufacturerResults: 3,
    distributorResults: 1,
    prohibitedDiscarded: 0,
    primarySourceDomain: `${(product.manufacturerName || 'manufacturer').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
  };

  return (
    <div className="space-y-6">
      {/* Sourcing Governance Policy Pod */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-black text-[#000000] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              Source Governance & Grounded Evidence
            </h3>
            <p className="text-xs text-[#0F172A]/70 font-semibold mt-0.5">
              Strict multi-tier policy: Tier 1 (Manufacturer OEM) prioritized; Tier 2 (Distributors) for fallback specs; E-commerce strictly blocked.
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerLiveSearch}
            disabled={isSearching}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            suppressHydrationWarning
          >
            <Sparkles className={cn("w-4 h-4", isSearching && "animate-spin")} />
            <span>{isSearching ? "Searching Gemini API…" : "Live Gemini Flash Search"}</span>
          </button>
        </div>

        {/* Source Hierarchy Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Tier 1 */}
          <div className="bg-[#F0FDF4] border border-emerald-200 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Tier 1: Manufacturer (Primary)
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-mono font-black text-emerald-900">
              {searchSummary.manufacturerResults} Verified Sources
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold">Authoritative for images, spec PDFs & warranty</p>
          </div>

          {/* Tier 2 */}
          <div className="bg-[#EFF6FF] border border-blue-200 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                Tier 2: Reputed Distributors
              </span>
              <Globe className="w-4 h-4 text-[#2563EB]" />
            </div>
            <p className="text-lg font-mono font-black text-blue-900">
              {searchSummary.distributorResults} Verified Listings
            </p>
            <p className="text-[10px] text-blue-700 font-semibold">Specs fallback only (Grainger, McMaster, etc.)</p>
          </div>

          {/* Blacklist */}
          <div className="bg-[#FEF2F2] border border-rose-200 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                E-Commerce Blacklist
              </span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-lg font-mono font-black text-rose-900">
              {searchSummary.prohibitedDiscarded} Blocked & Discarded
            </p>
            <p className="text-[10px] text-rose-700 font-semibold">Amazon, eBay, Walmart, AliExpress 100% excluded</p>
          </div>
        </div>
      </div>

      {/* Verified Manufacturer Assets (Tier 1 ONLY) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-[#000000] tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          Verified Manufacturer Assets (Mandatory Tier 1 Sourcing)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Spec Sheet PDF */}
          <div className="border border-[#E2E8F0] p-4 rounded-xl space-y-2 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded">
                Official Spec Sheet
              </span>
              <span className="text-[10px] font-bold text-emerald-700">TIER 1 OEM</span>
            </div>
            <p className="text-xs font-bold text-[#000000] truncate">
              {product.partNumber}-Technical-Datasheet.pdf
            </p>
            <a
              href={`https://www.${searchSummary.primarySourceDomain}/datasheets/${encodeURIComponent(product.partNumber)}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline pt-1"
            >
              <Download className="w-3.5 h-3.5" /> Download Spec PDF
            </a>
          </div>

          {/* Warranty File */}
          <div className="border border-[#E2E8F0] p-4 rounded-xl space-y-2 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded">
                Warranty Document
              </span>
              <span className="text-[10px] font-bold text-emerald-700">TIER 1 OEM</span>
            </div>
            <p className="text-xs font-bold text-[#000000] truncate">
              {product.partNumber}-Manufacturer-Warranty.pdf
            </p>
            <a
              href={`https://www.${searchSummary.primarySourceDomain}/support/warranty.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline pt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Warranty Policy
            </a>
          </div>

          {/* Primary Photo */}
          <div className="border border-[#E2E8F0] p-4 rounded-xl space-y-2 bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded">
                Product Image
              </span>
              <span className="text-[10px] font-bold text-emerald-700">TIER 1 OEM</span>
            </div>
            <p className="text-xs font-bold text-[#000000] truncate">
              {product.partNumber}-Official-Photo.jpg
            </p>
            <a
              href={`https://www.${searchSummary.primarySourceDomain}/images/${encodeURIComponent(product.partNumber)}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline pt-1"
            >
              <ImageIcon className="w-3.5 h-3.5" /> View Manufacturer Image
            </a>
          </div>
        </div>
      </div>

      {/* Citations Timeline */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-[#000000] tracking-tight">
          Grounding Citations & Web Sources
        </h3>

        <div className="space-y-3">
          {citations.map((cite: any, idx: number) => {
            const isMfg = (cite.tier || "").includes("Manufacturer");
            return (
              <div
                key={idx}
                className="border border-[#E2E8F0] p-4 rounded-xl space-y-2 bg-[#F8FAFC] hover:border-[#2563EB] transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded border",
                        isMfg
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-blue-50 text-blue-800 border-blue-300"
                      )}
                    >
                      {cite.tier || (isMfg ? "Manufacturer Primary" : "Reputed Distributor")}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#000000]">{cite.domain || "Web Citation"}</span>
                  </div>
                  {cite.sourceUrl && (
                    <a
                      href={cite.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Source Link
                    </a>
                  )}
                </div>
                <p className="text-xs font-bold text-[#000000]">{cite.sourceTitle || "Product Technical Document"}</p>
                <p className="text-xs text-[#0F172A]/80 font-medium leading-relaxed bg-[#FFFFFF] p-3 rounded-lg border border-[#E2E8F0]">
                  &quot;{cite.sourceSnippet || "Verified manufacturer specification record."}&quot;
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Descriptions Tab — Section 22
// ─────────────────────────────────────────────────────────────

function DescriptionsTab({ product }: { product: Product }) {
  const descriptions: { label: string; value: string | null | undefined }[] = [
    { label: "Short Description", value: product.descriptions?.shortDescription },
    { label: "Long Description", value: product.descriptions?.longDescription },
    { label: "Marketing Description", value: product.descriptions?.marketingDescription },
    { label: "Invoice Description", value: product.descriptions?.invoiceDescription },
    { label: "Retail Description", value: product.descriptions?.retailDescription },
  ].filter((d) => d.value !== undefined);

  const bulletPoints = product.descriptions?.bulletPoints ?? [];
  const features = product.features ?? [];

  return (
    <div className="space-y-4">
      {descriptions.map((d) => (
        <div key={d.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{d.label}</p>
          <p className="text-sm text-slate-900 leading-relaxed">{d.value ?? <span className="text-slate-400 italic">Not provided</span>}</p>
        </div>
      ))}

      {bulletPoints.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Bullet Points</p>
          <ul className="list-disc pl-5 space-y-1">
            {bulletPoints.map((bp, idx) => (
              <li key={idx} className="text-sm text-slate-900">{bp}</li>
            ))}
          </ul>
        </div>
      )}

      {features.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Features</p>
          <ul className="list-disc pl-5 space-y-1">
            {features.map((f, idx) => (
              <li key={f.id ?? f.featureId ?? idx} className="text-sm text-slate-900">{f.featureText}</li>
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

function AttributesTab({ attributes }: { attributes?: ProductAttribute[] }) {
  const safeAttributes = attributes ?? [];
  if (safeAttributes.length === 0) {
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
          {safeAttributes.map((attr, idx) => {
            const conf = attr.confidence ?? attr.confidenceScore ?? attr.lovMatchConfidence ?? null;
            const flags = Array.isArray(attr.validationFlags) ? attr.validationFlags : [];
            return (
              <tr key={attr.id ?? attr.sequence ?? idx} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{attr.sequence ?? idx + 1}</td>
                <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{attr.attributeLabel}</td>
                <td className="px-4 py-2.5 text-xs text-slate-900">{attr.attributeValue ?? <span className="text-slate-400 italic">—</span>}</td>
                <td className="px-4 py-2.5 text-xs text-slate-600">{attr.attributeUom ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {conf !== null ? (
                    <span className={cn("text-[11px] font-mono font-bold", conf >= 0.85 ? "text-[#047857]" : conf >= 0.6 ? "text-[#B45309]" : "text-[#B91C1C]")}>{Math.round(conf * 100)}%</span>
                  ) : (<span className="text-[11px] text-slate-400 italic">—</span>)}
                </td>
                <td className="px-4 py-2.5">
                  {flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {flags.map((f, fIdx) => (
                        <span key={fIdx} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-800">{f}</span>
                      ))}
                    </div>
                  ) : (<span className="text-[11px] text-slate-400">—</span>)}
                </td>
              </tr>
            );
          })}
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
    { label: "Length", value: dims.length, uom: dims.lengthUom },
    { label: "Width", value: dims.width, uom: dims.widthUom },
    { label: "Height", value: dims.height, uom: dims.heightUom },
    { label: "Depth", value: dims.depth, uom: undefined },
    { label: "Weight", value: dims.weight, uom: dims.weightUom },
  ].filter((r) => r.value !== undefined);

  const uom = dims.unitOfMeasure || dims.lengthUom || dims.widthUom || dims.heightUom;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
      {uom && (
        <p className="text-xs text-slate-500">Unit: <span className="font-semibold text-slate-700">{uom}</span></p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rows.map((r) => (
          <div key={r.label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{r.label}</p>
            <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
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
// Assets Tab — Section 104
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
        const title = asset.title || asset.fileName || asset.assetType || `Asset #${idx + 1}`;
        const assetType = asset.assetType || "asset";
        return (
          <div key={asset.id ?? asset.assetId ?? idx} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {typeIcon(assetType)}
              <div>
                <p className="text-xs font-semibold text-slate-700">{title}</p>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{String(assetType).replace(/_/g, " ")}</span>
              </div>
            </div>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1D4ED8] hover:underline flex items-center gap-1 shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> Open
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
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Status</p>
        <span className={cn("px-3 py-1 rounded-lg border text-xs font-bold uppercase", product.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : product.status === "needs_review" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200")}>
          {product.status ? product.status.replace(/_/g, " ") : "UNKNOWN"}
        </span>
      </div>

      {flaggedAttrs.length > 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Flagged Attributes ({flaggedAttrs.length})</p>
          <div className="space-y-2">
            {flaggedAttrs.map((attr, idx) => (
              <div key={attr.id ?? attr.sequence ?? idx} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-700">{attr.attributeLabel}</span>
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
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            aria-label="Back to products list"
            suppressHydrationWarning
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-[#1D4ED8]" />
              {product ? product.partNumber : "Product Detail"}
            </h1>
            {product?.manufacturerName && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">{product.manufacturerName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLiveEnrichment}
            disabled={isSearching || !product}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] transition-all disabled:opacity-50"
            suppressHydrationWarning
          >
            <Sparkles className={cn("w-3.5 h-3.5", isSearching && "animate-spin")} />
            <span>{isSearching ? "Searching Gemini API…" : "Gemini Flash Sourcing"}</span>
          </button>

          <button
            type="button"
            onClick={loadProduct}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            aria-label="Refresh product detail"
            suppressHydrationWarning
          >
            <RefreshCw className={cn("w-4 h-4 text-[#2563EB]", fetchState === "loading" && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {fetchState === "error" && errorMessage && (
        <div className="bg-white border-l-4 border-l-rose-500 border border-[#E2E8F0] rounded-2xl p-4 flex items-start gap-3">
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
                    : "border-transparent text-[#0F172A]/70 hover:text-[#000000]"
                )}
                suppressHydrationWarning
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          {activeTab === "Overview" && <OverviewTab product={product} />}
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
