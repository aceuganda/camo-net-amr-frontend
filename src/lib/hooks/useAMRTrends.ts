import {  useQuery } from '@tanstack/react-query';
import api from './../axios';



export const useMapRegionalResistance = (year: number|null) => {
 let endpoint = `/trends/regional_resistance`;
  if (year) {
    endpoint += `?year=${year}`;
  }
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(endpoint),
    queryKey: ["regional_resistance", year],
    meta: {
      errorMessage: "Failed to fetch regional resistance data",
    }
  });
}

export const useOverAllResistance = () => {
    let endpoint = `/trends/general_resistance`;
     return useQuery<any, Error, {data: any}>({
       queryFn: () => api.get(endpoint),
       queryKey: ["general_resistance"],
       meta: {
         errorMessage: "Failed to fetch  resistance data",
       }
     });
   }