import { useQuery } from "@tanstack/react-query";
import api from '../axios';
import { useMutation } from "@tanstack/react-query";



export const useGetModels = (datasetId: string) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/data_sets/${datasetId}/ml_models`),
    queryKey: ["dataset_ml_models", datasetId],
    meta: {
      errorMessage: "Failed to fetch dataset models"
    }
  });
}

export const useGetModelVariables = (modelPath: string, p0: { enabled: boolean; }) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/ml_models/${modelPath}/input_variables`),
    queryKey: ["dataset_model_variables", modelPath],
    meta: {
      errorMessage: "Failed to fetch dataset variables"
    }
  });
}


export const inferModel = async (modelPath: string, payload: any) => {
  const response = await api.post(`/ml_models/${modelPath}/inference`, payload);
  return response.data;
};