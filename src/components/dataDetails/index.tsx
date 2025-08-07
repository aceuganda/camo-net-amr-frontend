"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useGetDataSet } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import {
  requestAccess,
  downloadData,
  ReRequestAccess,
  useDatasetVariables,
  deletePermission,
} from "@/lib/hooks/useDataSets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";

import { ChevronLeftIcon, StackIcon } from "@radix-ui/react-icons";

// Import our new components
import DatasetHeader from "./DatasetHeader";
import DatasetAbout from "./DatasetAbout";
import CredibilityPanel from "./CredibilityPanel";
import VariablesGrid from "./VariablesGrid";
import RequestAccessModal from "./RequestAccessModal";
import DownloadModal from "./DownloadModal";
import PermissionsSection from "./PermissionsSection";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface VariableInfo {
  type: string;
  description: string;
}

interface DataSet {
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
  id: string;
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
}

interface UserPermission {
  user_id: string;
  last_update: string;
  title: string;
  resource: string;
  downloads_count: number;
  agreed_to_privacy: boolean;
  re_request_count: number;
  category: string;
  status: string;
  project_description: string;
  irb_number: string;
  id: string;
  denial_reason: string | null;
  referee_email: string;
  data_set_id: string;
  created_at: string;
  project_title: string;
  referee_name: string;
  institution: string;
  requested_variables: string[];
  approver_id: string | null;
}

interface ApiResponse {
  data_set: DataSet;
  is_super_admin: boolean;
  user_permissions: UserPermission[];
}

