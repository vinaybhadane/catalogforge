import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Evaluation</h1>
        <p className="text-sm text-slate-500 mt-1">Live scoreboard of field accuracy, LOV resolution, and SLA metrics.</p>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Analytics unavailable</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Analytics metrics will appear once processing and ground-truth evaluation data are available.</p>
      </div>
    </div>
  );
}
