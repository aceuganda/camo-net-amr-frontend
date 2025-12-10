"use client"

import { useParams } from "next/navigation";
import { ArrowLeftIcon, CopyIcon, EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useDatasetCard } from "@/lib/hooks/useDatasetCard";
import { toast } from "sonner";
import Link from "next/link";

export default function DatasetCardPage() {
  const params = useParams();
  const datasetId = params.id as string;

  const { data: dataset, isLoading, error } = useDatasetCard(datasetId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareableLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/datasets/card/${datasetId}`
    : '';

  if (isLoading) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading dataset card...</div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Failed to load dataset card</div>
      </div>
    );
  }

  const doiHref =
    dataset.doi &&
    (dataset.doi.startsWith("http") ? dataset.doi : `https://doi.org/${dataset.doi}`);
  const hasAcronym = dataset.acronym && dataset.acronym !== "N/A";

  return (
    <div className="min-h-[90vh] bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <Link 
            href="/datasets"
            className="inline-flex items-center gap-2 text-[#24408E] hover:text-[#00B9F1] transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-50 text-[#24408E] rounded-full text-sm font-medium mb-3">
                  {dataset.thematic_area}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {dataset.name}
                </h1>
                <p className="text-lg text-gray-600 mb-2">{dataset.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                  {hasAcronym && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full">
                      <span className="uppercase tracking-wide text-[11px] text-gray-500">
                        Acronym
                      </span>
                      <span className="font-semibold text-[#24408E]">
                        {dataset.acronym}
                      </span>
                    </span>
                  )}
                  {doiHref && (
                    <div className="inline-flex items-center gap-1">
                      <a
                        href={doiHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-[#00B9F1] hover:text-[#00B9F1] transition-colors"
                      >
                        <span className="uppercase tracking-wide text-[11px] text-gray-500">
                          DOI
                        </span>
                        <span className="font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                          {dataset.doi}
                        </span>
                      </a>
                      <button
                        onClick={() => copyToClipboard(dataset.doi!)}
                        className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-[#00B9F1] hover:border-[#00B9F1] transition-colors"
                        title="Copy DOI"
                        aria-label="Copy DOI"
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {dataset.license && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full">
                      <span className="uppercase tracking-wide text-[11px] text-gray-500">
                        License
                      </span>
                      <span className="font-semibold text-gray-700 truncate max-w-[140px] sm:max-w-[220px]">
                        {dataset.license}
                      </span>
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs sm:text-sm text-amber-700">
                    <span className="font-medium">Restricted Access:</span> This dataset is available under restricted access conditions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2 group relative">
                  <EyeOpenIcon className="w-4 h-4 text-[#24408E]" />
                  <span className="text-lg font-bold text-[#24408E]">
                    {dataset.page_views.toLocaleString()}
                  </span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {dataset.page_views.toLocaleString()} views
                  </div>
                </div>
                <div className="flex items-center gap-2 group relative">
                  <DownloadIcon className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    {dataset.total_downloads.toLocaleString()}
                  </span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {dataset.total_downloads.toLocaleString()} downloads
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {dataset.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Study Design</h3>
                <p className="text-gray-700">{dataset.study_design}</p>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Collection Method</h3>
                <p className="text-gray-700">{dataset.data_collection_methods}</p>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Countries</h3>
                <p className="text-gray-700">{dataset.countries}</p>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Thematic Area</h3>
                <p className="text-gray-700">{dataset.thematic_area}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Version</h3>
                <p className="text-gray-700">{dataset.version || "1"}</p>
              </div>

              {dataset.data_format && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Format</h3>
                  <p className="text-gray-700">{dataset.data_format}</p>
                </div>
              )}

              {dataset.protocol_id && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Protocol ID</h3>
                  <p className="text-gray-700 break-words">{dataset.protocol_id}</p>
                </div>
              )}

              {dataset.country_protocol_id && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Country Protocol ID</h3>
                  <p className="text-gray-700 break-words">{dataset.country_protocol_id}</p>
                </div>
              )}
            </div>

            {dataset.contacts.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataset.contacts.map((contact, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <p className="font-semibold text-gray-900 mb-1">{contact.role}</p>
                      <p className="text-gray-700 mb-2">{contact.name || 'N/A'}</p>
                      {contact.email && (
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-sm text-[#00B9F1] hover:text-[#24408E] transition-colors"
                        >
                          {contact.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {dataset.license && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">License</h3>
                  <p className="text-gray-700">{dataset.license}</p>
                </div>
              )}
              
              {dataset.doi && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">DOI</h3>
                  <a 
                    href={doiHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00B9F1] hover:text-[#24408E] transition-colors break-all"
                  >
                    {dataset.doi}
                  </a>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Citation</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 italic">
                  {dataset.citation_info}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                <p>Data handling complies with the Uganda Data Protection and Privacy Act, 2019</p>
                <p className="mt-1">Created: {new Date(dataset.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  href={`/datasets/access/${dataset.id}`}
                  className="px-6 py-2.5 bg-[#24408E] text-white rounded-lg hover:bg-[#1a3070] transition-colors font-medium"
                >
                  Access Dataset
                </Link>
                <button
                  onClick={() => copyToClipboard(shareableLink)}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dataset Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
