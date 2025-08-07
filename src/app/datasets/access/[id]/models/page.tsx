"use client";

import ModelsComponent from "@/components/models";
import { useGetDataSet } from "@/lib/hooks/useCatalogue";
import { Loader2 } from "lucide-react";

export default function ModelsPage({ params }: { params: { id: string } }) {
  const { data, isLoading, isSuccess, error, refetch } = useGetDataSet(params.id);
  const dataset = data?.data || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#24408E] animate-spin mx-auto mb-4" />
          <p className="text-[#24408E] font-medium">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dataset</h3>
            <p className="text-red-600 text-sm mb-4">Failed to fetch dataset information.</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuccess || !dataset.data_set) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Dataset Not Found</h3>
            <p className="text-orange-600 text-sm">The requested dataset could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModelsComponent datasetId={params.id} dataset={dataset} />
  );
}