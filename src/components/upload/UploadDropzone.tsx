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
  Sparkles,
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
  submitButtonText?: string;
  submitIcon?: React.ElementType;
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
  submitButtonText = "Start AI Extraction & 252-Column Processing",
  submitIcon: SubmitIcon = Sparkles,
}) => {
  const getAcceptConfig = (): Accept => {
    if (mode === "pdf") {
      return { "application/pdf": [".pdf"] };
    }
    return {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
    };
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0]);
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
    if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))
      return <FileSpreadsheet className="w-7 h-7 text-[#3386E7]" />;
    if (file.name.endsWith(".pdf"))
      return <FileText className="w-7 h-7 text-rose-500" />;
    return <File className="w-7 h-7 text-[#64748B]" />;
  };

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "bg-white border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all select-none",
            isDragActive
              ? "border-[#3386E7] bg-[#EFF6FF]"
              : isDragReject
              ? "border-rose-400 bg-rose-50"
              : "border-[#CBD5E1] hover:border-[#3386E7] hover:bg-[#F8FAFC]",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors",
            isDragActive ? "bg-[#DBEAFE]" : "bg-[#F1F5F9]"
          )}>
            <UploadCloud className={cn(
              "w-7 h-7 transition-colors",
              isDragActive ? "text-[#3386E7]" : "text-[#94A3B8]"
            )} />
          </div>
          <p className="text-[15px] font-bold text-[#000000] mb-1">
            {isDragActive ? "Drop your file here" : "Drag & drop your file or PDF here"}
          </p>
          <p className="text-sm text-[#64748B] mb-5">
            Supports manufacturer technical PDFs (.pdf) and supplier spreadsheets (.csv, .xlsx, .xls) up to 50MB
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#000000] shadow-sm hover:border-[#3386E7] hover:text-[#3386E7] transition-colors">
            <File className="w-4 h-4" />
            Browse files &amp; PDFs
          </span>
          <p className="text-xs text-[#94A3B8] mt-4 font-medium">
            PDF · CSV · XLSX · XLS — max 50 MB
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F5F9]">
            <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] flex items-center justify-center shrink-0">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#000000] truncate">{selectedFile.name}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{formatBytes(selectedFile.size)}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for AI Processing
            </div>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="p-1.5 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-3 bg-[#FAFAFA] flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="text-sm font-medium text-[#64748B] hover:text-[#000000] transition-colors"
            >
              Choose different file
            </button>
            <button
              type="button"
              onClick={onUploadSubmit}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
            >
              <SubmitIcon className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