export default function DatasetDetails({ id }: any) {
  const { data, isLoading, isSuccess, error, refetch } = useGetDataSet(id);
  const dataset: ApiResponse = data?.data || {};
  const userPermissions = dataset.user_permissions;
  const router = useRouter();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // Agreement states
  const [isAgreedToConfidentiality, setIsAgreedToConfidentiality] = useState(false);
  const [isAgreedToDataSharing, setIsAgreedToDataSharing] = useState(false);

  // Form state
  const [formValues, setFormValues] = useState({
    project_description: "",
    institution: "",
    title: "",
    agreed_to_privacy: false,
    project_title: "",
    otherCategory: "",
    category: "",
    referee_name: "",
    referee_email: "",
    irb_number: "",
  });

  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  // Get dictionary data
  const {
    data: dictionaryData,
    isSuccess: dictionarySuccess,
    isLoading: dictionaryDataLoading,
    error: dictionaryDataError,
    refetch: getDictionary,
  } = useDatasetVariables(
    dataset?.data_set &&
      dataset?.data_set.category.toLocaleLowerCase().includes("economic")
      ? "economic"
      : dataset?.data_set?.db_name.toLocaleLowerCase().includes("amu")
      ? "amu"
      : !dataset?.data_set
      ? ""
      : !dataset?.data_set.in_warehouse
      ? ""
      : dataset.data_set.thematic_area
  );

  // Computed values
  const canDownload =
    (userPermissions?.some((perm) => perm.status === "approved") &&
      dataset.data_set.in_warehouse) ||
    dataset.is_super_admin;

  const canRequestAccess = !userPermissions || userPermissions?.length < 1;
  const showDownloadButton = dataset?.data_set?.in_warehouse;

  const hasOnlyDeniedRequests =
    userPermissions?.every((perm) => perm.status === "denied") &&
    !userPermissions.some(
      (perm) => perm.status === "requested" || perm.status === "approved"
    );

  const approvedDownloadsCount = userPermissions
    ?.filter((perm) => perm.status === "approved")
    .reduce((acc, perm) => acc + perm.downloads_count, 0);

  const permissionStatus = canDownload
    ? "approved"
    : userPermissions?.some((perm) => perm.status === "requested")
    ? "requested"
    : hasOnlyDeniedRequests
    ? "denied"
    : "none";

  // Mutations
  const {
    data: downloadedData,
    isSuccess: isDownloadSuccess,
    error: downloadError,
    isPending: downloadPending,
    mutate: downloadFn,
  } = useMutation({
    mutationFn: downloadData,
  });

  const {
    data: reRequestedData,
    isSuccess: reRequestSuccess,
    error: reRequestError,
    isPending: reRequestPending,
    mutate: reRequestAccess,
  } = useMutation({
    mutationFn: ReRequestAccess,
  });

  const {
    data: requestData,
    isSuccess: isRequestSuccess,
    error: requestError,
    isPending: requestPending,
    mutate: requestFn,
  } = useMutation({
    mutationFn: requestAccess,
  });

  const {
    mutate: deletePermissionFn,
    isPending: deletePending,
    isSuccess: deleteSuccess,
    isError: deleteError,
  } = useMutation<any, Error, { permissionId: string }>({
    mutationFn: ({ permissionId }) => deletePermission(permissionId),
    onSuccess: () => {
      toast.success("Completed successfully.");
      setIsAgreementModalOpen(false);
      window.location.reload();
    },
    onError: () => {
      toast.error("Failed to revoke request.");
    },
  });

  // Helper functions
  function validRe_request(lastUpdate: Date | null) {
    if (!lastUpdate) return false;
    const today = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    const differenceInMilliseconds = today.getTime() - lastUpdateDate.getTime();
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    return differenceInDays < 14;
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function generateCSVFromDataset() {
    const csvRows: string[] = [];

    if (dictionaryData?.data?.data) {
      const dictionary = dictionaryData.data.data as VariableInfo;
      csvRows.push("variable,type,description");

      for (const [key, value] of Object.entries(dictionary)) {
        const row = `${key},${value.type},${value.description}`;
        csvRows.push(row);
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "dictionary.csv";
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  // Event handlers
  const handleReapplyRequest = (e: any) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleReRequest = async (permId: string) => {
    const permission = userPermissions?.find((perm) => perm.id === permId);

    if (
      permission &&
      permission.status === "requested" &&
      !validRe_request(new Date(permission.last_update || permission.created_at))
    ) {
      try {
        await reRequestAccess(permission.id);
        toast.success("Re-request sent successfully.");
      } catch (error) {
        toast.error("Failed to send re-request. Please try again later.");
      }
    } else {
      toast.error("This request is not eligible for re-requesting access.");
    }
  };

  const handleRequest = async (e: any) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: any) => {
    e.preventDefault();
    const {
      project_description,
      institution,
      title,
      agreed_to_privacy,
      project_title,
      category,
      otherCategory,
      referee_name,
      referee_email,
      irb_number,
    } = formValues;
    
    if (!selectedVariables || selectedVariables.length < 1) {
      toast.error("Please select at least one variable before submitting");
      return;
    } else if (
      project_description &&
      project_title &&
      institution &&
      title &&
      agreed_to_privacy &&
      category &&
      referee_name &&
      referee_email &&
      irb_number
    ) {
      const data = {
        project_description,
        institution,
        title,
        agreed_to_privacy,
        project_title,
        category: category === "other" ? otherCategory : category,
        referee_name,
        referee_email,
        irb_number,
        requested_variables: selectedVariables,
      };
      requestFn({ ...data, data_set_id: dataset.data_set.id });
      setIsModalOpen(false);
    } else {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCheckboxChange = (variable: string) => {
    setSelectedVariables((prev) => {
      if (prev.includes(variable)) {
        return prev.filter((item) => item !== variable);
      } else {
        return [...prev, variable];
      }
    });
  };

  const handleSelectAll = (e: any) => {
    e.preventDefault();
    if (
      dictionaryData?.data?.data &&
      selectedVariables.length !== dictionaryData?.data?.data.length
    ) {
      setSelectedVariables(Object.keys(dictionaryData.data.data));
    }
  };

  const handleDeselectAll = (e: any) => {
    e.preventDefault();
    setSelectedVariables([]);
  };

  const handleDwn = async () => {
    if (isAgreedToConfidentiality && isAgreedToDataSharing) {
      await downloadFn(dataset.data_set.db_name);
    } else {
      toast.error(
        "Please agree to the confidentiality agreement before downloading the data"
      );
    }
  };

  const handleModelsClick = () => {
    router.push(`/datasets/access/${id}/models`);
  };

  // Effects
  useEffect(() => {
    if (downloadedData && isDownloadSuccess) {
      if (downloadedData instanceof Blob) {
        FileSaver.saveAs(downloadedData, "data.csv");
        setIsAgreementModalOpen(false);
        toast.success("Downloaded successfully, please check your downloads folder.");
      } else {
        toast.error("Downloaded data is not a valid file");
      }
    }
    if (downloadError) {
      toast.error(
        `Failed to download data set, make sure you have the permission to download this data set`
      );
    }
  }, [downloadedData, isDownloadSuccess, downloadError]);

  useEffect(() => {
    if (requestData && isRequestSuccess) {
      toast.success("Requested successfully");
      setIsModalOpen(false);
      window.location.reload();
    }
    if (requestError) {
      toast.error(`Failed to request access to this data set`);
    }
  }, [requestData, requestError, isRequestSuccess]);

  useEffect(() => {
    if (reRequestSuccess) {
      toast.success("Request sent successfully");
      refetch();
    }
  }, [reRequestSuccess]);

  useEffect(() => {
    if (isSuccess && dataset) {
      getDictionary();
    }
  }, [isSuccess]);

  return (
    <main className="min-h-screen flex-col w-full flex items-start bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {isLoading && (
        <div className="text-center mt-[1rem] w-full flex items-start h-[4rem] justify-center text-gray-500">
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="text-center w-full mt-[1rem] flex items-start justify-center text-gray-500 bg-red-50 p-4 rounded-lg border border-red-200 mx-4">
          <span className="text-red-600">Failed to fetch the Data, Please refresh the page</span>
        </div>
      )}

      {data && !error && !isLoading && (
        <div className="min-h-screen w-full">
          <div className="mx-auto px-4 w-full sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Enhanced Breadcrumb */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-[#24408E]" />
                </button>
                <Link
                  href="/datasets/access"
                  className="text-[#00B9F1] hover:text-[#0090bd] font-medium"
                >
                  Datasets
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-[#24408E] font-semibold truncate max-w-[300px]" title={dataset.data_set.name}>
                  {dataset.data_set.name}
                </span>
              </div>
            </div>

            {/* Dataset Header */}
            <DatasetHeader
              dataset={dataset}
              userPermissions={userPermissions}
              canDownload={canDownload}
              canRequestAccess={canRequestAccess}
              showDownloadButton={showDownloadButton}
              hasOnlyDeniedRequests={hasOnlyDeniedRequests}
              approvedDownloadsCount={approvedDownloadsCount}
              permissionStatus={permissionStatus}
              downloadPending={downloadPending}
              requestPending={requestPending}
              onReapplyRequest={handleReapplyRequest}
              onDownloadRequest={() => setIsAgreementModalOpen(true)}
              onAccessRequest={handleRequest}
              onModelsClick={handleModelsClick}
            />

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-grow min-w-0">
                <DatasetAbout dataset={dataset.data_set} formatDate={formatDate} />

                {/* Permissions Section - Horizontal Scroll */}
                <PermissionsSection
                  userPermissions={userPermissions}
                  onReRequest={handleReRequest}
                  reRequestPending={reRequestPending}
                  deletePermissionFn={deletePermissionFn}
                  deletePending={deletePending}
                  validRe_request={validRe_request}
                  formatDate={formatDate}
                />

                {/* Variables Section */}
                {dataset.data_set.in_warehouse && (
                  <VariablesGrid
                    dictionaryData={dictionaryData}
                    dictionaryDataLoading={dictionaryDataLoading}
                    dictionaryDataError={dictionaryDataError}
                    dictionarySuccess={dictionarySuccess}
                    isSuccess={isSuccess}
                    onDownloadDictionary={generateCSVFromDataset}
                  />
                )}
              </div>

              {/* Sidebar */}
              <CredibilityPanel
                dataset={dataset.data_set}
                userPermissions={userPermissions}
                approvedDownloadsCount={approvedDownloadsCount}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RequestAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formValues={formValues}
        selectedVariables={selectedVariables}
        dictionaryData={dictionaryData}
        dictionaryDataLoading={dictionaryDataLoading}
        dictionaryDataError={dictionaryDataError}
        dictionarySuccess={dictionarySuccess}
        requestPending={requestPending}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSubmit={handleModalSubmit}
      />

      <DownloadModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        userPermissions={userPermissions}
        downloadPending={downloadPending}
        deletePending={deletePending}
        onDownload={handleDwn}
        onDeletePermission={deletePermissionFn}
        onAgreedToConfidentiality={setIsAgreedToConfidentiality}
        onAgreedToDataSharing={setIsAgreedToDataSharing}
      />
    </main>
  );
}