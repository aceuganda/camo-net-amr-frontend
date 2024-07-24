import { useQuery } from "@tanstack/react-query";
import api from './../axios';


export const useGetCatalogue = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/data_sets'),
    queryKey: ["data_sets"],
    meta: {
      errorMessage: "Failed to fetch datasets"
    }
  });
}

export const useGetUserCatalogue = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/user_data_sets'),
    queryKey: ["user_data_sets"],
    meta: {
      errorMessage: "Failed to fetch datasets"
    }
  });
}
