import React from "react";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
        <p className="text-sm text-slate-500 mt-1">Browse and filter enriched product records.</p>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No products yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Upload a dataset to begin enrichment.</p>
      </div>
    </div>
  );
}
