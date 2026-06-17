"use client";
import { useState, useEffect } from "react";
import { DatasetType } from "@/types/constants";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import { updateCatalogueDataset } from "@/lib/hooks/useCatalogue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDatasetDatasheet,
  createDatasetDatasheet,
  updateDatasetDatasheet,
} from "@/lib/hooks/useDatasheets";
import { DatasheetAdmin } from "@/components/datasheet";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

export interface DatasetDetail {
  [key: string]: string | boolean | null;
}

export default function DatasetsPage() {
  const [datasetDetails, setDatasetDetails] = useState<DatasetType | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"catalog" | "datasheet">("catalog");
  const { data, isLoading, error, refetch } = useGetCatalogue();
  const datasets: DatasetType[] = data?.data || [];

  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    isSuccess: updateSuccess,
    error: updateError,
    isPending: updatePending,
    mutate: updateDataset,
  } = useMutation({
    mutationFn: updateCatalogueDataset,
  });


  useEffect(() => {
     refetch()
     setDatasetDetails(null)
     setActiveTab("catalog")
  },[updateSuccess]);

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearchTerm = dataset.name.toLowerCase().includes(searchTerm);
    return matchesSearchTerm;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const onUpdate = (dataset: any) => {
    updateDataset(dataset);
  };

  return (
    <div className=" mx-auto p-4 flex flex-col overflow-hidden ">
      <div className="bg-white shadow-md w-full rounded">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto ">
          {isLoading && (
            <div className="flex justify-center  w-full">
              <DotsLoader />
            </div>
          )}
          <ul className="flex space-x-4 p-4">
            {filteredDatasets.map((dataset, index) => (
              <li
                key={index}
                onClick={() => {
                  setDatasetDetails(dataset);
                }}
                className="flex-shrink-0 w-64 p-4 border rounded-lg hover:bg-gray-100 cursor-pointer shadow-sm transition-all duration-200 ease-in-out"
              >
                <div className="font-semibold text-lg mb-2">{dataset.name}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {dataset.thematic_area}
                </div>
                <div className="text-sm text-gray-500">
                  Status:
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      dataset.project_status === "Active"
                        ? "bg-green-100 text-green-800"
                        : dataset.project_status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {dataset.project_status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredDatasets.length === 0 && searchTerm && (
          <div className="text-center p-4 text-gray-500">
            No datasets found matching your search
          </div>
        )}
      </div>

      <div className="">
        {datasetDetails && (
          <>
            <div className="bg-white shadow-md rounded mb-4">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`flex-1 px-6 py-3 font-semibold transition-all duration-200 ${
                    activeTab === "catalog"
                      ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
                      : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
                  }`}
                >
                  Dataset Information
                </button>
                <button
                  onClick={() => setActiveTab("datasheet")}
                  className={`flex-1 px-6 py-3 font-semibold transition-all duration-200 ${
                    activeTab === "datasheet"
                      ? "text-[#24408E] border-b-2 border-[#00B9F1] bg-gradient-to-r from-blue-50/50 to-transparent"
                      : "text-gray-600 hover:text-[#24408E] hover:bg-gray-50"
                  }`}
                >
                  Datasheet
                </button>
              </div>
            </div>

            {activeTab === "catalog" && (
              <DatasetDetails
                details={datasetDetails}
                updatePending={updatePending}
                onSave={onUpdate}
              />
            )}

            {activeTab === "datasheet" && (
              <DatasheetAdminSection datasetId={datasetDetails.id} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface DatasetDetailsProps {
  details: DatasetType;
  updatePending: Boolean;
  onSave: (updatedDetails: any) => void;
}
function DatasheetAdminSection({ datasetId }: { datasetId: string }) {
  const queryClient = useQueryClient();
  const { data: datasheetQueryData, isLoading } = useDatasetDatasheet(datasetId, true);
  const datasheet = datasheetQueryData?.data || null;

  const { mutate: saveDatasheet, isPending: isSaving } = useMutation({
    mutationFn: async (datasheetData: any) => {
      if (datasheet) {
        return updateDatasetDatasheet(datasetId, { content: datasheetData.content });
      } else {
        return createDatasetDatasheet({ dataset_id: datasetId, content: datasheetData.content });
      }
    },
    onSuccess: () => {
      toast.success("Datasheet saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["dataset_datasheet", datasetId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to save datasheet");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <DotsLoader />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded p-6">
      <DatasheetAdmin
        datasetId={datasetId}
        existingDatasheet={datasheet}
        onSave={saveDatasheet}
        isSaving={isSaving}
      />
    </div>
  );
}

function DatasetDetails({
  details,
  updatePending,
  onSave,
}: DatasetDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<any>({});

  useEffect(() => {
    setEditedDetails({ ...details });
  }, [details]);

  // Fields to exclude from display
  const excludedFields = ["id"];

  const handleInputChange = (key: string, value: any) => {
    setEditedDetails((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const changedFields: any = {};

    Object.keys(editedDetails).forEach((key: any) => {
      if (excludedFields.includes(key)) return;

      // @ts-ignore
      if (JSON.stringify(editedDetails[key]) !== JSON.stringify(details[key])) {
        if (key === "start_date" || key === "end_date") {
          changedFields[key] = new Date(editedDetails[key]).toISOString();
        } else {
          changedFields[key] = editedDetails[key];
        }
      }
    });

    if (Object.keys(changedFields).length > 0) {
      // include ID
      changedFields["id"] = details.id;
      onSave(changedFields);
    } else {
      toast.message("No field has been edited");
    }

    setIsEditing(false);
  };

  return (
    <div className="rounded bg-white p-4 shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">{details.name}</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded bg-blue-500 px-4 py-2 text-sm text-white sm:text-base"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(details)
          .filter(([key]) => !excludedFields.includes(key))
          .map(([key, value]) => (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.replace(/_/g, " ").toUpperCase()}
              </label>

              {isEditing ? (
                // Editing mode
                key === "start_date" || key === "end_date" ? (
                  <input
                    type="date"
                    value={
                      editedDetails[key]
                        ? new Date(editedDetails[key])
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
                  />
                ) : typeof value === "boolean" ? (
                  <select
                    value={editedDetails[key]?.toString() || "false"}
                    onChange={(e) =>
                      handleInputChange(key, e.target.value === "true")
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editedDetails[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2"
                  />
                )
              ) : (
                // View mode
                <div className="mt-1 block w-full rounded-md border-gray-300 border-[1px] shadow-sm p-2">
                  {key === "start_date" || key === "end_date"
                    ? value
                      ? new Date(value as string).toLocaleDateString()
                      : "N/A"
                    : value?.toString() || "N/A"}
                </div>
              )}
            </div>
          ))}
      </div>

      {isEditing && (
        <div className="mt-4">
          <button
            onClick={handleSave}
            className="mr-2 rounded bg-green-500 px-4 py-2 text-sm text-white sm:text-base"
          >
            {updatePending ? <DotsLoader /> : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
