import {  useQuery } from '@tanstack/react-query';
import api from './../axios';



export const useMapRegionalResistance = (year: number|null, organism: string, antibiotic: string) => {
 let endpoint = `/trends/regional_resistance?antibiotic=${antibiotic}&organism=${organism}`;
  if (year) {
    endpoint += `&year=${year}`;
  }
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(endpoint),
    queryKey: ["regional_resistance", year, organism, antibiotic],
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
    antibiotic: string | null = null,
    startDate: string | null = null,
    endDate: string | null = null
  ) => {
    let endpoint = `/trends/organism_resistance`;

    const params = [];
    if (antibiotic) params.push(`antibiotic=${antibiotic}`);
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return useQuery<any, Error, { data: any }>({
      queryFn: () => api.get(endpoint),
      queryKey: ["organism_resistance", antibiotic, startDate, endDate],
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
  