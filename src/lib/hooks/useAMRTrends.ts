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
   export const useOverAllResistanceByGender = (organism:string) => {
    let endpoint = `/trends/gender_resistance?organism=${organism}`;
     return useQuery<any, Error, {data: any}>({
       queryFn: () => api.get(endpoint),
       queryKey: ["gender_resistance",organism],
       meta: {
         errorMessage: "Failed to fetch resistance data",
       }
     });
   }

   export const useOrganismResistance = (
    organism: string, 
    startDate: string | null = null, 
    endDate: string | null = null
  ) => {
    let endpoint = `/trends/organism_resistance?organism=${organism}`;
    
    if (startDate) endpoint += `&start_date=${startDate}`;
    if (endDate) endpoint += `&end_date=${endDate}`;
  
    return useQuery<any, Error, { data: any }>({
      queryFn: () => api.get(endpoint),
      queryKey: ["organism_resistance", organism, startDate, endDate],
      meta: {
        errorMessage: "Failed to fetch organism resistance data",
      },
    });
  };

  export const useOrganismResistanceByAge = (
    organism: string, 
    startDate: string | null = null, 
    endDate: string | null = null
  ) => {
    let endpoint = `/trends/organism_resistance_by_age?organism=${organism}`;
    
    if (startDate) endpoint += `&start_date=${startDate}`;
    if (endDate) endpoint += `&end_date=${endDate}`;
  
    return useQuery<any, Error, { data: any }>({
      queryFn: () => api.get(endpoint),
      queryKey: ["organism_resistance_by_age", organism, startDate, endDate],
      meta: {
        errorMessage: "Failed to fetch organism resistance data",
      },
    });
  };
  