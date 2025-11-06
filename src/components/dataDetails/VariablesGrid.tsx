import { useState } from "react";
import { DownloadIcon, MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import DatabaseIcon from "../../../public/svgs/database.svg";
import SearchIcon from "../../../public/svgs/search.svg";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface VariablesGridProps {
  dictionaryData: any;
  dictionaryDataLoading: boolean;
  dictionaryDataError: any;
  dictionarySuccess: boolean;
  isSuccess: boolean;
  onDownloadDictionary: () => void;
}

interface VariableInfo {
  type: string;
  description: string;
}

export default function VariablesGrid({
  dictionaryData,
  dictionaryDataLoading,
  dictionaryDataError,
  dictionarySuccess,
  isSuccess,
  onDownloadDictionary,
}: VariablesGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all"); // all, name, type, description

  // Helper to present variable names without underscores and in Title Case
  const formatVariableName = (name: string) =>
    name
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Get unique types for filter
  const uniqueTypes = dictionaryData?.data?.data
    ? Array.from(new Set(Object.values(dictionaryData.data.data as Record<string, VariableInfo>).map(v => v.type)))
    : [];

  // Filter variables based on search term and filter type
  const filteredVariables = dictionaryData?.data?.data 
    ? Object.entries(dictionaryData.data.data as Record<string, VariableInfo>).filter(
        ([key, value]) => {
          const searchLower = searchTerm.toLowerCase();
          
          switch (searchFilter) {
            case "name":
              return key.toLowerCase().includes(searchLower);
            case "type":
              return value.type.toLowerCase().includes(searchLower);
            case "description":
              return value.description.toLowerCase().includes(searchLower);
            default:
              return (
                key.toLowerCase().includes(searchLower) ||
                value.type.toLowerCase().includes(searchLower) ||
                value.description.toLowerCase().includes(searchLower)
              );
          }
        }
      )
    : [];

  const totalVariables = dictionaryData?.data?.data ? Object.keys(dictionaryData.data.data).length : 0;

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchFilter("all");
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] rounded-lg">
            <DatabaseIcon className="w-5 h-5 text-white" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[#24408E]">
              Data Download Variables
            </h2>
            <p className="text-sm text-gray-600">
              {totalVariables} variables available
            </p>
          </div>
        </div>
        
        <button
          onClick={onDownloadDictionary}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
          title="Download dictionary"
        >
          <DownloadIcon className="w-4 h-4" />
          Download Dictionary
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="space-y-4">

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search variables ${searchFilter === "all" ? "by name, type, or description" : `by ${searchFilter}`}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F1] focus:border-transparent bg-white shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Search in:</span>
            {[
              { value: "all", label: "All Fields" },
              { value: "name", label: "Name" },
              { value: "type", label: "Type" },
              { value: "description", label: "Description" }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSearchFilter(filter.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  searchFilter === filter.value
                    ? "bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-[#00B9F1] hover:text-[#00B9F1]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {uniqueTypes.length > 0 && (
            <div className="border-t border-blue-200 pt-4">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Quick type filters:</span>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSearchTerm(type);
                      setSearchFilter("type");
                    }}
                    className="px-2 py-1 bg-white text-[#24408E] border border-blue-300 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(searchTerm || searchFilter !== "all") && (
            <div className="flex justify-end">
              <button
                onClick={handleClearSearch}
                className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs hover:bg-red-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {(searchTerm || searchFilter !== "all") && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              Found <span className="font-semibold">{filteredVariables.length}</span> of <span className="font-semibold">{totalVariables}</span> variables
              {searchTerm && (
                <> matching <span className="font-semibold">{searchTerm}</span></>
              )}
              {searchFilter !== "all" && (
                <> in <span className="font-semibold">{searchFilter}</span></>
              )}
            </p>
            <button
              onClick={handleClearSearch}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Show all
            </button>
          </div>
        </div>
      )}

      {dictionaryDataLoading && (
        <div className="flex justify-center items-center py-12">
          <DotsLoader />
        </div>
      )}
      {dictionaryDataError && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium">
              Failed to fetch data dictionary
            </p>
            <p className="text-red-500 text-sm mt-1">
              Please refresh the page to try again
            </p>
          </div>
        </div>
      )}


      {!dictionaryData?.data?.data && isSuccess && (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-600 font-medium">Variables not available</p>
            <p className="text-yellow-500 text-sm mt-1">
              This dataset does not have variable information available
            </p>
          </div>
        </div>
      )}

      {(searchTerm || searchFilter !== "all") && filteredVariables.length === 0 && dictionarySuccess && totalVariables > 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <SearchIcon className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
            <p className="text-gray-600 font-medium">No variables found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your search term or filters
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-3 px-4 py-2 bg-[#00B9F1] text-white rounded-lg hover:bg-[#0090bd] transition-colors text-sm"
            >
              Clear filters and show all
            </button>
          </div>
        </div>
      )}

      {dictionarySuccess && filteredVariables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVariables.map(([key, value]) => {
            const displayName = formatVariableName(key);
            return (
            <div
              key={key}
              className="border border-gray-200 rounded-lg p-4 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 group"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-[#24408E] text-sm truncate group-hover:text-[#00B9F1] transition-colors" title={displayName}>
                  {searchTerm && searchFilter === "name" ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: displayName.replace(
                          new RegExp(`(${searchTerm})`, "gi"),
                          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                        ),
                      }}
                    />
                  ) : (
                    displayName
                  )}
                </h3>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    searchTerm && searchFilter === "type" && value?.type.toLowerCase().includes(searchTerm.toLowerCase())
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {value?.type}
                  </span>
                </div>
                
                <p className="text-gray-600 leading-relaxed line-clamp-3" title={String(value?.description)}>
                  {searchTerm && searchFilter === "description" ? (
                    <span dangerouslySetInnerHTML={{
                      __html: String(value?.description).replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                      )
                    }} />
                  ) : (
                    String(value?.description)
                  )}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {dictionarySuccess && !searchTerm && searchFilter === "all" && totalVariables > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Showing all <span className="font-semibold text-[#24408E]">{totalVariables}</span> variables
          </p>
        </div>
      )}
    </div>
  );
}
