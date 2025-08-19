"use client";
import { useState, useEffect, Fragment } from "react";
import { useSearch } from "@/context/searchContext";
import { Search } from "lucide-react";
import { useGetUserCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import SidebarMenu from "../filter";
import { useRouter } from "next/navigation";
import { dataAccessPage } from "../GuideTour/steps";
import {
  CopyIcon,
  ExternalLinkIcon,
  StackIcon,
  Pencil2Icon,
  CubeIcon,
  MixerVerticalIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });
const GuideTour = dynamic(() => import("@/components/GuideTour"), {
  ssr: false,
});

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

// refactor this to types files
export interface UserPermission {
  user_id: string;
  status: string;
  last_update?: string;
  title?: string;
  resource?: string;
  downloads_count?: number;
  agreed_to_privacy?: boolean;
  re_request_count?: number;
  category?: string;
  project_description?: string;
  irb_number?: string;
  id?: string;
  denial_reason?: string | null;
  referee_email?: string;
  data_set_id?: string;
  created_at?: string;
  project_title?: string;
  referee_name?: string;
  institution?: string;
  approver_id?: string | null;
}

export interface FetchedDataset {
  id: string;
  name: string;
  project_status: string;
  citation_info: string;
  data_storage_medium: string;
  grant_code: string;
  category: string;
  on_hold_reason: string;
  principal_investigator: string;
  data_types_collected: string;
  study_data_link: string;
  size: string;
  acronym: string | null;
  countries: string;
  pi_email: string;
  main_data_type: string;
  data_types_details: string;
  db_name: string;
  description: string | null;
  data_collection_methods: string;
  pi_contact: string;
  study_design: string;
  project_type: string;
  type: string;
  start_date: string;
  source: string;
  project_manager: string;
  additional_notes: string;
  main_project_name: string;
  version: string;
  title: string;
  end_date: string;
  thematic_area: string;
  pm_email: string;
  coordinator_name: string;
  data_capture_method: string;
  amr_category: string;
  protocol_id: string;
  data_format: string;
  pm_contact: string;
  coordinator_email: string;
  collection_period: string | null;
  created_at: string;
  country_protocol_id: string;
  entries_count: string;
  data_access_method: string;
  coordinator_contact: string;
  in_warehouse: boolean;
  user_permissions: UserPermission[];
  access: string;
}

