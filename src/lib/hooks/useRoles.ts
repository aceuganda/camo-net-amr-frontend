import { useQuery } from "@tanstack/react-query";
import api from './../axios';


export const useGetRoles = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/data_sets'),
    queryKey: ["data_sets"],
    meta: {
      errorMessage: "Failed to fetch datasets"
    }
  });
}