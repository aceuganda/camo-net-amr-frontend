"use client";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronRightIcon,
  LayersIcon,
  Cross1Icon,
  ChevronDownIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { useSearch } from "@/context/searchContext";

import Link from "next/link";

type Dataset = {
  id: string;
  name: string;
  category: string;
  type: string;
  sampleSize: number;
  countries: string[];
  projectStatus: string;
  dataUsePermission: string;
};

const datasets: Dataset[] = [
  {
    id: "1",
    name: "Flemming Dataset",
    category: "Demographic and Clinical",
    type: "Secondary (Derived) dataset",
    sampleSize: 599,
    countries: ["UGANDA"],
    projectStatus: "Closed",
    dataUsePermission: "Publicly Available",
  },
  {
    id: "2",
    name: "Combatting Antimicrobial Resistance in Uganda",
    category: "Demographic and Clinical",
    type: "Secondary (Derived) dataset",
    sampleSize: 200062,
    countries: ["UGANDA"],
    projectStatus: "Closed",
    dataUsePermission: "Reserved Access",
  },
  {
    id: "3",
    name: "AMR Economic data",
    category: "Economic Data",
    type: "Primary dataset",
    sampleSize: 200,
    countries: ["UGANDA"],
    projectStatus: "Active",
    dataUsePermission: "Reserved Access",
  },
];
const categories = [
  { name: "Economic Data", count: 1 },
  { name: "Demographic & Health", count: 3 },
  { name: "Genomic", count: 1 },
];

const types = [
  { name: "Primary dataset", count: 4 },
  { name: "Secondary (Derived) dataset", count: 1 },
];

export default function HomeCatalogue() {
  const { searchTerm } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

  return (
    <main className="flex min-h-screen flex-col items-center ">
      <div className="w-full flex flex-row  justify-between ">
        <div
          className={`transition-all duration-300 ${
            isMenuOpen ? "w-[30rem] px-[3rem]" : "w-16"
          } bg-[#F7F7F7] h-auto min-h-[40rem]  shadow-lg flex flex-col p-4 rounded-b-[10px]`}
        >
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            {isMenuOpen && <span className="font-semibold">Filters</span>}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? (
                <Cross1Icon className="w-6 h-6" />
              ) : (
                <LayersIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <>
              {/* <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="p-2 rounded-t-[7px] border-b-2 border-gray-300 pr-10 w-full bg-[#F0F9FA] shadow-custom"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute right-2 top-2 w-6 h-6 text-gray-500" />
              </div> */}

              <div className="mb-4">
                <h3
                  className="font-[600] text-[15px] mb-[1.5rem] flex items-center text-[#24408E] cursor-pointer"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  {isCategoryOpen ? (
                    <ChevronDownIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
                  ) : (
                    <ChevronRightIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
                  )}
                  CATEGORY
                </h3>
                {isCategoryOpen && (
                  <ul className="pl-[2rem] text-[12px]">
                    {categories.map((category, index) => (
                      <li key={index} className="flex justify-between py-1">
                        <span>{category.name}</span>
                        <span>{category.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mb-4">
                <h3
                  className="font-[600] text-[15px] mb-[1.5rem] flex items-center text-[#24408E] cursor-pointer"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                >
                  {isTypeOpen ? (
                    <ChevronDownIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
                  ) : (
                    <ChevronRightIcon className="w-6 h-6 text-[#00B9F1] mr-2" />
                  )}
                  TYPE
                </h3>
                {isTypeOpen && (
                  <ul className="pl-[2rem] text-[12px]">
                    {types.map((type, index) => (
                      <li key={index} className="flex justify-between py-1">
                        <span>{type.name}</span>
                        <span>{type.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {!isMenuOpen && (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 border rounded mt-4 flex items-center justify-center"
            >
              <LayersIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="ml-[2rem] w-full">
          <div className="text-[#24408E] font-[700] w-full gap-[7px] flex-row flex items-center justify-end px-[1rem] my-[30px]">
            <DownloadIcon /> <span>EXPORT</span>
          </div>
          {filteredDatasets.length === 0 ? (
            <div className="text-center w-full flex items-start justify-center text-gray-500">
              No data for search term: {searchTerm}{" "}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-[95%] text-sm border-collapse rounded-t-lg overflow-hidden">
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
                    <th className="p-5 text-left">Name</th>
                    <th className="p-5 text-left">Category</th>
                    <th className="p-5 text-left">Type</th>
                    <th className="p-5 text-left">Sample Size</th>
                    <th className="p-5 text-left">Countries</th>
                    <th className="p-5 text-left">Project Status</th>
                    <th className="p-5 text-left">Data Use Permission</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredDatasets.map((dataset, index) => (
                    <tr
                      key={dataset.id}
                      className={`${index % 2 === 0 ? 'bg-[#EBF7FD]' : 'bg-white'} rounded-t-lg border-b border-gray-200`}
                    >
                      <td className="p-5">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          onChange={(e) => handleRowCheck(e, dataset.id)}
                          checked={selectedRows.includes(dataset.id)}
                        />
                      </td>
                      <td className="p-5">{dataset.name}</td>
                      <td className="p-5">{dataset.category}</td>
                      <td className="p-5">{dataset.type}</td>
                      <td className="p-5">{dataset.sampleSize}</td>
                      <td className="p-5">{dataset.countries.join(", ")}</td>
                      <td className="p-5">{dataset.projectStatus}</td>
                      <td className="p-5">{dataset.dataUsePermission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
