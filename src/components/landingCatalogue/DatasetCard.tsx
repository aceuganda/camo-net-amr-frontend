"use client";

import { ExternalLinkIcon, ChevronRightIcon, EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

type DatasetCardProps = {
  dataset: {
    id: string;
    name: string;
    title: string;
    thematic_area: string;
    study_design: string;
    category: string;
    countries: string;
    entries_count: string;
    description: string;
    project_status: string;
    protocol_id?: string | null;
    country_protocol_id?: string | null;
    doi?: string | null;
    license?: string | null;
    page_views?: number;
    total_downloads?: number;
  };
  isLoggedIn: boolean;
};

export default function DatasetCard({ dataset, isLoggedIn }: DatasetCardProps) {
  const doiHref =
    dataset.doi &&
    (dataset.doi.startsWith("http") ? dataset.doi : `https://doi.org/${dataset.doi}`);

  return (
    <div className="group bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-xs font-medium text-[#24408E]">
              {dataset.thematic_area}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            dataset.project_status === 'Active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {dataset.project_status}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#24408E] group-hover:text-[#00B9F1] transition-colors duration-200 mb-2 line-clamp-2 min-h-[3rem]">
          {dataset.name}
        </h3>

        <p className="text-xs text-gray-500 mb-2 italic line-clamp-1">
          {dataset.title}
        </p>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2 min-h-[2.5rem]">
          {dataset.description}
        </p>

        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200 mb-3">
          <span className="font-medium">Restricted Access:</span> This dataset is available under restricted access conditions.
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Study Design:</span>
            <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">
              {dataset.study_design}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Category:</span>
            <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-medium">
              {dataset.category}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Countries:</span>
            <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">
              {dataset.countries}
            </span>
          </div>
        </div>

        {(dataset.page_views !== undefined || dataset.total_downloads !== undefined) && (
          <div className="flex items-center gap-3 mb-3">
            {dataset.page_views !== undefined && (
              <div className="flex items-center gap-1.5 group relative">
                <EyeOpenIcon className="w-3.5 h-3.5 text-[#24408E]" />
                <span className="text-sm font-semibold text-[#24408E]">
                  {formatNumber(dataset.page_views)}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {dataset.page_views.toLocaleString()} views
                </div>
              </div>
            )}
            {dataset.total_downloads !== undefined && (
              <div className="flex items-center gap-1.5 group relative">
                <DownloadIcon className="w-3.5 h-3.5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {formatNumber(dataset.total_downloads)}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {dataset.total_downloads.toLocaleString()} downloads
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Link
            href={`/datasets/card/${dataset.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-[#24408E] text-xs font-medium rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            <ExternalLinkIcon className="w-3 h-3" />
            <span>View Card</span>
          </Link>
          
          {isLoggedIn && (
            <Link
              href={`/datasets/access/${dataset.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <span>Access Data</span>
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            Data handling complies with the Uganda Data Protection and Privacy Act, 2019
          </p>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-[#00B9F1] via-[#24408E] to-[#00B9F1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
