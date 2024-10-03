'use client';

import { useState } from "react";
import {
  ChevronRightIcon,
  LayersIcon,
  Cross1Icon,
  ChevronDownIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { useSearch } from "@/context/searchContext";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from 'next/dynamic';
import SidebarMenu from "../filter";

const DotsLoader = dynamic(() => import('../ui/dotsLoader'), { ssr: false });

type FetchedDataset = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  countries: string[];
  project_status: string;
  data_use_permissions: string;
  title: string;
  thematic_area: string;
  study_design: string;
  data_format: string;
  study_population: string;
  in_warehouse: boolean;
};


export default function HomeCatalogue() {
  const { searchTerm } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data, isLoading, error, } = useGetCatalogue();
  const datasets: FetchedDataset[] = data?.data || [];

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => dataset.category.toLowerCase().includes(cat.toLowerCase()));
    const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => dataset.type.toLowerCase().includes(type.toLowerCase()));
    return matchesSearchTerm && matchesCategory && matchesType;
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

  return (
    <main className="flex min-h-screen flex-col items-center ">
      <div className=" w-full flex flex-row  justify-between overflow-x-hidden">
      <SidebarMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
        />

        <div className={`ml-[2rem] w-[90%] ${!isMenuOpen? "" :"sm:w-[80%]" } `}>
          <div className="text-[#24408E] font-[700] w-full gap-[7px] flex-row flex items-center justify-end px-[1rem] my-[30px]">
            <DownloadIcon /> <span>EXPORT</span>
          </div>

          <div>
            {isLoading && (
              <div className="text-center w-full flex items-start h-[4rem] justify-center text-gray-500">
                <DotsLoader/>
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

            {filteredDatasets.length === 0 && (selectedCategories.length > 0 || selectedTypes.length > 0) && (
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
                      <th className="p-5 text-left">Name</th>
                      <th className="p-5 text-left">Category</th>
                      <th className="p-5 text-left">Type</th>
                      <th className="p-5 text-left">Sample Size</th>
                      <th className="p-5 text-left">Countries</th>
                      <th className="p-5 text-left">Protocol name</th>
                      <th className="p-5 text-left">Thematic area</th>
                      <th className="p-5 text-left">Study design</th>
                      <th className="p-5 text-left">Data format</th>
                      <th className="p-5 text-left">Study Population</th>
                      <th className="p-5 text-left">Project Status</th>
                      <th className="p-5 text-left">Data Use Permission</th>
                      <th className="p-5 text-left">Available For download</th>
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
                        <td className="p-5">{dataset.name}</td>
                        <td className="p-5">{dataset.category}</td>
                        <td className="p-5">{dataset.type}</td>
                        <td className="p-5">{dataset.size}</td>
                        <td className="p-5">{dataset.countries}</td>
                        <td className="p-5">{dataset.title}</td>
                        <td className="p-5">{dataset.thematic_area}</td>
                        <td className="p-5">{dataset.study_design}</td>
                        <td className="p-5">{dataset.data_format}</td>
                        <td className="p-5">{dataset.study_population}</td>
                        <td className="p-5">{dataset.project_status}</td>
                        <td className="p-5">{dataset.data_use_permissions}</td>
                        <td className="p-5">{dataset.in_warehouse.toString()}</td>
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
