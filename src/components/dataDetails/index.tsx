"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useGetDataSet } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { requestAccess, downloadData } from "@/lib/hooks/useDataSets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FileSaver from "file-saver";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

interface DataSet {
  id: string;
  name: string;
  title: string;
  db_name: string;
  size: string;
  version: string;
  data_use_permissions: string;
  data_storage_medium: string;
  data_format: string;
  data_capture_method: string;
  description: string | null;
  countries: string;
  category: string;
  data_types_collected: string;
  data_types_details: string;
  data_collection_methods: string;
  data_dictionary_available: boolean;
  data_access_method: string;
  access_restrictions: string;
  start_date: string;
  end_date: string;
  study_population: string;
  study_design: string;
  project_type: string;
  project_status: string;
  protocol_id: string;
  country_protocol_id: string;
  grant_code: string;
  thematic_area: string;
  main_project_name: string;
  main_data_type: string;
  principal_investigator: string;
  pi_contact: string;
  pi_email: string;
  project_manager: string;
  pm_contact: string;
  pm_email: string;
  coordinator_name: string;
  coordinator_contact: string;
  coordinator_email: string;
  data_owner: string;
  citation_info: string;
  additional_notes: string;
  license: string;
  in_warehouse: boolean;
  created_at: string;
  on_hold_reason: string;
  participant_count: string;
}

interface UserPermission {
  user_id: string;
  id: string;
  data_set_id: string;
  resource: string;
  status: string;
  created_at: string;
  downloads_count: number;
}

interface Response {
  data_set: DataSet;
  is_super_admin: boolean;
  user_permission: UserPermission | null; // Can be null if the user has no permissions
}

