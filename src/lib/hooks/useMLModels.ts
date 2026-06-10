import { useQuery } from "@tanstack/react-query";
import api from '../axios';
import { useMutation } from "@tanstack/react-query";
import { ModelPayload } from "@/types/constants";

// modal_url values aren't uniform — legacy records contain a slash
// (e.g. "ml_models/los_model.pkl"), so the path segment must be encoded.
const encodeModelPath = (modelPath: string) => encodeURIComponent(modelPath);

export const useGetAllModels = (skip = 0, limit = 100) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/ml_models?skip=${skip}&limit=${limit}`),
    queryKey: ["all_ml_models", skip, limit],
    meta: {
      errorMessage: "Failed to fetch models"
    }
  });
}

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
    queryFn: () => api.get(`/ml_models/${encodeModelPath(modelPath)}/variables`),
    queryKey: ["dataset_model_variables", modelPath],
    enabled: !!modelPath && p0.enabled,
    meta: {
      errorMessage: "Failed to fetch dataset variables"
    }
  });
}


export const inferModel = async (modelPath: string, payload: any) => {
  const response = await api.post(`/ml_models/${encodeModelPath(modelPath)}/inference`, payload);
  return response.data;
};

// Admin only
export const createModel = async (payload: ModelPayload) => {
  const response = await api.post(`/ml_models`, payload);
  return response.data;
};

// Admin only
export const updateModel = async ({ id, ...payload }: Partial<ModelPayload> & { id: string }) => {
  const response = await api.patch(`/ml_models/${id}`, payload);
  return response.data;
};
