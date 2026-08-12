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
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden space-y-0">
      {/* Header Banner */}
      <div
        className={cn(
          "px-6 py-4 border-b flex items-center justify-between",
          isRejected
            ? "bg-red-50 border-red-200 text-red-900"
            : hasWarnings
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-900"
        )}
      >
        <div className="flex items-center gap-3">
          {isRejected ? (
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : hasWarnings ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-sm">
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
            "text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
            isRejected
              ? "bg-red-100 text-red-700"
              : hasWarnings
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          )}
        >
          {isRejected ? "REJECTED" : hasWarnings ? "PASSED WITH WARNINGS" : "PASSED"}
        </span>
      </div>

      {/* Metrics Summary Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#E2E8F0]">
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Layers className="w-4 h-4 text-[#1D4ED8]" />
            <span>Detected Schema</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">
            {result.schema || "Unknown Schema"}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Hash className="w-4 h-4 text-[#1D4ED8]" />
            <span>Input Row Count</span>
          </div>
          <span className="font-bold text-slate-900 text-sm font-mono">
            {result.rowCount !== null ? result.rowCount.toLocaleString() : "N/A"}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Columns className="w-4 h-4 text-[#1D4ED8]" />
            <span>Column Count</span>
          </div>
          <span className="font-bold text-slate-900 text-sm font-mono">
            {result.columnCount !== null ? `${result.columnCount} columns` : "N/A"}
          </span>
        </div>
      </div>

      {/* Section 17 Placeholder Scan Section */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#1D4ED8]" />
            Placeholder & Governance Scan Findings
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Detecting placeholder tokens (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">-- Unbranded --</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">-- No Unilog Brand --</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">-- No DIB Brand --</code>) to prevent invalid brand propagation.
          </p>
        </div>

        {result.placeholderScan.placeholdersDetected.length > 0 ? (
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-amber-900">
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
                  className="px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-900 text-xs font-mono flex items-center gap-2"
                >
                  <span className="font-semibold">{item.placeholder}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-amber-800 leading-normal pt-1">
              Note: Detected placeholder strings will be handled explicitly as missing governance data during enrichment and will not be published as actual brand values.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No brand placeholders detected. All brand fields contain standard data formats.</span>
          </div>
        )}

        {/* Warnings List */}
        {result.warnings.length > 0 && (
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Warnings ({result.warnings.length})
            </h5>
            <ul className="space-y-1">
              {result.warnings.map((warn, i) => (
                <li key={i} className="text-xs text-amber-800 flex items-start gap-2 bg-amber-50 p-2 rounded border border-amber-200">
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
            <h5 className="text-xs font-semibold text-red-800 uppercase tracking-wider">
              Errors ({result.errors.length})
            </h5>
            <ul className="space-y-1">
              {result.errors.map((err, i) => (
                <li key={i} className="text-xs text-red-800 flex items-start gap-2 bg-red-50 p-2 rounded border border-red-200">
                  <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-[#CBD5E1] text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Upload Another File</span>
        </button>

        {!isRejected && (
          <button
            type="button"
            onClick={onProceed}
            className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <span>Proceed to Batch Processing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