export default function DatasetDetails({ id }: any) {

  const { data, isLoading, error } = useGetDataSet(id);
  const dataset: Response = data?.data || {};
  const userPermission = dataset.user_permission;
  const router = useRouter();


  const canDownload = (userPermission?.status === "approved" && dataset.data_set.in_warehouse) || dataset.is_super_admin;
  const canRequestAccess = !userPermission ;
  const showDownloadButton = dataset?.data_set?.in_warehouse;

  const permissionStatus = userPermission?.status || "none";

  const { data:downloadedData, isSuccess:isDownloadSuccess, error:downloadError, isPending:downloadPending, mutate:downloadFn } = useMutation({
    mutationFn: downloadData,
  });
  const { data:requestData, isSuccess:isRequestSuccess, error:requestError, isPending:requestPending, mutate:requestFn } = useMutation({
    mutationFn: requestAccess,
  });

  const handleDwn = async (e: any) => {
    e.preventDefault();
    downloadFn(dataset.data_set.db_name); 
  };
  const handleRequest = async (e: any) => {
    e.preventDefault();
    requestFn(dataset.data_set.id); 
    
  };

  useEffect(() => {
    if (downloadedData && isDownloadSuccess) {
      if (downloadedData instanceof Blob) {
        FileSaver.saveAs(downloadedData, "data.csv"); 
      } else {
        console.error("Downloaded data is not a valid Blob");
      }
      toast.success("Downloaded successfully");

    }
    if (downloadError) {
      toast.error(
        `Failed to download data set, make sure you have the permission to download this data set`
      );
    }

  }, [downloadedData,isDownloadSuccess,downloadError]);

  useEffect(() => {
    if (requestData && isRequestSuccess) {
      toast.success("Requested successfully");
      window.location.reload();
    }
    if (requestError) {
      toast.error(
        `Failed to request access to this data set`
      );
    }

  }, [ requestData, requestError,isRequestSuccess ]);

  return (
    <main className="min-h-screen flex-col w-full flex items-start ">
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
        <div className="flex mx-auto flex-col sm:flex-row  gap-[1rem] items-start pt-[2rem] ">
          <div className="flex flex-col w-full max-w-6xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600">
                <span className="text-[#00B9F1]">
                  <Link href={"/datasets/access"}>Datasets / </Link>
                </span>
                <span>{dataset.data_set.name}</span>
              </div>
              <div className="flex space-x-4">
              {showDownloadButton && (
                  <button
                    onClick={handleDwn}
                    className={`p-2 sm:min-w-[10rem] flex items-center justify-center min-h-[2.4rem] rounded ${canDownload ? "bg-[#00B9F1] text-white" : "bg-gray-400 text-white cursor-not-allowed"}`}
                    disabled={!canDownload}
                  >
                    {downloadPending ? <DotsLoader/> :"Download"}
                  </button>
                )}
                {canRequestAccess && dataset.data_set.in_warehouse &&(
                  <button onClick={handleRequest} className="p-2   sm:min-w-[10rem] flex items-center justify-center min-h-[2.4rem]  bg-[#00b9f1] text-white rounded hover:bg-[#7ad4ef]">
                    {requestPending ? <DotsLoader/> :"Request Access"}
                  </button>
                )}
                {!canRequestAccess && (
                  <span className={`py-2 px-4 rounded ${permissionStatus === "approved" ? "text-green-500" : permissionStatus === "denied" ? "text-red-500" : "text-yellow-500"}`}>
                    {permissionStatus === "requested" ? "Access Requested" : permissionStatus === "denied" ? "Access Denied" : "Approved"}
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#24408E]">
              {dataset.data_set.name}
            </h1>
            <div className="bg-white p-6 mt-[1rem] min-w-[75vw] shadow-box">
              <h2 className="text-xl font-semibold mb-4">About data</h2>
              <p className="text-gray-700 mb-4">
                {dataset.data_set.description}{" "}
              </p>
              <p className="text-gray-700 mb-4">{dataset.data_set.title} </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p>
                  <strong>Category:</strong> {dataset.data_set.category}
                </p>
                <p>
                  <strong>Size:</strong> {dataset.data_set.size}
                </p>
                <p>
                  <strong>Database Name:</strong> {dataset.data_set.db_name}
                </p>
                <p>
                  <strong>Countries:</strong> {dataset.data_set.countries}
                </p>
                <p>
                  <strong>Type:</strong> {dataset.data_set.data_types_collected}
                </p>
                <p>
                  <strong>Project Status:</strong>{" "}
                  {dataset.data_set.project_status}
                </p>
                <p>
                  <strong>Title:</strong> {dataset.data_set.title}
                </p>
                <p>
                  <strong>Thematic Area:</strong>{" "}
                  {dataset.data_set.thematic_area}
                </p>
                <p>
                  <strong>Study Design:</strong> {dataset.data_set.study_design}
                </p>
                <p>
                  <strong>Data Format:</strong> {dataset.data_set.data_format}
                </p>
                <p>
                  <strong>Study Population:</strong>{" "}
                  {dataset.data_set.study_population}
                </p>
                <p>
                  <strong>In Warehouse:</strong>{" "}
                  {dataset.data_set.in_warehouse ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Start Date:</strong> {dataset.data_set.start_date}
                </p>
                <p>
                  <strong>End Date:</strong> {dataset.data_set.end_date}
                </p>
                <p>
                  <strong>PI Email:</strong> {dataset.data_set.pi_email}
                </p>
                <p>
                  <strong>PI Contact:</strong> {dataset.data_set.pi_contact}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border-t border-b border-[#24408E] min-w-[17rem] mt-[7rem]">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="text-gray-700">
              <p>
                <strong>Version:</strong> {dataset.data_set.version}
              </p>

              <p>
                <strong>License:</strong> {dataset.data_set.license}
              </p>
              <p>
                <strong>Protocol ID:</strong> {dataset.data_set.protocol_id}
              </p>
              <p>
                <strong>Citations:</strong> {dataset.data_set.citation_info}
              </p>
              <p>
                <strong>Country Protocol ID</strong>{" "}
                {dataset.data_set.country_protocol_id}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
