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
      return <FileSpreadsheet className="w-7 h-7 text-[#171717]" />;
    if (file.name.endsWith(".pdf"))
      return <FileText className="w-7 h-7 text-rose-500" />;
    return <File className="w-7 h-7 text-[#686868]" />;
  };

  return (
    <div className="space-y-3 font-sans">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "bg-white border-2 border-dashed rounded-2xl p-6 sm:p-10 md:p-12 text-center cursor-pointer transition-all select-none shadow-sm",
            isDragActive
              ? "border-[#111111] bg-[#F7F7F7]"
              : isDragReject
              ? "border-rose-400 bg-rose-50"
              : "border-[#EAEAEA] hover:border-[#111111] hover:bg-[#FAFAFA]",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors",
            isDragActive ? "bg-[#111111] text-[#C8FF00]" : "bg-[#F7F7F7] text-[#171717]"
          )}>
            <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-[#171717] mb-1">
            {isDragActive ? "Drop your file here" : "Drag & drop your file or PDF here"}
          </p>
          <p className="text-xs sm:text-sm text-[#686868] mb-4 sm:mb-5 max-w-md mx-auto leading-relaxed">
            Supports manufacturer technical PDFs (.pdf) and supplier spreadsheets (.csv, .xlsx, .xls) up to 50MB
          </p>
          <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#EAEAEA] bg-white text-xs sm:text-sm font-bold text-[#171717] shadow-sm hover:border-[#111111] hover:bg-[#F7F7F7] transition-all w-full sm:w-auto active:scale-95">
            <File className="w-4 h-4" />
            Browse files &amp; PDFs
          </span>
          <p className="text-[11px] sm:text-xs text-[#8E8E8E] mt-3 sm:mt-4 font-mono font-medium">
            PDF · CSV · XLSX · XLS — max 50 MB
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-5 border-b border-[#EAEAEA]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center shrink-0">
                {getFileIcon(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#171717] truncate">{selectedFile.name}</p>
                <p className="text-[11px] sm:text-xs text-[#686868] font-mono mt-0.5">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready for AI Processing</span>
              </div>
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                disabled={isUploading}
                className="p-1.5 text-[#8E8E8E] hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:px-6 sm:py-3.5 bg-[#FAFAFA] gap-3">
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="text-xs sm:text-sm font-bold text-[#686868] hover:text-[#171717] transition-colors py-1 text-center sm:text-left"
            >
              Choose different file
            </button>
            <button
              type="button"
              onClick={onUploadSubmit}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#C8FF00] hover:bg-[#B7EF00] text-[#111111] text-xs sm:text-sm font-bold disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto active:scale-95"
            >
              <SubmitIcon className="w-4 h-4 stroke-[2.2]" />
              <span>{submitButtonText}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
