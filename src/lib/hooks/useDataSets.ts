import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const downloadData = async (source: string) => {
  let endpoint = `/data/download?source=${source}`;

  if (source === "economic") {
    endpoint = `/data/download/economic`;
  }
  if (source === "amu") {
    endpoint = `/data/download/amu?source=amu`;
  }

  console.log("Downloading from endpoint:", endpoint);
  console.log("Source:", source);

  try {
    const response = await api.post(endpoint, {}, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob",
    });

    console.log("Download response:", response);
    console.log("Response data type:", typeof response.data);
    console.log("Response data is Blob:", response.data instanceof Blob);

    return response.data;
  } catch (error) {
    console.error("Download error in useDataSets:", error);
    throw error;
  }
};

export const useDatasetVariables = (source: string) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/data/amr/dictionary?source=${source}`),
    queryKey: ["amr_dictionary", source],
    enabled: !!source && source.trim() !== "", // Only run if source is provided and not empty
    meta: {
      errorMessage: "Failed to fetch dictionary"
    }
  });
}


export const requestAccess = async (data: any) => {
  const response = await api.post("/permissions/request", data);
  return response.data;
};

export const deletePermission = async (permissionId: any) => {
  const response = await api.delete(`/permissions/${permissionId}/delete`);
  return response.data;
};


export const ReRequestAccess = async (permission_id: string) => {
  const response = await api.patch(`/permissions/${permission_id}/re_request`);
  return response.data;
};


