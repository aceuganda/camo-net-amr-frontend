import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const downloadData = async (source: string, selectedVariables: string[]) => {
  let endpoint = `/data/download?source=${source}`;
  if (source === "economic") {
    endpoint = `/data/download/economic`;
  }

  const response = await api.post(endpoint, {
    selected_variables: selectedVariables,
  }, {
    headers: {
      "Content-Type": "application/json",
    },
    responseType: "blob", 
  });

  return response.data;
};

export const useDatasetVariables = (source:string) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/data/amr/dictionary?source=${source}`),
    queryKey: ["amr_dictionary", source],
    meta: {
      errorMessage: "Failed to fetch dictionary"
    }
  });
}


export const requestAccess = async (data: any) => {
  const response = await api.post("/permissions/request", data);
  return response.data;
};


export const ReRequestAccess = async (permission_id: string) => {
  const response = await api.patch(`/permissions/${permission_id}/re_request`);
  return response.data;
};


