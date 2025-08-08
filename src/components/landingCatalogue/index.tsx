"use client";

import { useState } from "react";
import {
  DownloadIcon,
  CopyIcon,
  StackIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useSearch } from "@/context/searchContext";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import SidebarMenu from "../filter";
import Link from "next/link";
import { catalogueSteps } from "../GuideTour/steps";
const GuideTour = dynamic(() => import("@/components/GuideTour"), {
  ssr: false,
});

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

type FetchedDataset = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  countries: string[];
  project_status: string;

  title: string;
  thematic_area: string;
  study_design: string;
  data_format: string;
  source: string;
  in_warehouse: boolean;
  start_date: string;
  end_date: string;
  protocol_id: string;
  country_protocol_id: string;
  on_hold_reason: string;
  data_collection_methods: string;
  entries_count: string;

  citation_info: string;

  project_type: string;
  main_project_name: string;
  data_capture_method: string;

  amr_category: string;
  acronym: string;
  description: string;
  collection_period: string;
};

const formatDate = (date: any) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const escapeCSVValue = (value: any) => {
  if (value === null || value === undefined) return "";
  const stringValue = value.toString();

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const convertToCSV = (datasets: FetchedDataset[]) => {
  const headers = [
    "Project Name",
    "Project Type",
    "Main Project Name",
    "Study Design",
    "Data collected",
    "Entries",
    "Data Source",
    "Country",
    "Data Capture Method",
    "Collection Period",
    "Citation Info",
  ];

  const rows = datasets.map((dataset) => [
    dataset.title,
    dataset.project_type,
    dataset.main_project_name,
    dataset.study_design,
    dataset.category,
    dataset.entries_count,
    dataset.source,
    dataset.countries,
    dataset.data_capture_method,
    dataset.collection_period,
    dataset.citation_info,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map((row) => row.map(escapeCSVValue).join(","))
      .join("\n");

  return encodeURI(csvContent);
};

export default function HomeCatalogue() {
  const { searchTerm } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data, isLoading, error } = useGetCatalogue();
  const datasets: FetchedDataset[] = data?.data || [];

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        dataset.amr_category?.toLowerCase().includes(cat.toLowerCase())
      );
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.some((status) =>
        dataset.project_status.toLowerCase().includes(status.toLowerCase())
      );
    return matchesSearchTerm && matchesCategory && matchesStatus;
  });

  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      const allIds = filteredDatasets.map((dataset) => dataset.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowCheck = (e: any, id: string) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedRows((prevSelected) => [...prevSelected, id]);
    } else {
      setSelectedRows((prevSelected) =>
        prevSelected.filter((rowId) => rowId !== id)
      );
    }
  };

  const handleExport = () => {
    // Export only selected datasets if any are selected, otherwise export all filtered datasets
    const datasetsToExport = selectedRows.length > 0 
      ? filteredDatasets.filter(dataset => selectedRows.includes(dataset.id))
      : filteredDatasets;
      
    const csvContent = convertToCSV(datasetsToExport);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "catalogue_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <main className="flex min-h-[90vh] flex-col items-center relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-cyan-50/90 to-blue-100/90"></div>

        <div className="absolute bottom-[4rem] right-4 z-20">
          <div className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-white/30 text-[#24408E] rounded-full text-sm font-semibold shadow-lg">
            Version 1
          </div>
        </div>

        <div className="relative z-10 w-full flex flex-row justify-between overflow-x-hidden">
          <SidebarMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            className="menu_view"
          />

          <div
            className={`ml-[2rem] w-[90%] ${!isMenuOpen ? "" : "sm:w-[80%]"}`}
          >
            <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-4 sm:p-6 my-6 sm:my-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <StackIcon className="w-8 h-8 text-[#24408E]" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
                      Dataset Catalogue
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Explore and export comprehensive AMR datasets
                    </p>
                  </div>
                </div>

                <div
                  className="export_button flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={handleExport}
                >
                  <DownloadIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">
                    EXPORT {selectedRows.length > 0 ? `SELECTED (${selectedRows.length})` : 'ALL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl overflow-hidden">
              {isLoading && (
                <div className="text-center w-full flex items-start h-[4rem] justify-center text-gray-500 p-8">
                  <DotsLoader />
                </div>
              )}

              {error && (
                <div className="text-center w-full flex items-start justify-center text-gray-500 p-8 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-red-600">
                    Failed to fetch the Catalog, Please refresh the page
                  </span>
                </div>
              )}

              {filteredDatasets.length === 0 && searchTerm && (
                <div className="text-center w-full flex items-start justify-center text-gray-500 p-8 bg-yellow-50 rounded-xl border border-yellow-200">
                  No data for search term:{" "}
                  <span className="font-semibold ml-1">{searchTerm}</span>
                </div>
              )}

              {filteredDatasets.length === 0 &&
                (selectedCategories.length > 0 ||
                  selectedStatuses.length > 0) && (
                  <div className="text-center w-full flex items-start justify-center text-gray-500 p-8 bg-blue-50 rounded-xl border border-blue-200">
                    No data matches the selected filters.
                  </div>
                )}

              {filteredDatasets.length > 0 && !error && !isLoading && (
                <div className="w-full overflow-x-auto">
                  <table className="w-full  text-[9px] sm:text-[10px]  border-collapse min-w-[1200px]">
                    <thead className="bg-gradient-to-r from-[#24408E] via-[#00B9F1] to-[#24408E] text-white">
                      <tr>
                        <th className="p-3 sm:p-4 md:p-5">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-[#00B9F1] rounded transition-colors"
                            onChange={handleSelectAll}
                            checked={selectedRows.length === filteredDatasets.length && filteredDatasets.length > 0}
                          />
                        </th>
                        {[
                          { header: "Project Name" },
                          { header: "Project Type" },
                          { header: "Main Project Name" },
                          { header: "Study Design" },
                          { header: "Data collected" },
                          {
                            header: "Entries",
                            tooltip: "Number of data records.",
                          },
                          {
                            header: "Data source",
                            tooltip: "Origin or provider(s) of the data.",
                          },
                          {
                            header: "Country",
                            tooltip:
                              "Country(ies) where this data was collected",
                          },
                          {
                            header: "Data Capture Method",
                            tooltip: "Technique used to collect data.",
                          },
                          {
                            header: "Collection Period",
                          },
                          {
                            header: "Citation Info",
                          },
                          {
                            header: "Actions",
                          },
                        ].map(({ header, tooltip }) => (
                          <th
                            key={header}
                            className="p-3 sm:p-4 md:p-5 text-left relative group font-semibold"
                          >
                            <div className="flex items-center">
                              {header}
                              {tooltip && (
                                <div className="relative ml-2 group">
                                  <InfoCircledIcon className="w-4 h-4 text-white cursor-help" />
                                  <div className="absolute -top-12 left-0 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap hidden group-hover:block z-20 border border-gray-700">
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    {tooltip}
                                  </div>
                                </div>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDatasets.map((dataset, index) => (
                        <tr
                          key={dataset.id}
                          className={`${
                            index % 2 === 0 ? "bg-[#EBF7FD]" : "bg-white"
                          } border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group`}
                        >
                          <td className="p-3 sm:p-4 md:p-5">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-[#00B9F1] rounded transition-colors"
                              onChange={(e) => handleRowCheck(e, dataset.id)}
                              checked={selectedRows.includes(dataset.id)}
                            />
                          </td>

                          {/* Project Name (title) - idx 0 */}
                          <td className="p-3 sm:p-4 md:p-5 w-fit max-w-[200px]">
                            <div
                              className="truncate  hover:whitespace-normal hover:break-words transition-all duration-200"
                              title={dataset.title}
                            >
                              {dataset.title}
                            </div>
                          </td>

                          {/* Project Type - idx 1 */}
                          <td className="p-3 sm:p-4 md:p-5 whitespace-normal break-words">
                            {dataset.project_type}
                          </td>

                          {/* Main Project Name - idx 2 */}
                          <td className="p-3 sm:p-4 md:p-5 w-fit max-w-[200px]">
                            <div
                              className="truncate  hover:whitespace-normal hover:break-words transition-all duration-200"
                              title={dataset.main_project_name}
                            >
                              {dataset.main_project_name}
                            </div>
                          </td>

                          <td className="p-3 sm:p-4 md:p-5">
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-[8px] sm:text-[9px] font-medium whitespace-nowrap">
                              {dataset.study_design}
                            </span>
                          </td>

                          {/* Category - idx 4 */}
                          <td className="p-3 sm:p-4 md:p-5">
                            <span className="px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-full text-[8px] sm:text-[9px] font-medium whitespace-nowrap">
                              {dataset.category}
                            </span>
                          </td>

                          {/* Remaining columns */}
                          {[
                            dataset.entries_count,
                            dataset.source,
                            dataset.countries,
                            dataset.data_capture_method,
                            dataset.collection_period,
                          ].map((value, idx) => (
                            <td
                              key={idx + 5}
                              className="p-3 sm:p-4 md:p-5 whitespace-normal break-words"
                            >
                              {value}
                            </td>
                          ))}

                          <td className="p-3 sm:p-4 md:p-5 relative group">
                            <div className="flex items-center gap-2">
                              {dataset.citation_info ? (
                                <>
                                  <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                    Available
                                  </span>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        dataset.citation_info
                                      )
                                    }
                                    className="p-1 hover:bg-[#00B9F1] hover:text-white rounded transition-colors"
                                    title="Copy citation"
                                  >
                                    <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500 italic text-xs">
                                  No citations
                                </span>
                              )}
                            </div>
                            {dataset.citation_info && (
                              <div className="absolute top-full left-[-70%] mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl hidden group-hover:block z-10 max-w-sm border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-[#00B9F1]">
                                    Citation
                                  </p>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        dataset.citation_info
                                      )
                                    }
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="Copy citation"
                                  >
                                    <CopyIcon className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                                <p className="text-gray-200 leading-relaxed break-words">
                                  {dataset.citation_info}
                                </p>
                              </div>
                            )}
                          </td>

                          <td className="p-3 sm:p-4 md:p-5">
                            <Link
                              className="cursor-pointer"
                              href={`/datasets/access/${dataset.id}`}
                            >
                              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                                Request Access
                              </div>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {filteredDatasets.length > 0 && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-[#24408E]">
                      {filteredDatasets.length}
                    </span>{" "}
                    datasets
                    {selectedRows.length > 0 && (
                      <span className="ml-2">
                        •{" "}
                        <span className="font-semibold text-[#00B9F1]">
                          {selectedRows.length}
                        </span>{" "}
                        selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <GuideTour steps={catalogueSteps} guideKey="catalogue_page" />
    </>
  );
}