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

import ConfidentialityAgreement from "../confidentialityAgreement";
import DataSharingAgreement from "../dataSharingPolicy";
import { Cross2Icon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
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
  const [isAgreedToConfidentiality, setIsAgreedToConfidentiality] =
    useState(false);

  const [isAgreedToDataSharing, setIsAgreedToDataSharing] = useState(false);
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "py-2 px-4 rounded-full text-sm font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "denied":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "requested":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  const handleReapplyRequest = (e:any) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  function validRe_request(lastUpdate: Date | null) {
    if (!lastUpdate) {
      return false;
    }
    const today = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    const differenceInMilliseconds = today.getTime() - lastUpdateDate.getTime();
    // Convert the difference to days
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    // Return true if the difference is less than 14 days

    return differenceInDays < 14;
  }


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

  const handleReRequest = async (permId: string) => {
    const permission = userPermissions?.find((perm) => perm.id === permId);

    if (
      permission &&
      permission.status === "requested" &&
      !validRe_request(
        new Date(permission.last_update || permission.created_at)
      )
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
      console.log(data);
      requestFn({ ...data, data_set_id: dataset.data_set.id });
      setIsModalOpen(false);
    } else {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
  };

  useEffect(() => {
    if (downloadedData && isDownloadSuccess) {
      if (downloadedData instanceof Blob) {
        FileSaver.saveAs(downloadedData, "data.csv");
        setIsAgreementModalOpen(false);
        toast.success(
          "Downloaded successfully, please check your downloads folder."
        );
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
  function generateCSVFromDataset() {
    const csvRows: string[] = [];

    if (dictionaryData?.data?.data) {
      const dictionary = dictionaryData.data.data as VariableInfo;
      csvRows.push("variable,type,description");

      // Iterate through the dataset and construct rows
      for (const [key, value] of Object.entries(dictionary)) {
        const row = `${key},${value.type},${value.description}`;
        csvRows.push(row);
      }

      // Join rows with newlines to form the final CSV string
      const csvContent = csvRows.join("\n");
      // Create a Blob object from the CSV content
      const blob = new Blob([csvContent], { type: "text/csv" });

      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element for downloading
      const a = document.createElement("a");
      a.href = url;
      a.download = "dictionary.csv";
      document.body.appendChild(a);
      a.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

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

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  const handleCheckboxChange = (variable: string) => {
    setSelectedVariables((prev) => {
      if (prev.includes(variable)) {
        return prev.filter((item) => item !== variable);
      } else {
        return [...prev, variable];
      }
    });
  };

  useEffect(() => {
    if (isSuccess && dataset) {
      getDictionary();
    }
  }, [isSuccess]);

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

  return (
    <main className="min-h-screen flex-col w-full flex items-start bg-gray-50">
      {isLoading && (
        <div className="text-center mt-[1rem] w-full flex items-start h-[4rem] justify-center text-gray-500">
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="text-center w-full mt-[1rem] flex items-start justify-center text-gray-500">
          Failed to fetch the Data, Please refresh the page
        </div>
      )}

      {data && !error && !isLoading && (
        <div className="min-h-screen w-full">
          <div className="mx-auto px-4 w-full sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center space-x-2 text-sm mb-4 sm:mb-0">
                <Link
                  href="/datasets/access"
                  className="text-[#00B9F1] hover:text-[#0090bd]"
                >
                  Datasets
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{dataset.data_set.name}</span>
              </div>
              <div>
                <div className="flex flex-wrap gap-3">
                  {userPermissions?.length > 0 && hasOnlyDeniedRequests && (
                    <button
                      onClick={handleReapplyRequest}
                      className="px-6 py-2 rounded-lg bg-[#00B9F1] text-white hover:bg-[#0090bd] transition-all duration-200 flex items-center justify-center"
                    >
                      Reapply
                    </button>
                  )}
                  {!showDownloadButton && (
                    <div className="text-red-700 text-[14px]">
                      This dataset is not available for download yet
                    </div>
                  )}
                  {showDownloadButton &&
                    userPermissions &&
                    approvedDownloadsCount < 3 && (
                      <button
                        onClick={() => setIsAgreementModalOpen(true)}
                        disabled={!canDownload}
                        className={`px-6 py-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[10rem] ${
                          canDownload
                            ? "bg-[#00B9F1] text-white hover:bg-[#0090bd]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {downloadPending ? (
                          <DotsLoader />
                        ) : (
                          <>
                            <DownloadIcon width={20} height={20} />
                            Download
                          </>
                        )}
                      </button>
                    )}
                  {userPermissions && approvedDownloadsCount >= 3 && (
                    <div className="text-[11px] text-red-400 flex justify-center items-center">
                      Reached maximum download count 
                      Please contact amrdb@idi.co.ug for assistance
                    </div>
                  )}

                  {canRequestAccess && dataset.data_set.in_warehouse && (
                    <button
                      onClick={handleRequest}
                      className="px-6 py-2 rounded-lg bg-[#00B9F1] text-white hover:bg-[#0090bd] transition-all duration-200 flex items-center justify-center min-w-[10rem]"
                    >
                      {requestPending ? (
                        <DotsLoader />
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                          Request Access
                        </>
                      )}
                    </button>
                  )}

                  {!canRequestAccess && (
                    <span className={getStatusBadge(permissionStatus)}>
                      {permissionStatus === "requested"
                        ? "Access Requested"
                        : permissionStatus === "denied"
                        ? "Access Denied"
                        : "Approved"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#24408E] mb-8">
              {dataset.data_set.name}
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow min-w-[80%]">
                <div className="bg-white rounded-xl shadow-sm mb-8">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      About Dataset
                    </h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4">
                        {dataset.data_set.description}
                      </p>
                      <p className="text-gray-700 mb-6">
                        {dataset.data_set.title}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {[
                          {
                            label: "Category",
                            value: dataset.data_set.category,
                          },
                          {
                            label: "Thematic area",
                            value: dataset.data_set.thematic_area,
                          },
                          {
                            label: "AMR Category",
                            value: dataset.data_set.amr_category,
                          },
                          {
                            label: "Status",
                            value: dataset.data_set.project_status,
                          },
                          { label: "Size", value: dataset.data_set.size },
                          {
                            label: "Entries",
                            value: dataset.data_set.entries_count || "UNK",
                          },
                          {
                            label: "Study Design",
                            value: dataset.data_set.study_design,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                {item.label}
                              </p>
                              <p className="mt-1 text-gray-900">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            label: "Countries",
                            value: dataset.data_set.countries,
                          },
                          {
                            label: "Timeline",
                            value: `${formatDate(
                              dataset.data_set.start_date
                            )} - ${formatDate(dataset.data_set.end_date)}`,
                          },
                          {
                            label: "Export Data Format",
                            value: dataset.data_set.data_format,
                          },
                          { label: "Source", value: dataset.data_set.source },
                          {
                            label: "Data capture method",
                            value: dataset.data_set.data_capture_method,
                          },
                          {
                            label: "Main Project Name (if any)",
                            value: dataset.data_set.main_project_name || "N/A",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                {item.label}
                              </p>
                              <p className="mt-1 text-gray-900">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-80">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Credibility
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Protocol ID",
                        value: dataset.data_set.protocol_id,
                      },
                      {
                        label: "Citations",
                        value: dataset.data_set.citation_info,
                      },
                      {
                        label: "Country Protocol ID",
                        value: dataset.data_set.country_protocol_id,
                      },
                      {
                        label: "Number Downloads",
                        value: approvedDownloadsCount,
                      },
                      {
                        label: "Number Re-requests Sent",
                        value: userPermissions?.reduce(
                          (acc, perm) => acc + perm.re_request_count,
                          0
                        ),
                      },
                    ].map((item, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium text-gray-500">
                          {item.label}
                        </p>
                        <p
                          className={`mt-1 ${
                            item.label === "Number Downloads" &&
                            userPermissions
                              ?.filter((perm) => perm.status === "approved")
                              .some((perm) => perm.downloads_count > 2)
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Permission Requests Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Permission Requests
                    </h3>
                    {userPermissions?.length > 0 ? (
                      <div className="space-y-4">
                        {userPermissions.map((perm, index) => {
                          const isEligibleForReRequest =
                            perm.status === "requested" &&
                            !validRe_request(
                              new Date(perm.last_update || perm.created_at)
                            );

                          return (
                            <div
                              key={index}
                              className="border rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-center">
                                <p className="text-sm max-w-[7rem] font-medium text-gray-900 truncate">
                                  {/* {perm.project_title || "Untitled Project"} */}
                                  bvadhlbfjgaidfhriuehaouwehusdifiefiuwehuf
                                </p>
                                <span className={getStatusBadge(perm.status)}>
                                  {perm.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-2">
                                Updated:
                                {formatDate(
                                  perm.last_update || perm.created_at
                                )}
                              </p>

                              {isEligibleForReRequest && (
                                <div className="mt-4">
                                  <p className="text-sm text-yellow-600 mb-2">
                                    This request is eligible for re-request.
                                    Please re-request access if no response has
                                    been received after 14 days.
                                  </p>
                                  <button
                                    onClick={(e:any) => {
                                       e.preventDefault();
                                       handleReRequest(perm.id)
                                      }}
                                    className="px-4 py-2 bg-[#00B9F1] w-[100%] text-white rounded-lg hover:bg-[#0090bd] transition-all duration-200"
                                  >
                                    {reRequestPending ? (
                                      <DotsLoader />
                                    ) : (
                                      "Re-request Access"
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Add Delete Request Button */}
                              {perm.status === "requested" && (
                                <button
                                  onClick={(e: any) => {
                                    e.preventDefault();
                                    deletePermissionFn({
                                      permissionId: perm.id,
                                    });
                                  }}
                                  className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                  disabled={deletePending}
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  {deletePending ? (
                                    <DotsLoader />
                                  ) : (
                                    "Delete Request"
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No permission requests found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {dataset.data_set.in_warehouse && (
              <div className="p-4">
                <div className="flex flex-row items-center justify-start gap-5 mb-4">
                  <h2 className="text-2xl font-semibold text-[#003366] ">
                    Data Download Variables
                  </h2>
                  <div title="Download dictionary">
                    <DownloadIcon
                      width={20}
                      height={20}
                      onClick={generateCSVFromDataset}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dictionaryDataLoading && <DotsLoader />}

                  {dictionaryDataError && (
                    <p className="text-red-600">
                      Failed to fetch data dictionary please refresh
                    </p>
                  )}
                  {!dictionaryData?.data?.data && isSuccess && (
                    <p className="text-red-600">Variables not available</p>
                  )}
                  {dictionarySuccess &&
                    dictionaryData?.data?.data &&
                    Object.entries(
                      dictionaryData?.data.data as VariableInfo
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center mb-2">
                          <label htmlFor={key} className="font-medium">
                            Name: {key}
                          </label>
                        </div>
                        <p className="text-gray-600 text-sm">
                          <strong>Type:</strong> {value?.type}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {String(value?.description)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
            {/*  request */}
            <div
        className={`fixed inset-y-0 right-0 w-[85%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
          ${isModalOpen ? "translate-x-0" : "translate-x-full"} 
          z-50 overflow-y-auto p-8`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Access</h2>

          <button
            onClick={() => setIsModalOpen(false)}
            className=" p-2 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>

        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Institution / Organization:
              </label>
              <input
                type="text"
                name="institution"
                value={formValues.institution}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter institution"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Title/Position:
              </label>
              <input
                type="text"
                name="title"
                value={formValues.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Referee Name:</label>
              <input
                type="text"
                name="referee_name"
                value={formValues.referee_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter referee name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Referee Email:</label>
              <input
                type="email"
                name="referee_email"
                value={formValues.referee_email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter referee email"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">IRB Number:</label>
              <input
                type="text"
                name="irb_number"
                value={formValues.irb_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter IRB number"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Project Title:</label>
              <input
                type="text"
                name="project_title"
                value={formValues.project_title}
                onChange={handleInputChange}
                className="w-full p-3 text-lg border rounded"
                placeholder="Enter project title"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Project Description/Abstract:
              </label>
              <textarea
                name="project_description"
                value={formValues.project_description}
                onChange={handleInputChange}
                className="w-full p-3 text-lg border rounded h-30"
                placeholder="Enter project description"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Category:</label>
              <select
                name="category"
                value={formValues.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  Select your category
                </option>
                <option value="student">Student</option>
                <option value="researcher">Researcher</option>
                <option value="developer">Data scientist</option>
                <option value="other">Other</option>
              </select>
              {formValues.category === "other" && (
                <div className="mt-2">
                  <label className="block text-gray-700 mb-2">
                    Please specify:
                  </label>
                  <input
                    type="text"
                    name="otherCategory"
                    value={formValues.otherCategory}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your category"
                  />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select requested variables to download
            </h2>
            {dictionarySuccess && dictionaryData?.data?.data && (
              <div className="flex justify-between mb-4">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Deselect All
                </button>
              </div>
            )}

            {
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
                {dictionaryDataLoading && <DotsLoader />}
                {dictionaryDataError && (
                  <p className="text-red-600">
                    Failed to fetch data dictionary please refresh
                  </p>
                )}

                {dictionarySuccess &&
                  dictionaryData?.data?.data &&
                  Object.entries(dictionaryData?.data.data as VariableInfo).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="border rounded-lg p-4 text-[12px] bg-white shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={key}
                            checked={selectedVariables.includes(key)}
                            onChange={() => handleCheckboxChange(key)}
                            className="mr-2"
                          />
                          <label htmlFor={key} className="font-medium">
                            {key}
                          </label>
                        </div>
                        <p className="text-gray-600 text-sm">
                          <strong>Type:</strong> {value?.type}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {String(value?.description)}
                        </p>
                      </div>
                    )
                  )}
              </div>
            }

            <ConfidentialityAgreement
              handleAgreedCallBack={(agreed: boolean) => {
                if (agreed)
                  setFormValues({
                    ...formValues,
                    agreed_to_privacy: true,
                  });
              }}
            />

            <button
              onClick={handleModalSubmit}
              className="w-full bg-[#00B9F1] text-white py-3 rounded-lg hover:bg-[#0090bd] transition-colors"
            >
              {requestPending ? <DotsLoader /> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
      {/*  download */}
      <div
        className={`fixed inset-y-0 right-0 w-[50%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
          ${isAgreementModalOpen ? "translate-x-0" : "translate-x-full"} 
          z-50 overflow-y-auto p-8`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Download Data</h2>
          <button
        onClick={() => setIsAgreementModalOpen(false)}
        className="text-gray-600 hover:text-gray-900"
          >
        <Cross2Icon />
          </button>
        </div>
        <div>
            <p className="font-semibold">Requested Variables:</p>
            {userPermissions && (
              <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {userPermissions.flatMap((perm, index) => {
              if (
                perm.status === "approved" &&
                perm.requested_variables &&
                perm.requested_variables.length > 0
              ) {
                return perm.requested_variables.map((variable) => (
            <div
              key={`${index}-${variable}`}
              className="bg-gray-100 text-[10px] text-gray-800 p-2 rounded-lg shadow-sm"
            >
              {variable}
            </div>
                ));
              } else if (
                perm.status === "approved" &&
                (!perm.requested_variables ||
            perm?.requested_variables.length === 0)
              ) {
                return [
            <div
              key={`${index}-no-variables`}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-600 mb-[5px]">
                {
                  "No variables selected. This must be an old request. As per the new data sharing policy, kindly revoke this request so you can make a new request with the updated policy."
                }
              </p>
              <button
                onClick={(e: any) => {
                  e.preventDefault();
                  deletePermissionFn({
              permissionId: perm.id,
                  });
                }}
                className="w-full bg-[#00B9F1] text-white py-3 rounded-lg hover:bg-[#0090bd] transition-colors"
              >
                {deletePending ? <DotsLoader /> : "Revoke Request"}
              </button>
            </div>,
                ];
              }
              return [];
            })}
          </div>
              </div>
            )}
        </div>
       

        <ConfidentialityAgreement
          handleAgreedCallBack={(agreed: boolean) => {
        if (agreed) setIsAgreedToConfidentiality(true);
          }}
        />

        <DataSharingAgreement
          handleAgreedCallBack={(agreed: boolean) => {
        if (agreed) setIsAgreedToDataSharing(true);
          }}
        />
        {downloadPending && (
          <div className="text-white my-2 flex items-center justify-self-center justify-center bg-[#000] 0 w-[90%] h-[1.5rem] p-4 rounded-sm">
        {" "}
        Processing data{" "}
          </div>
        )}
        {userPermissions &&
          userPermissions.some((perm) => perm.status === "approved") && (
        <button
          onClick={handleDwn}
          className="w-full bg-[#00B9F1] text-white py-3 rounded-lg hover:bg-[#0090bd] transition-colors"
        >
          {downloadPending ? <DotsLoader /> : "Download"}
        </button>
          )}
      </div>

    </main>
  );
}
