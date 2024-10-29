"use client";
import { useState } from "react";
import { useSearch } from "@/context/searchContext";
import { useGetUserCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from 'next/dynamic';
import SidebarMenu from "../filter";
import { useRouter } from "next/navigation";

const DotsLoader = dynamic(() => import('../ui/dotsLoader'), { ssr: false });

type FetchedDataset = {
  id: string;
  name: string;
  category: string;
  type: string;
  study_design: string;
  project_status: string;
  participant_count: string;
  data_use_permissions: string;
  in_warehouse: boolean;
  amr_category: string;
  access: string;
};

export default function UserCatalogue() {
  const { searchTerm } = useSearch();
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data, isLoading, error } = useGetUserCatalogue();
  const datasets: FetchedDataset[] = data?.data || [];
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const router = useRouter();

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => dataset.amr_category.toLowerCase().includes(cat.toLowerCase()));
    const matchesType = selectedStatuses.length === 0 || selectedStatuses.some(status => dataset.project_status.toLowerCase().includes(status.toLowerCase()));
    return matchesSearchTerm && matchesCategory && matchesType;
  });


  const handleDatasetClick = (datasetId: string) => {
    setSelectedDataset(datasetId);
    router.push(`/datasets/access/${datasetId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center ">
         <div className=" w-full flex flex-row overflow-x-hidden">
      <SidebarMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
        
        />
        
          <div  className="m-[2rem] w-full ">
            <div className="text-[1.5rem] font-bold text-[#24408E] mb-[1rem]">
                Datasets
            </div>
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
            
            {filteredDatasets.length === 0 && (selectedCategories.length > 0 || selectedStatuses.length > 0) && (
              <div className="text-center w-full flex items-start justify-center text-gray-500">
                No data matches the selected filters.
              </div>
            )}

            {filteredDatasets.length > 0 && !error && !isLoading && (
              <div className="w-[100%] overflow-x-auto">
                <table className=" text-[12px] sm:text-sm border-collapse rounded-t-lg overflow-hidden ">
                  
                  <thead className="bg-[#00B9F1] text-white">
                    <tr>
                      <th className="p-5 text-left">Name</th>
                      <th className="p-5 text-left">Study</th>
                      <th className="p-5 text-left">AMR Category</th>
                      <th className="p-5 text-left">Category</th>
                      <th className="p-5 text-left">Status</th>
                      <th className="p-5 text-left">Entries</th>
                      {/* <th className="p-5 text-left">Data Use Permission</th> */}
                      <th className="p-5 text-left">Available For download</th>
                      <th className="p-5 text-left">Access</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {filteredDatasets.map((dataset, index) => (
                      <tr
                        key={dataset.id}
                        className={`${
                          index % 2 === 0 ? "bg-[#EBF7FD]" : "bg-white"
                        } rounded-t-lg border-b border-gray-200 cursor-pointer hover:bg-gray-100`}
                        onClick={() => handleDatasetClick(dataset.id)}
                      >
                        <td className="p-5">{dataset.name}</td>
                        <td className="p-5">{dataset.study_design}</td>
                        <td className="p-5">{dataset.amr_category}</td>
                        <td className="p-5">{dataset.category}</td>
                        <td className="p-5">{dataset.project_status}</td>
                        <td className="p-5">{dataset.participant_count}</td>
                        {/* <td className="p-5">{dataset.data_use_permissions}</td> */}
                        <td className="p-5">{dataset.in_warehouse.toString()}</td>
                        <td className="p-5">
                          {dataset.access === "approved" && (
                            <span className="text-[#24408E] font-bold">Granted</span>
                          )}
                          {dataset.access === "requested" && (
                            <span className="text-yellow-500 font-bold">Requested</span>
                          )}
                          {(dataset.access === "not granted" || dataset.access === "denied") && (
                            <span className="text-gray-500 font-bold">Not Granted</span>
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
    </main>
  );
}

