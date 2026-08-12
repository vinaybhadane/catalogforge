"use client";

import React, { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  X,
  File,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UploadMode } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  mode: UploadMode;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onUploadSubmit: () => void;
  isUploading: boolean;
  disabled?: boolean;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  mode,
  selectedFile,
  onFileSelect,
  onUploadSubmit,
  isUploading,
  disabled = false,
}) => {
  const getAcceptConfig = (): Accept => {
    if (mode === "pdf") {
      return {
        "application/pdf": [".pdf"],
      };
    }
    return {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    };
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: getAcceptConfig(),
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const getFileIcon = (file: File) => {
    if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      return <FileSpreadsheet className="w-8 h-8 text-[#1D4ED8]" />;
    }
    if (file.name.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-[#B91C1C]" />;
    }
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        /* Section 16 Dropzone Box */
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white select-none",
            isDragActive
              ? "border-[#1D4ED8] bg-[#EFF6FF]"
              : isDragReject
              ? "border-[#B91C1C] bg-[#FEF2F2]"
              : "border-[#CBD5E1] hover:border-[#1D4ED8] hover:bg-slate-50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-base font-semibold text-slate-900 mb-1">
            {isDragActive ? "Drop file here" : "Drop file here or Browse files"}
          </p>

          <p className="text-xs text-slate-500 font-medium">
            {mode === "pdf"
              ? "Accepted format: Manufacturer PDF Specification (.pdf)"
              : "Accepted formats: CSV (.csv) or Excel (.xlsx, .xls)"}
          </p>

          {isDragReject && (
            <p className="text-xs text-red-600 font-semibold mt-3 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Unsupported file type selected.
            </p>
          )}
        </div>
      ) : (
        /* Section 16 Selected File Card */
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-slate-100 rounded-lg">{getFileIcon(selectedFile)}</div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm tracking-tight truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-mono">{selectedFile.name.split(".").pop()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove file"
              aria-label="Remove selected file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ready for pre-flight scan
            </span>

            <button
              type="button"
              onClick={onUploadSubmit}
              disabled={isUploading}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-medium text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isUploading ? "Uploading & Scanning..." : "Submit for Pre-flight Scan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
