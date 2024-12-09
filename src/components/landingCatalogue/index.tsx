"use client";

import { useState } from "react";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useSearch } from "@/context/searchContext";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import SidebarMenu from "../filter";
import { InfoCircledIcon, HeartFilledIcon, HandIcon } from "@radix-ui/react-icons";
import Link from "next/link";

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
    "Name",
    "Title",
    "Acronym",
    "Description",
    "Antimicrobial Category",
    "Category",
    "Type",

    "Project Status",
    "On-hold Reason",
    "Countries",
    "Source",
    "Data Format",
    "Entries",
    "Citation Info",
    "Study Design",
    "Project Type",
    "Main Project Name",
    "Data Capture Method",
    "In Warehouse",
    "Protocol ID",
    "Country Protocol ID",
    "Start Date",
    "End Date",
  ];

  const rows = datasets.map((dataset) => [
    dataset.name,
    dataset.title,
    dataset.acronym,
    dataset.description,
    dataset.amr_category,
    dataset.category,
    dataset.type,

    dataset.project_status,
    dataset.on_hold_reason,
    dataset.countries,

    dataset.source,
    dataset.data_format,
    dataset.entries_count,

    dataset.citation_info,
    dataset.study_design,

    dataset.project_type,
    dataset.main_project_name,
    dataset.data_capture_method,
    dataset.in_warehouse ? "Yes" : "No",

    dataset.protocol_id,
    dataset.country_protocol_id,
    formatDate(dataset.start_date),
    formatDate(dataset.end_date),
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
  const [isMenuOpen, setIsMenuOpen] = useState(true);
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
    const csvContent = convertToCSV(filteredDatasets);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "catalogue_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex min-h-screen flex-col items-center ">
      <div className=" w-full flex flex-row  justify-between overflow-x-hidden">
        <SidebarMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        />

        <div
          className={`ml-[2rem] w-[90%] ${!isMenuOpen ? "" : "sm:w-[80%]"} `}
        >
          <div className="text-[#24408E] font-[700] w-full  flex-row gap-4 flex items-center justify-end px-[1rem] my-[30px]">
            <div className="flex flex-row gap-2 items-center">
              <DownloadIcon onClick={handleExport} className="cursor-pointer" />
              <span className="cursor-pointer" onClick={handleExport}>
                EXPORT CATALOGUE
              </span>
            </div>
            <div className="flex flex-row items-center">
     
            <Link
           href={'/datasets/external'}
          className="bg-blue-500 flex flex-row items-center gap-1 text-white px-4 py-2 rounded"
        >
          <HandIcon/> Contribute a dataset
        </Link>
            </div>
          </div>


          <div>
            {isLoading && (
              <div className="text-center w-full flex items-start h-[4rem] justify-center text-gray-500">
                <DotsLoader />
              </div>
            )}

            {error && (
              <div className="text-center w-full flex items-start justify-center text-gray-500">
                Failed to fetch the Catalog, Please refresh the page
              </div>
            )}

            {filteredDatasets.length === 0 && searchTerm && (
              <div className="text-center w-full flex items-start justify-center text-gray-500">
                No data for search term: {searchTerm}{" "}
              </div>
            )}

            {filteredDatasets.length === 0 &&
              (selectedCategories.length > 0 ||
                selectedStatuses.length > 0) && (
                <div className="text-center w-full flex items-start justify-center text-gray-500">
                  No data matches the selected filters.
                </div>
              )}

            {filteredDatasets.length > 0 && !error && !isLoading && (
              <div className="w-[98%] overflow-x-auto">
                <table className=" text-[12px] sm:text-sm border-collapse rounded-t-lg overflow-hidden ">
                  {/* Table Header */}
                  <thead className="bg-[#00B9F1] text-white">
                    <tr>
                      <th className="p-5">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          onChange={handleSelectAll}
                          checked={selectedRows.length === datasets.length}
                        />
                      </th>
                      {[
                        { header: "Name" },
                        { header: "Title" },
                        {
                          header: "Acronym",
                          tooltip: "Shortened form of the project name.",
                        },
                        { header: "Description" },
                        {
                          header: "AMR Category",
                          tooltip: "Antimicrobial Resistance category.",
                        },
                        { header: "Category" },
                        { header: "Type" },
                        { header: "Project Status" },
                        {
                          header: "On-hold Reason",
                          tooltip: "Reason why the project is on hold.",
                        },
                        { header: "Countries" },
                        {
                          header: "Source",
                          tooltip: "Origin or provider(s) of the data.",
                        },
                        {
                          header: "Data Format",
                          tooltip: "Data download format",
                        },
                        {
                          header: "Entries",
                          tooltip: "Number of data records.",
                        },

                        { header: "Study Design" },
                        { header: "Project Type" },
                        { header: "Main Project Name" },
                        {
                          header: "Data Capture Method",
                          tooltip: "Technique used to collect data.",
                        },
                        {
                          header: "In Warehouse",
                          tooltip: "True is data is available for download",
                        },
                        { header: "Protocol ID" },
                        { header: "Country Protocol ID" },
                        { header: "Start Date" },
                        { header: "End Date" },
                        {
                          header: "Citation Info",
                        },
                      ].map(({ header, tooltip }) => (
                        <th
                          key={header}
                          className="p-5 text-left relative group"
                        >
                          <div className="flex items-center">
                            {header}
                            {tooltip && (
                              <div className="relative ml-2 group">
                                <InfoCircledIcon className="w-4 h-4 text-white cursor-help" />
                                <div className="absolute -top-10 left-0 bg-gray-800 text-white text-xs rounded p-2 shadow-md whitespace-nowrap hidden group-hover:block">
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
                        } rounded-t-lg border-b border-gray-200`}
                      >
                        <td className="p-5">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600"
                            onChange={(e) => handleRowCheck(e, dataset.id)}
                            checked={selectedRows.includes(dataset.id)}
                          />
                        </td>

                        {[
                          dataset.name,
                          dataset.title,
                          dataset.acronym,
                          dataset.description,
                          dataset.amr_category,
                          dataset.category,
                          dataset.type,

                          dataset.project_status,
                          dataset.on_hold_reason,
                          dataset.countries,

                          dataset.source,
                          dataset.data_format,
                          dataset.entries_count,

                          // dataset.citation_info,
                          dataset.study_design,

                          dataset.project_type,
                          dataset.main_project_name,
                          dataset.data_capture_method,
                          dataset.in_warehouse?.toString(),

                          dataset.protocol_id,
                          dataset.country_protocol_id,
                          formatDate(dataset.start_date),
                          formatDate(dataset.end_date),
                        ].map((value, idx) => (
                          <td
                            key={idx}
                            className="p-5 max-w-[150px] h-[50px] whitespace-nowrap overflow-hidden text-ellipsis hover:overflow-visible hover:whitespace-normal hover:max-w-none hover:h-full"
                          >
                            {value}
                          </td>
                        ))}
                        <td className="p-5 max-w-[150px] h-[50px] relative group">
                          <div className="truncate ">
                            {dataset.citation_info ? (
                              <span>Citation Available</span>
                            ) : (
                              <span className="text-gray-500 italic">
                                No citations
                              </span>
                            )}
                          </div>
                          {dataset.citation_info && (
                            <div className="absolute top-full left-[-70%] mt-2 bg-gray-800 text-white text-[10px] rounded p-2 shadow-md hidden group-hover:block z-10">
                              <p className="font-bold mb-1">Citations</p>
                              <p>{dataset.citation_info}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
