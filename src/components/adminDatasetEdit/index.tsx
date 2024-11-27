"use client";
import { useState, useEffect } from "react";
import { DatasetType } from "@/types/constants";
import { useGetCatalogue } from "@/lib/hooks/useCatalogue";
import dynamic from "next/dynamic";
import { updateCatalogueDataset } from "@/lib/hooks/useCatalogue";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const DotsLoader = dynamic(() => import("../ui/dotsLoader"), { ssr: false });

export interface DatasetDetail {
  [key: string]: string | boolean | null;
}

export default function DatasetsPage() {
  const [datasetDetails, setDatasetDetails] = useState<DatasetType | null>(
    null
  );
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
          <DatasetDetails
            details={datasetDetails}
            updatePending={updatePending}
            onSave={onUpdate}
          />
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
    <div className="bg-white shadow-md rounded p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{details.name}</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            {updatePending ? <DotsLoader /> : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
