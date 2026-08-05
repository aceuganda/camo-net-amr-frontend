import {  useQueries, useQuery } from '@tanstack/react-query';
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

/**
 * The regional_resistance endpoint only accepts a single `year` (range params
 * like start_year/end_year are ignored and silently fall back to "overall"), so
 * a year range is assembled client-side: one cached request per year, summed
 * per facility.
 */
export const useMapRegionalResistanceRange = (
  startYear: number,
  endYear: number,
  organism: string,
  antibiotic: string,
  coversAllYears = false
) => {
  const from = Math.min(startYear, endYear);
  const to = Math.max(startYear, endYear);
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  const base = `/trends/regional_resistance?antibiotic=${antibiotic}&organism=${organism}`;

  // When the range spans every collection year, the unfiltered endpoint is both
  // one request instead of N and the only way to include records that carry no
  // collection year at all.
  const requests: (number | null)[] = coversAllYears ? [null] : years;

  const results = useQueries({
    queries: requests.map((year) => ({
      queryKey: ["regional_resistance", year, organism, antibiotic],
      queryFn: () => api.get(year === null ? base : `${base}&year=${year}`),
      meta: {
        errorMessage: "Failed to fetch regional resistance data",
      },
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error)?.error ?? null;
  const isSuccess = results.length > 0 && results.every((result) => result.isSuccess);

  // Sum resistant cases per facility across every year in the range
  const facilityTotals: Record<string, number> = {};
  if (isSuccess) {
    results.forEach((result) => {
      const facilities = (result.data as any)?.data?.data ?? [];
      facilities.forEach((facility: { facility_name: string; resistant_cases: number }) => {
        const name = facility.facility_name.trim();
        facilityTotals[name] = (facilityTotals[name] ?? 0) + (facility.resistant_cases ?? 0);
      });
    });
  }

  return { facilityTotals, isLoading, error, isSuccess, years };
};

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
  