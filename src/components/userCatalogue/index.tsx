"use client";
import { useState, useEffect } from "react";
import { useSearch } from "@/context/searchContext";
import { useGetUserCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import SidebarMenu from "../filter";
import { useRouter } from "next/navigation";
import { dataAccessPage } from "../GuideTour/steps";
const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
const GuideTour = dynamic(() => import("@/components/GuideTour"), { ssr: false });

const OrganismResistanceByAge = dynamic(
  () => import("./resistanceByAgeAndOrganisms"),
  { ssr: false }
);
const ResistanceLinesByGender = dynamic(
  () => import("./resistanceByGenderChart"),
  { ssr: false }
);
const OrganismResistanceByTime = dynamic(
  () => import("./resistanceByTimeAndOrganism"),
  { ssr: false }
);

type FetchedDataset = {
  id: string;
  name: string;
  
  category: string;
  type: string;
  study_design: string;
  project_status: string;
  entries_count: string;
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
  const { data, isLoading, error } = useGetUserCatalogue();
  const datasets: FetchedDataset[] = data?.data || [];
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isTrendsMenuOpen, setIsTrendsMenuOpen] = useState(false); // State for trends menu
  const router = useRouter();

  // Disable background scroll when trends menu is open
  useEffect(() => {
    if (isTrendsMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [isTrendsMenuOpen]);

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        dataset.amr_category.toLowerCase().includes(cat.toLowerCase())
      );
    const matchesType =
      selectedStatuses.length === 0 ||
      selectedStatuses.some((status) =>
        dataset.project_status.toLowerCase().includes(status.toLowerCase())
      );
    return matchesSearchTerm && matchesCategory && matchesType;
  });

  const handleDatasetClick = (datasetId: string) => {
    setSelectedDataset(datasetId);
    router.push(`/datasets/access/${datasetId}`);
  };

  return (
    <>
    <main className="flex min-h-screen flex-col items-center ">
      <div className="max-sm:h-[120vh] w-full flex sm:flex-row flex-col overflow-x-hidden">
        <SidebarMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          className="menu_button"
        />

        <div className="m-[2rem] w-full ">
          <div className="text-[1.5rem] font-bold text-[#24408E] mb-[1rem]">
            Available datasets
          </div>
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
            <div className="data_access_table w-[90%] overflow-x-auto">
              <table className=" text-[12px] sm:text-sm border-collapse rounded-t-lg overflow-hidden ">
                <thead className="bg-[#00B9F1] text-white">
                  <tr>
                    <th className="p-5 text-left">Name</th>
                    <th className="p-5 text-left">Study Design</th>
                    <th className="p-5 text-left">Data collected</th>
                    {/* <th className="p-5 text-left">Data collected</th> */}
                    {/* <th className="p-5 text-left">Status</th> */}
                    <th className="p-5 text-left">Entries</th>
                    {/* <th className="p-5 text-left">Available For download</th> */}
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
                      {/* <td className="p-5">{dataset.amr_category}</td> */}
                      <td className="p-5">{dataset.category}</td>
                      {/* <td className="p-5">{dataset.project_status}</td> */}
                      <td className="p-5">{dataset.entries_count}</td>
                      {/* <td className="p-5">{dataset.in_warehouse.toString()}</td> */}
                      <td className="p-5">
                        {dataset.access === "approved" && (
                          <span className="text-[#24408E] font-bold">
                            Granted
                          </span>
                        )}
                        {dataset.access === "requested" && (
                          <span className="text-yellow-500 font-bold">
                            Requested
                          </span>
                        )}
                        {(dataset.access === "not granted" ) && (
                          <span className="text-gray-500 font-bold">
                             Request data access
                          </span>
                        )}
                        {(dataset.access === "denied") && (
                          <span className="text-red-500 font-bold">
                            Denied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {filteredDatasets.length > 0 && !error && !isLoading && <div className="w-3/4 flex flex-col max-sm:self-center sm:w-1/4 sm:mt-[6rem] mt-[1rem] mr-[1.5rem] p-4 border bg-gray-50">
        <h2 className="text-sm font-bold mb-2">Your Accessible Datasets</h2>
        <ul className="space-y-2">
          {filteredDatasets
           .filter((dataset) => dataset.access === "approved")
          .map((dataset) => (
            <li key={dataset.id} onClick={() => handleDatasetClick(dataset.id)} className="p-2 cursor-pointer hover:underline hover:text-blue-500  border rounded-lg shadow bg-white">
              <span className="text-sm font-medium">{dataset.name}</span>
            </li>
          ))}
        </ul>
      </div>}
      </div>

      {/* Button to toggle trends menu */}
      <button
        onClick={() => setIsTrendsMenuOpen(!isTrendsMenuOpen)}
        className="show_trends_button absolute top-[9rem] right-4 p-2 bg-[#00B9F1] text-white rounded"
      >
        {isTrendsMenuOpen ? "Hide Trends" : "Show Trends"}
      </button>


      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[95%] bg-white shadow-lg transition-transform transform ${
          isTrendsMenuOpen ? "translate-x-0" : "translate-x-full"
        } z-50`}
      >
        <button
          onClick={() => setIsTrendsMenuOpen(false)}
          className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
        <div className="p-4 h-full flex  flex-col justify-self-center w-[90%]  sm:w-[80%] overflow-y-auto">
          <h1 className="font-[600] mt-[5rem]  text-center">Sample trends from the datasets</h1>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-[11px]  sm:text-xl  text-center font-semibold text-[#003366] mb-4">
              Resistance Cases By Gender
            </h3>
            <ResistanceLinesByGender />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-[11px]  sm:text-xl  text-center font-semibold text-[#003366] mb-4">
              Percentage resistance of organisms as per antibiotics vs time
            </h3>
            <OrganismResistanceByTime />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            
            <h3 className="text-[11px]  sm:text-xl  text-center font-semibold text-[#003366] mb-4">
              Percentage resistance of organisms as per antibiotics vs age
            </h3>
            <OrganismResistanceByAge />
          </div>
        </div>
      </div>
    </main>
    <GuideTour steps={dataAccessPage} guideKey="data_access_page" />
    </>
  );
}