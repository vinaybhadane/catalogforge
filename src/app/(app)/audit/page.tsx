import React from "react";
import { FileText } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable trace of field generation, validation flags, and reviewer actions.</p>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No audit events available</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Field-level audit entries will be recorded during enrichment and review actions.</p>
      </div>
    </div>
  );
}
