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
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { PreflightScanResult, UploadState } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

interface PreflightSummaryProps {
  result: PreflightScanResult | null;
  state: UploadState;
  jobId?: string | null;
  onProceed: () => void;
  onReset: () => void;
}

export const PreflightSummary: React.FC<PreflightSummaryProps> = ({
  result,
  state,
  jobId,
  onProceed,
  onReset,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  if (!result) return null;

  const isRejected = state === "rejected" || !result.passedPreflight;
  const hasWarnings = state === "completed_with_warnings" || result.warnings.length > 0;

  const handleExportDelivery = async () => {
    try {
      setIsExporting(true);
      const params: Record<string, string> = { format: "xlsx" };
      if (jobId) params.jobId = jobId;
      const blob = await apiClient.downloadBlob("/products/export", { params });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CatalogForge_Delivery_Export_${jobId || "latest"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export delivery file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">

      {/* ── Status Banner ── */}
      <div className={cn(
        "p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b gap-3",
        isRejected
          ? "bg-rose-50 border-rose-200"
          : hasWarnings
          ? "bg-amber-50 border-amber-200"
          : "bg-emerald-50 border-emerald-200"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0",
            isRejected ? "bg-rose-100" : hasWarnings ? "bg-amber-100" : "bg-emerald-100"
          )}>
            {isRejected
              ? <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              : hasWarnings
              ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
          </div>
          <div>
            <h3 className={cn(
              "text-xs sm:text-sm font-bold",
              isRejected ? "text-rose-900" : hasWarnings ? "text-amber-900" : "text-emerald-900"
            )}>
              {isRejected
                ? "Pre-flight Validation Failed"
                : hasWarnings
                ? "Completed with Warnings"
                : "Pre-flight Scan Passed"}
            </h3>
            <p className={cn(
              "text-[11px] sm:text-xs mt-0.5",
              isRejected ? "text-rose-700" : hasWarnings ? "text-amber-700" : "text-emerald-700"
            )}>
              {isRejected
                ? "Schema errors must be resolved before processing."
                : "Dataset schema verified and ready for pipeline enrichment."}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider border self-start sm:self-auto",
          isRejected
            ? "text-rose-700 border-rose-300 bg-white"
            : hasWarnings
            ? "text-amber-800 border-amber-300 bg-white"
            : "text-emerald-800 border-emerald-300 bg-white"
        )}>
          {isRejected ? "REJECTED" : hasWarnings ? "WARNINGS" : "PASSED"}
        </span>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9] border-b border-[#E2E8F0]">
        {[
          { icon: Layers, label: "Detected Schema", value: result.schema || "Unknown" },
          { icon: Hash, label: "Row Count", value: result.rowCount !== null ? result.rowCount.toLocaleString() : "N/A" },
          { icon: Columns, label: "Column Count", value: result.columnCount !== null ? `${result.columnCount}` : "N/A" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] mb-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <p className="text-sm font-bold text-[#000000] font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Placeholder Scan ── */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[#000000] flex items-center gap-2 mb-0.5">
            <FileCheck2 className="w-4 h-4 text-[#64748B]" />
            Placeholder &amp; Governance Scan
          </h4>
          <p className="text-xs text-[#64748B]">
            Detecting placeholder tokens (e.g.{" "}
            <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#000000] text-[11px]">-- Unbranded --</code>
            {", "}
            <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#000000] text-[11px]">-- No Unilog Brand --</code>
            ) to prevent invalid brand propagation.
          </p>
        </div>

        {result.placeholderScan.placeholdersDetected.length > 0 ? (
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Brand Placeholders Detected
              </span>
              <span className="font-mono text-amber-800">
                {result.placeholderScan.rowsAffected !== null
                  ? `${result.placeholderScan.rowsAffected} rows affected`
                  : "Detected"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.placeholderScan.details.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-mono flex items-center gap-2"
                >
                  <span className="font-bold">{item.placeholder}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Detected placeholders will be handled as missing governance data during enrichment and will not be published as actual brand values.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            No brand placeholders detected. All brand fields contain standard data.
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Warnings ({result.warnings.length})
            </h5>
            <ul className="space-y-1.5">
              {result.warnings.map((warn, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  {warn}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Errors ({result.errors.length})
            </h5>
            <ul className="space-y-1.5">
              {result.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Action Footer ── */}
      <div className="p-4 sm:px-6 sm:py-4 border-t border-[#E2E8F0] bg-[#FAFAFA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#000000] transition-colors py-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          Upload Another File
        </button>

        {!isRejected && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleExportDelivery}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
              title="Download 252-column Expected Output Delivery Format (.xlsx)"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>Export Delivery Format (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={onProceed}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#3386E7] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto"
            >
              <span>View Processed Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
