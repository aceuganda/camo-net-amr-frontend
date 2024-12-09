import { useQuery } from "@tanstack/react-query";
import api from './../axios';


export const useGetExternalDatasets = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/external_data_sets'),
    queryKey: ["external_data_sets"],
    meta: {
      errorMessage: "Failed to fetch external datasets"
    }
  });
}

export const submitExternalDataset= async (data: any) => {
    const response = await api.post(`/external_data_sets`,data);
    return response.data; 
  };
