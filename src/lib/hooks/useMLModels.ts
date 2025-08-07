import { useQuery } from "@tanstack/react-query";
import api from '../axios';
import { useMutation } from "@tanstack/react-query";



export const useGetModelsVariables = (datasetId: string) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/ml_models/${datasetId}/input_variables`),
    queryKey: ["dataset_ml_models", datasetId],
    meta: {
      errorMessage: "Failed to fetch dataset models"
    }
  });
}


export const useInferModel = (modelPath: string) => {
  return useMutation<any, Error, any>({
    mutationFn: (payload: any) => api.post(`/ml_models/${modelPath}/inference`, payload),
    meta: {
      errorMessage: "Failed to infer model"
    }
  });
}