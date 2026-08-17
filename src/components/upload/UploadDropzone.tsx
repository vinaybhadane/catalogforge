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
      return <FileSpreadsheet className="w-8 h-8 text-[#6D8196]" />;
    }
    if (file.name.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-rose-600" />;
    }
    return <File className="w-8 h-8 text-[#6D8196]" />;
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        /* Neumorphic Dropzone Box */
        <div
          {...getRootProps()}
          className={cn(
            "neu-inset rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all select-none border-2 border-dashed",
            isDragActive
              ? "border-[#6D8196] bg-[#FFFFE3]/40"
              : isDragReject
              ? "border-rose-500 bg-rose-50"
              : "border-[#CBCBCB] hover:border-[#6D8196]",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 rounded-2xl neu-icon-well text-[#6D8196] flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-extrabold text-[#4A4A4A]">
            {isDragActive ? "Drop your file to upload" : "Drag and drop your dataset here"}
          </p>
          <p className="text-xs text-[#6D8196] font-bold mt-1">
            {mode === "pdf"
              ? "Supports manufacturer datasheets (.pdf up to 50MB)"
              : "Supports canonical supplier spreadsheets (.csv, .xlsx up to 50MB)"}
          </p>
          <div className="mt-4">
            <span className="neu-btn px-4 py-2 text-xs font-bold text-[#4A4A4A] inline-block">
              Browse Files
            </span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="neu-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl neu-icon-well flex items-center justify-center">
                {getFileIcon(selectedFile)}
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#4A4A4A]">{selectedFile.name}</p>
                <p className="text-xs text-[#6D8196] font-bold">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="neu-btn p-2 text-[#4A4A4A] hover:text-rose-600 rounded-xl"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              disabled={isUploading}
              className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-[#4A4A4A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUploadSubmit}
              disabled={isUploading}
              className="neu-btn-accent px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Start Ingestion & Pre-flight Scan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
