import { useQuery } from "@tanstack/react-query";
import api from "./../axios";
import { DatasheetData, DatasheetCreatePayload, DatasheetReplacePayload } from "@/types/datasheet";

/**
 * Hook to fetch the datasheet template
 */
export const useDatasheetTemplate = () => {
  return useQuery<any, Error, { data: any }>({
    queryFn: () => api.get("/dataset_datasheets/template"),
    queryKey: ["dataset_datasheet_template"],
    meta: {
      errorMessage: "Failed to fetch datasheet template",
    },
  });
};

/**
 * Hook to fetch a dataset's datasheet
 */
export const useDatasetDatasheet = (datasetId: string, enabled: boolean = true) => {
  return useQuery<any, any, { data: DatasheetData }>({
    queryFn: () => api.get(`/dataset_datasheets/${datasetId}`),
    queryKey: ["dataset_datasheet", datasetId],
    enabled: enabled && !!datasetId && datasetId.trim() !== "",
    retry: (_, error) => error?.response?.status !== 404,
  });
};

/**
 * Create a new datasheet for a dataset
 */
export const createDatasetDatasheet = async (payload: DatasheetCreatePayload) => {
  const response = await api.post(`/dataset_datasheets`, {
    dataset_id: payload.dataset_id,
    content: payload.content,
  });
  return response.data;
};

/**
 * Replace/update an existing datasheet
 */
export const updateDatasetDatasheet = async (
  datasetId: string,
  payload: DatasheetReplacePayload
) => {
  const response = await api.put(`/dataset_datasheets/${datasetId}`, {
    content: payload.content,
  });
  return response.data;
};

/**
 * Delete a dataset's datasheet
 */
export const deleteDatasetDatasheet = async (datasetId: string) => {
  const response = await api.delete(`/dataset_datasheets/${datasetId}`);
  return response.data;
};

/**
 * Download datasheet as markdown
 */
export const downloadDatasheetMarkdown = async (datasetId: string) => {
  const response = await api.get(`/dataset_datasheets/${datasetId}`, {
    headers: {
      Accept: "text/markdown",
    },
    responseType: "blob",
  });
  return response.data;
};
