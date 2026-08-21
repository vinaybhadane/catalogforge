"use client";

import React from "react";
import { ExternalLink, Image as ImageIcon, FileText, AlertTriangle, Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section 23 / 95: FieldDefinition interface.
 * The API can later provide field metadata, or the frontend can maintain
 * a versioned presentation schema.
 */
export interface FieldDefinition {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "url"
    | "image"
    | "document"
    | "attribute"
    | "dimension"
    | "status"
    | "confidence";
  group: string;
  editable: boolean;
  charLimit?: number;
  required?: boolean;
}

interface DynamicFieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  confidence?: number | null;
  validationFlags?: string[];
  sourceUrl?: string | null;
  sourceTitle?: string | null;
}

/**
 * DynamicFieldRenderer — Section 95.
 * Schema-oriented renderer supporting all field types for 252-column compatibility.
 * Renders API-provided values only — never fabricates data.
 * Displays intentional dimmed blanks for unverified fields.
 */
export function DynamicFieldRenderer({
  field,
  value,
  confidence,
  validationFlags = [],
  sourceUrl,
  sourceTitle,
}: DynamicFieldRendererProps) {
  const isNull = value === null || value === undefined || value === "" || String(value).trim() === "";

  const renderValue = () => {
    if (isNull) {
      return (
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-slate-400 font-mono text-xs select-none">
            — Blank (Unverified in OEM docs)
          </span>
        </div>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-900 break-words font-normal leading-relaxed">
              {String(value)}
            </span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline w-fit font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                {sourceTitle || "Verified OEM Citation"}
              </a>
            )}
          </div>
        );


      case "number":
        return (
          <span className="text-sm font-mono text-slate-900">
            {typeof value === "number" ? value.toLocaleString() : String(value)}
          </span>
        );

      case "boolean":
        return value ? (
          <span className="flex items-center gap-1 text-sm text-[#047857]">
            <Check className="w-4 h-4" /> Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <X className="w-4 h-4" /> No
          </span>
        );

      case "url":
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1D4ED8] hover:underline flex items-center gap-1 break-all"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            {String(value).length > 60 ? `${String(value).slice(0, 60)}…` : String(value)}
          </a>
        );

      case "image":
        return (
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700 truncate">{String(value)}</span>
          </div>
        );

      case "document":
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700 truncate">{String(value)}</span>
          </div>
        );

      case "status": {
        const statusColors: Record<string, string> = {
          published: "bg-emerald-50 text-emerald-700",
          validated: "bg-amber-50 text-amber-700",
          enriched: "bg-purple-50 text-purple-700",
          needs_review: "bg-orange-50 text-orange-700",
          failed: "bg-red-50 text-red-700",
        };
        const statusStr = String(value);
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide",
              statusColors[statusStr] ?? "bg-slate-100 text-slate-600"
            )}
          >
            {statusStr.replace(/_/g, " ")}
          </span>
        );
      }

      case "confidence": {
        if (typeof value !== "number") {
          return <span className="text-slate-400 italic text-sm">Not available</span>;
        }
        const pct = Math.round(value * 100);
        const cls = pct >= 85 ? "text-[#047857]" : pct >= 60 ? "text-[#B45309]" : "text-[#B91C1C]";
        return <span className={cn("text-sm font-mono font-bold", cls)}>{pct}%</span>;
      }

      case "attribute":
      case "dimension":
        if (typeof value === "object" && value !== null) {
          return (
            <pre className="text-xs text-slate-700 bg-slate-50 rounded p-2 overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          );
        }
        return <span className="text-sm text-slate-900">{String(value)}</span>;

      default:
        return <span className="text-sm text-slate-900">{String(value)}</span>;
    }
  };

  return (
    <div className="py-3 border-b border-[#F1F5F9] last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {field.label}
            </span>
            {field.required && (
              <span className="text-[10px] text-red-500 font-bold">REQUIRED</span>
            )}
            {field.editable && (
              <span className="text-[10px] text-[#1D4ED8] font-bold">EDITABLE</span>
            )}
          </div>
          {renderValue()}

          {/* Char limit — Section 31 */}
          {field.type === "text" && !isNull && (
            <div className="mt-1">
              {field.charLimit ? (
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    String(value).length > field.charLimit ? "text-[#B91C1C] font-bold" : "text-slate-400"
                  )}
                >
                  {String(value).length} / {field.charLimit} chars
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Character limit not configured</span>
              )}
            </div>
          )}
        </div>

        {/* Confidence */}
        {confidence !== undefined && (
          <div className="shrink-0">
            {confidence === null ? (
              <span className="text-[10px] text-slate-400 italic flex items-center gap-0.5">
                <Info className="w-3 h-3" /> N/A
              </span>
            ) : (
              <span
                className={cn(
                  "text-[11px] font-mono font-bold px-1.5 py-0.5 rounded",
                  Math.round(confidence * 100) >= 85 ? "bg-emerald-50 text-[#047857]" :
                  Math.round(confidence * 100) >= 60 ? "bg-amber-50 text-[#B45309]" :
                  "bg-red-50 text-[#B91C1C]"
                )}
              >
                {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validation Flags — Section 30 */}
      {validationFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {validationFlags.map((flag) => (
            <span
              key={flag}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-800"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              {flag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
