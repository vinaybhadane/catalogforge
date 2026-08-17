"use client";

import React from "react";
import {
  FileCheck2,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Columns,
  Hash,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { PreflightScanResult, UploadState } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

interface PreflightSummaryProps {
  result: PreflightScanResult | null;
  state: UploadState;
  onProceed: () => void;
  onReset: () => void;
}

export const PreflightSummary: React.FC<PreflightSummaryProps> = ({
  result,
  state,
  onProceed,
  onReset,
}) => {
  if (!result) return null;

  const isRejected = state === "rejected" || !result.passedPreflight;
  const hasWarnings = state === "completed_with_warnings" || result.warnings.length > 0;

  return (
    <div className="neu-card rounded-2xl overflow-hidden space-y-0">
      {/* Header Banner */}
      <div
        className={cn(
          "px-6 py-4 border-b flex items-center justify-between",
          isRejected
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : hasWarnings
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-900"
        )}
      >
        <div className="flex items-center gap-3">
          {isRejected ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : hasWarnings ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <h3 className="font-extrabold text-sm">
              {isRejected
                ? "Pre-flight Validation Failed"
                : hasWarnings
                ? "Pre-flight Scan Completed with Warnings"
                : "Pre-flight Scan Completed Successfully"}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {isRejected
                ? "File cannot be processed until schema errors are resolved."
                : "File schema verified. Dataset is ready for pipeline enrichment."}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider neu-pill",
            isRejected
              ? "text-rose-700 border-rose-300"
              : hasWarnings
              ? "text-amber-800 border-amber-300"
              : "text-emerald-800 border-emerald-300"
          )}
        >
          {isRejected ? "REJECTED" : hasWarnings ? "PASSED WITH WARNINGS" : "PASSED"}
        </span>
      </div>

      {/* Metrics Summary Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[rgba(203,203,203,0.4)]">
        <div className="p-4 rounded-xl neu-inset">
          <div className="flex items-center gap-2 text-[#6D8196] text-xs font-bold mb-1">
            <Layers className="w-4 h-4" />
            <span>Detected Schema</span>
          </div>
          <span className="font-extrabold text-[#4A4A4A] text-sm">
            {result.schema || "Unknown Schema"}
          </span>
        </div>

        <div className="p-4 rounded-xl neu-inset">
          <div className="flex items-center gap-2 text-[#6D8196] text-xs font-bold mb-1">
            <Hash className="w-4 h-4" />
            <span>Input Row Count</span>
          </div>
          <span className="font-extrabold text-[#4A4A4A] text-sm font-mono">
            {result.rowCount !== null ? result.rowCount.toLocaleString() : "N/A"}
          </span>
        </div>

        <div className="p-4 rounded-xl neu-inset">
          <div className="flex items-center gap-2 text-[#6D8196] text-xs font-bold mb-1">
            <Columns className="w-4 h-4" />
            <span>Column Count</span>
          </div>
          <span className="font-extrabold text-[#4A4A4A] text-sm font-mono">
            {result.columnCount !== null ? `${result.columnCount} columns` : "N/A"}
          </span>
        </div>
      </div>

      {/* Placeholder Scan Section */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-[#4A4A4A] uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#6D8196]" />
            Placeholder & Governance Scan Findings
          </h4>
          <p className="text-xs text-[#4A4A4A]/70 mt-1">
            Detecting placeholder tokens (e.g. <code className="bg-[#FFFFE3] px-1 py-0.5 rounded text-[#4A4A4A]">-- Unbranded --</code>, <code className="bg-[#FFFFE3] px-1 py-0.5 rounded text-[#4A4A4A]">-- No Unilog Brand --</code>) to prevent invalid brand propagation.
          </p>
        </div>

        {result.placeholderScan.placeholdersDetected.length > 0 ? (
          <div className="p-4 rounded-xl neu-inset space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Brand Placeholders Detected
              </span>
              <span className="font-mono font-bold">
                {result.placeholderScan.rowsAffected !== null ? `${result.placeholderScan.rowsAffected} rows affected` : "Detected"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {result.placeholderScan.details.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-mono flex items-center gap-2"
                >
                  <span className="font-bold">{item.placeholder}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#4A4A4A]/80 leading-normal pt-1">
              Note: Detected placeholder strings will be handled explicitly as missing governance data during enrichment and will not be published as actual brand values.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl neu-inset text-xs text-[#4A4A4A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">No brand placeholders detected. All brand fields contain standard data formats.</span>
          </div>
        )}

        {/* Warnings List */}
        {result.warnings.length > 0 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Warnings ({result.warnings.length})
            </h5>
            <ul className="space-y-1">
              {result.warnings.map((warn, i) => (
                <li key={i} className="text-xs text-amber-900 flex items-start gap-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors List */}
        {result.errors.length > 0 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Errors ({result.errors.length})
            </h5>
            <ul className="space-y-1">
              {result.errors.map((err, i) => (
                <li key={i} className="text-xs text-rose-900 flex items-start gap-2 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-6 border-t border-[rgba(203,203,203,0.4)] flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-[#4A4A4A] flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-[#6D8196]" />
          <span>Upload Another File</span>
        </button>

        {!isRejected && (
          <button
            type="button"
            onClick={onProceed}
            className="neu-btn-accent px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <span>Proceed to Batch Processing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
