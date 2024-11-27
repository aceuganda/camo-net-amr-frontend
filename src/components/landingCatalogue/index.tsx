"use client";

import { useState } from "react";
import {
  DownloadIcon,
} from "@radix-ui/react-icons";
import { useSearch } from "@/context/searchContext";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import SidebarMenu from "../filter";


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

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};


// Function to convert datasets to CSV format
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
          <div className="text-[#24408E] font-[700] w-full gap-[7px] flex-row flex items-center justify-end px-[1rem] my-[30px]">
            <DownloadIcon onClick={handleExport} className="cursor-pointer" /> 
            <span className="cursor-pointer" onClick={handleExport}>EXPORT</span>
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
              (selectedCategories.length > 0 || selectedStatuses.length > 0) && (
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
                        "Name",
                        "Title",
                        "Acronym",
                        "Description",
                        "AMR Category",
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
                      ].map((header) => (
                        <th key={header} className="p-5 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
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
                         
                          dataset.citation_info,
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