export default function UserCatalogue() {
  const { searchTerm, setSearchTerm } = useSearch();
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useGetUserCatalogue();
  const datasets: FetchedDataset[] = data?.data || [];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrendsMenuOpen, setIsTrendsMenuOpen] = useState(false);
  const router = useRouter();

  // Disable background scroll when trends menu is open
  useEffect(() => {
    document.body.style.overflow = isTrendsMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isTrendsMenuOpen]);

  const computeAccess = (permissions: FetchedDataset["user_permissions"]) => {
    if (!permissions || permissions.length === 0) return "not granted";
    const hasApproved = permissions.some((p) => p.status === "approved");
    if (hasApproved) return "approved";
    const hasRequested = permissions.some((p) => p.status === "requested");
    if (hasRequested) return "requested";
    const hasDenied = permissions.some((p) => p.status === "denied");
    if (hasDenied) return "denied";
    return "not granted";
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        dataset.amr_category.toLowerCase().includes(cat.toLowerCase())
      );
    const matchesStatus =
      selectedStatuses.length === 0 ||
      selectedStatuses.some((status) =>
        dataset.project_status.toLowerCase().includes(status.toLowerCase())
      );
    return matchesSearchTerm && matchesCategory && matchesStatus;
  });

  const handleDatasetClick = (datasetId: string) => {
    setSelectedDataset(datasetId);
    router.push(`/datasets/access/${datasetId}`);
  };

  const handleModelsClick = (e: React.MouseEvent, datasetId: string) => {
    e.stopPropagation();
    router.push(`/datasets/access/${datasetId}/models`);
  };

  const toggleRowExpansion = (datasetId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAccessStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          text: "Granted",
          icon: <DownloadIcon className="w-3 h-3" />,
        };
      case "requested":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          text: "Requested",
          icon: <EyeOpenIcon className="w-3 h-3" />,
        };
      case "denied":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          text: "Denied",
          icon: <span className="w-3 h-3 text-xs">✕</span>,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          text: "Request Access",
          icon: <ChevronRightIcon className="w-3 h-3" />,
        };
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-sm:h-[120vh] w-full flex sm:flex-row flex-col overflow-x-auto">
          <SidebarMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            className="menu_button"
          />

          <div className="flex-1 p-4 sm:p-6 min-w-0">
            {/* Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-4 mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search datasets..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B9F1] focus:border-[#00B9F1] text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Your Accessible Datasets Section - Top */}
            {filteredDatasets.length > 0 && !error && !isLoading && (
              <div className="mb-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <DownloadIcon className="w-6 h-6 text-[#24408E]" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
                      Your Accessible Datasets
                    </h2>
                  </div>
                    <button
                    onClick={() => setIsTrendsMenuOpen(!isTrendsMenuOpen)}
                    className="show_trends_button p-[5px] sm:p-3 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-xs sm:text-base"
                    >
                    <MixerVerticalIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {isTrendsMenuOpen ? "Hide Trends" : "Show Trends"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4 min-w-max">
                    {filteredDatasets
                      .filter(
                        (dataset) =>
                          computeAccess(dataset.user_permissions) === "approved"
                      )
                      .map((dataset) => (
                        <div
                          key={dataset.id}
                          onClick={() => handleDatasetClick(dataset.id)}
                          className="min-w-[280px] max-w-[320px] p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border rounded-xl shadow-sm bg-white hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#00B9F1]"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-sm font-semibold text-[#24408E] truncate"
                                title={dataset.name}
                              >
                                {dataset.name}
                              </h3>
                              {dataset.acronym && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {dataset.acronym}
                                </p>
                              )}
                            </div>
                            <ExternalLinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <Pencil2Icon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {dataset.entries_count} entries
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {dataset.study_design}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleModelsClick(e, dataset.id)}
                              className="flex-1 text-xs bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white px-3 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium"
                            >
                              <CubeIcon className="w-3 h-3 inline mr-1" />
                              Models
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDatasetClick(dataset.id);
                              }}
                              className="flex-1 text-xs bg-white border border-[#00B9F1] text-[#00B9F1] px-3 py-2 rounded-lg hover:bg-[#00B9F1] hover:text-white transition-all duration-200 font-medium"
                            >
                              <EyeOpenIcon className="w-3 h-3 inline mr-1" />
                              Details
                            </button>
                          </div>
                        </div>
                      ))}

                    {filteredDatasets.filter(
                      (dataset) =>
                        computeAccess(dataset.user_permissions) === "approved"
                    ).length === 0 && (
                      <div className="min-w-[280px] p-6 border border-dashed border-gray-300 rounded-xl text-center text-gray-500 bg-gray-50">
                        <StackIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No accessible datasets yet</p>
                        <p className="text-xs mt-1">
                          Request access to datasets below
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Available Datasets Section - Below */}
            <div className="flex items-center gap-3 mb-[2rem]">
              <StackIcon className="w-8 h-8 text-[#24408E]" />
              <div className="text-[1.8rem] font-bold text-[#24408E] bg-gradient-to-r from-[#24408E] to-[#00B9F1] bg-clip-text text-transparent">
                Available Datasets
              </div>
            </div>

            {isLoading && (
              <div className="text-center w-full flex items-start h-[4rem] justify-center text-gray-500">
                <DotsLoader />
              </div>
            )}

            {error && (
              <div className="text-center w-full flex items-start justify-center text-gray-500 bg-red-50 p-4 rounded-lg border border-red-200">
                <span className="text-red-600">
                  Failed to fetch the Catalog, Please refresh the page
                </span>
              </div>
            )}

            {filteredDatasets.length === 0 && searchTerm && (
              <div className="text-center w-full flex items-start justify-center text-gray-500 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                No data for search term:{" "}
                <span className="font-semibold ml-1">{searchTerm}</span>
              </div>
            )}

            {filteredDatasets.length === 0 &&
              (selectedCategories.length > 0 ||
                selectedStatuses.length > 0) && (
                <div className="text-center w-full flex items-start justify-center text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  No data matches the selected filters.
                </div>
              )}

            {filteredDatasets.length > 0 && !error && !isLoading && (
              <div className="data_access_table w-full overflow-x-auto shadow-2xl rounded-xl">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] sm:text-[12px] md:text-sm border-collapse min-w-[800px]">
                      <thead className="bg-gradient-to-r from-[#24408E] via-[#00B9F1] to-[#24408E] text-white">
                        <tr>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[160px] sm:min-w-[200px]">
                            Dataset
                          </th>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[100px] sm:min-w-[120px]">
                            Study Design
                          </th>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[80px] sm:min-w-[100px]">
                            Data Type
                          </th>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[60px] sm:min-w-[80px]">
                            Entries
                          </th>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[100px] sm:min-w-[120px]">
                            Access Status
                          </th>
                          <th className="p-2 sm:p-3 md:p-5 text-left font-semibold min-w-[120px] sm:min-w-[150px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDatasets.map((dataset, index) => {
                          const accessStatus = computeAccess(
                            dataset.user_permissions
                          );
                          const statusConfig =
                            getAccessStatusConfig(accessStatus);
                          const isExpanded = expandedRows.has(dataset.id);

                          return (
                            <Fragment key={dataset.id}>
                              <tr
                                className={`${
                                  index % 2 === 0 ? "bg-[#EBF7FD]" : "bg-white"
                                } border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer group`}
                                onClick={() => handleDatasetClick(dataset.id)}
                              >
                                <td className="p-2 sm:p-3 md:p-5">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRowExpansion(dataset.id);
                                      }}
                                      className="p-1 hover:bg-[#00B9F1] hover:text-white rounded transition-colors flex-shrink-0"
                                    >
                                      <ChevronRightIcon
                                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                      />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className="font-semibold text-[#24408E] group-hover:text-[#00B9F1] truncate"
                                        title={dataset.name}
                                      >
                                        {dataset.name}
                                      </div>
                                      {dataset.acronym && (
                                        <div
                                          className="text-xs text-gray-500 mt-1 truncate"
                                          title={dataset.acronym}
                                        >
                                          {dataset.acronym}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="p-2 sm:p-3 md:p-5">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                                    {dataset.study_design}
                                  </span>
                                </td>

                                <td className="p-2 sm:p-3 md:p-5">
                                  <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium whitespace-nowrap">
                                    {dataset.category}
                                  </span>
                                </td>

                                <td className="p-2 sm:p-3 md:p-5">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <Pencil2Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-semibold whitespace-nowrap text-xs sm:text-sm">
                                      {dataset.entries_count}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-2 sm:p-3 md:p-5">
                                  <div
                                    className={`flex items-center w-fit gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border whitespace-nowrap`}
                                  >
                                    {statusConfig.icon}
                                    <span className="hidden sm:inline">
                                      {statusConfig.text}
                                    </span>
                                    <span className="sm:hidden">
                                      {statusConfig.text.split(" ")[0]}
                                    </span>
                                    {accessStatus === "approved" &&
                                      dataset.user_permissions.some(
                                        (permission) =>
                                          permission.status === "approved" &&
                                          (permission.downloads_count || 0) >= 2
                                      ) && (
                                        <span className="text-red-500 text-[9px] sm:text-[10px] ml-1 hidden sm:inline">
                                          (Max downloads reached)
                                        </span>
                                      )}
                                  </div>
                                </td>

                                <td className="p-2 sm:p-3 md:p-5">
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    <button
                                      onClick={(e) =>
                                        handleModelsClick(e, dataset.id)
                                      }
                                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-xs font-medium whitespace-nowrap"
                                      title="View Models"
                                    >
                                      <CubeIcon className="w-3 h-3" />
                                      <span className="hidden sm:inline">
                                        Models
                                      </span>
                                      <span className="sm:hidden">M</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDatasetClick(dataset.id);
                                      }}
                                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white border border-[#00B9F1] text-[#00B9F1] rounded-lg hover:bg-[#00B9F1] hover:text-white transition-all duration-200 text-xs font-medium whitespace-nowrap"
                                      title="View Details"
                                    >
                                      <EyeOpenIcon className="w-3 h-3" />
                                      <span className="hidden sm:inline">
                                        Details
                                      </span>
                                      <span className="sm:hidden">D</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && (
                                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                                  <td colSpan={6} className="p-2 sm:p-3 md:p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-inner overflow-x-auto">
                                      <div className="space-y-2 min-w-0">
                                        <h4 className="font-semibold text-[#24408E] text-xs sm:text-sm">
                                          Project Info
                                        </h4>
                                        <div className="text-xs space-y-1">
                                          <p className="break-words">
                                            <span className="font-medium">
                                              PI:
                                            </span>{" "}
                                            {dataset.principal_investigator}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Countries:
                                            </span>{" "}
                                            {dataset.countries}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Period:
                                            </span>{" "}
                                            {dataset.start_date} -{" "}
                                            {dataset.end_date}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-2 min-w-0">
                                        <h4 className="font-semibold text-[#24408E] text-xs sm:text-sm">
                                          Data Details
                                        </h4>
                                        <div className="text-xs space-y-1">
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Size:
                                            </span>{" "}
                                            {dataset.size}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Format:
                                            </span>{" "}
                                            {dataset.data_format}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Collection:
                                            </span>{" "}
                                            {dataset.data_collection_methods}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-2 min-w-0">
                                        <h4 className="font-semibold text-[#24408E] text-xs sm:text-sm">
                                          Classification
                                        </h4>
                                        <div className="text-xs space-y-1">
                                          <p className="break-words">
                                            <span className="font-medium">
                                              AMR Category:
                                            </span>{" "}
                                            {dataset.amr_category}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Thematic Area:
                                            </span>{" "}
                                            {dataset.thematic_area}
                                          </p>
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Version:
                                            </span>{" "}
                                            {dataset.version}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

       

        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[95%] bg-gradient-to-br from-blue-50 to-cyan-50 shadow-2xl transition-transform transform ${
            isTrendsMenuOpen ? "translate-x-0" : "translate-x-full"
          } z-50`}
        >
          <button
            onClick={() => setIsTrendsMenuOpen(false)}
            className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Close
          </button>
          <div className="p-4 h-full flex flex-col justify-self-center w-[90%] sm:w-[80%] overflow-y-auto">
            <h1 className="font-[600] mt-[5rem] text-center text-2xl text-[#24408E] mb-8">
              Sample trends from the datasets
            </h1>
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-[11px] sm:text-xl text-center font-semibold text-[#24408E] mb-4">
                Resistance Cases By Gender
              </h3>
              <ResistanceLinesByGender />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-[11px] sm:text-xl text-center font-semibold text-[#24408E] mb-4">
                Percentage resistance of organisms as per antibiotics vs time
              </h3>
              <OrganismResistanceByTime />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg">
              <h3 className="text-[11px] sm:text-xl text-center font-semibold text-[#24408E] mb-4">
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
