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
} from "@/lib/hooks/useDataSets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";
import { Modal } from "../modal";
import ConfidentialityAgreement from "../confidentialityAgreement";
import { Cross2Icon } from "@radix-ui/react-icons";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface VariableInfo {
  type: string;
  description: string;
}

interface DataSet {
  id: string;
  name: string;
  title: string;
  db_name: string;
  size: string;
  version: string;
  data_format: string;
  data_capture_method: string;
  description: string | null;
  countries: string;
  category: string;

  start_date: string;
  end_date: string;
  source: string;
  study_design: string;
  project_type: string;
  project_status: string;
  protocol_id: string;
  country_protocol_id: string;
  thematic_area: string;
  main_project_name: string;
  type: string;
  citation_info: string;
  additional_notes: string;

  in_warehouse: boolean;
  created_at: Date;
  entries_count: string;
  acronym: string;
  amr_category: string;
}

interface UserPermission {
  user_id: string;
  id: string;
  data_set_id: string;
  resource: string;
  status: string;
  created_at: Date;
  re_request_count: number;
  downloads_count: number;
  last_update: Date;
}

interface Response {
  data_set: DataSet;
  is_super_admin: boolean;
  user_permission: UserPermission | null; // Can be null if the user has no permissions
}

export default function DatasetDetails({ id }: any) {
  const { data, isLoading, isSuccess, error, refetch } = useGetDataSet(id);
  const dataset: Response = data?.data || {};
  const userPermission = dataset.user_permission;
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
      dataset?.data_set?.category.toLocaleLowerCase().includes("economic")
      ? "economic"
      : !dataset?.data_set
      ? ""
      : !dataset?.data_set.in_warehouse
      ? ""
      : dataset.data_set.thematic_area
  );
  const [isAgreedToConfidentiality, setIsAgreedToConfidentiality] =
    useState(false);
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
    (userPermission?.status === "approved" && dataset.data_set.in_warehouse) ||
    dataset.is_super_admin;
  const canRequestAccess = !userPermission;
  const showDownloadButton = dataset?.data_set?.in_warehouse;

  const permissionStatus = userPermission?.status || "none";
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
  } = useMutation<any, Error, { source: string; selectedVariables: string[] }>({
    mutationFn: ({ source, selectedVariables }) =>
      downloadData(source, selectedVariables),
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
  function daysCalculator(lastUpdate: Date | null) {
    if (!lastUpdate) {
      return "Not defined";
    }
    const today = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    const differenceInMilliseconds = today.getTime() - lastUpdateDate.getTime();
    // Convert the difference to days
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    // Return true if the difference is less than 14 days
    const difference = 14 - differenceInDays;
    return difference < 0 ? 0 : difference;
  }

  const handleReRequest = async () => {
    if (userPermission && !validRe_request(userPermission.last_update)) {
      await reRequestAccess(userPermission.id);
    }
  };
  const handleRequest = async (e: any) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
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
    if (
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
      };
      requestFn({ ...data, data_set_id: dataset.data_set.id });
      setIsModalOpen(false);
    } else {
      toast.error("Please fill in all fields before submitting.");
    }
  };

  useEffect(() => {
    if (downloadedData && isDownloadSuccess) {
      if (downloadedData instanceof Blob) {
        FileSaver.saveAs(downloadedData, "data.csv");
        setIsAgreementModalOpen(false);
      } else {
        toast.error("Downloaded data is not a valid file");
      }
      toast.success("Downloaded successfully");
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
      setIsModalOpen(false);
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
    if (dictionaryData?.data?.data) {
      setSelectedVariables(Object.keys(dictionaryData.data.data));
    }
  }, [dictionaryData]);

  useEffect(() => {
    if (isSuccess && dataset) {
      getDictionary();
    }
  }, [isSuccess]);

  const handleDwn = async () => {
    if (selectedVariables.length < 1) {
      toast.error("You need to select at least 1 variable do download");
      return;
    }
    if (isAgreedToConfidentiality) {
      await downloadFn({ source: dataset.data_set.db_name, selectedVariables });
    } else {
      toast.error(
        "Please agree to the confidentiality agreement before downloading the data"
      );
    }
  };

  return (
    <main className="min-h-screen flex-col w-full flex items-start bg-gray-50">
      {isLoading && (
        <div className="text-center  mt-[1rem] w-full flex items-start h-[4rem] justify-center text-gray-500">
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="text-center w-full mt-[1rem] flex items-start justify-center text-gray-500">
          Failed to fetch the Data, Please refresh the page
        </div>
      )}

      {data && !error && !isLoading && (
        <div className="min-h-screen w-[100%] ">
          <div className=" mx-auto px-4 w-[95%] sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb and Actions */}
            {permissionStatus === "requested" && (
              <div className="flex flex-col ">
                <div className="bg-yellow-100  p-[5px] text-gray-900 mb-[2rem]">
                  Your request should be responded to with in the next 14 days.
                  If not you will be eligible to re-request.
                  {userPermission &&
                    `You have ${
                      userPermission.last_update
                        ? daysCalculator(userPermission.last_update)
                        : daysCalculator(userPermission.created_at)
                    } days left to re-request if not responded to`}
                </div>
                {userPermission &&
                  !validRe_request(
                    userPermission.last_update
                      ? userPermission.last_update
                      : userPermission.created_at
                  ) && (
                    <button
                      onClick={handleReRequest}
                      className="px-6 py-2 rounded-lg bg-[#00B9F1] text-white hover:bg-[#0090bd] transition-all duration-200 flex items-center justify-center w-[20rem]"
                    >
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
                        {reRequestPending ? (
                          <DotsLoader />
                        ) : (
                          "Re-request Access"
                        )}
                      </>
                    </button>
                  )}
                {reRequestError && (
                  <div className="text-red-600 text-[11px]">
                    Failed to send a new request, please be sure you are in a
                    valid date range before you try again.
                  </div>
                )}
              </div>
            )}
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

              <div className="flex flex-wrap gap-3">
                {!showDownloadButton && (
                  <div className="text-red-700 text-[14px]">
                    {" "}
                    This dataset is not available for download yet{" "}
                  </div>
                )}
                {showDownloadButton && (
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
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

            <h1 className="text-3xl font-bold text-[#24408E] mb-8">
              {dataset.data_set.name}
            </h1>

            <div className="flex flex-col  lg:flex-row gap-8">
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
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Category
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Thematic area
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.thematic_area}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              AMR Category
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.amr_category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Status
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.project_status}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Size
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Entries
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.entries_count
                                ? dataset.data_set.entries_count
                                : "UNK"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Study Design
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.study_design}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Countries
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.countries}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Timeline
                            </p>
                            <p className="mt-1 text-gray-900">
                              {formatDate(dataset.data_set.start_date)} -{" "}
                              {formatDate(dataset.data_set.end_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Export Data Format
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.data_format}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Source
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.source}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Data capture method
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.data_capture_method}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Main Project Name (if any)
                            </p>
                            <p className="mt-1 text-gray-900">
                              {dataset.data_set.main_project_name
                                ? dataset.data_set.main_project_name
                                : "N/A"}
                            </p>
                          </div>
                        </div>
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
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Protocol ID
                      </p>
                      <p className="mt-1 text-gray-900">
                        {dataset.data_set.protocol_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Citations
                      </p>
                      <p className="mt-1 text-gray-900">
                        {dataset.data_set.citation_info}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Country Protocol ID
                      </p>
                      <p className="mt-1 text-gray-900">
                        {dataset.data_set.country_protocol_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Number downloads
                      </p>
                      <p className="mt-1 text-gray-900">
                        {userPermission?.downloads_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Number Re-requests sent
                      </p>
                      <p className="mt-1 text-gray-900">
                        {userPermission?.re_request_count}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {dataset.data_set.in_warehouse && (
              <div className="p-4">
                <h2 className="text-2xl font-semibold text-[#003366] mb-4">
                  Data Download Variables
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dictionaryDataLoading && <DotsLoader />}
                  {dictionaryDataError && (
                    <p className="text-red-600">
                      Failed to fetch data dictionary please refresh
                    </p>
                  )}
                  {!dictionaryData?.data?.data && isSuccess && (
                    <p className="text-red-600">
                      Variables not available
                    </p>
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

      <div
        className={`fixed inset-y-0 right-0 w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
          ${isModalOpen ? "translate-x-0" : "translate-x-full"} 
          z-50 overflow-y-auto p-8`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request Access</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Cross2Icon />
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
        <h2 className="text-2xl font-bold text-gray-900">
          Select variables to download
        </h2>

        {
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            if (agreed) setIsAgreedToConfidentiality(true);
          }}
        />

        <button
          onClick={handleDwn}
          className="w-full bg-[#00B9F1] text-white py-3 rounded-lg hover:bg-[#0090bd] transition-colors"
        >
          {downloadPending ? <DotsLoader /> : "Download"}
        </button>
      </div>
    </main>
  );
}
