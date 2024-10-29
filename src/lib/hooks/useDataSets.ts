import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const downloadData = async (source: string) => {
  let endpoint = `/data/download?source=${source}`;
  if (source === "economic") {
    endpoint = `/data/download/economic`;
  }

  const response = await api.get(endpoint, {
    responseType: "blob",
  });
  return response.data;
};

export const requestAccess = async (data: any) => {
  const response = await api.post("/permissions/request", data);
  return response.data;
};


export const ReRequestAccess = async (permission_id: string) => {
  const response = await api.patch(`/permissions/${permission_id}/re_request`);
  return response.data;
};
