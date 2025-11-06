import { useQuery } from "@tanstack/react-query";
import api from "./../axios";
import { DataCard } from "@/types/constants";

export const useDatasetCard = (datasetId: string) => {
  return useQuery<DataCard, Error>({
    queryFn: async () => {
      const response = await api.get(`/data_cards/${datasetId}`);
      return response.data;
    },
    queryKey: ["dataset-card", datasetId],
    enabled: !!datasetId,
    meta: {
      errorMessage: "Failed to fetch dataset card"
    }
  });
};

export const useAllDatasets = () => {
  return useQuery<string[], Error>({
    queryFn: async () => {
      const response = await api.get('/data_sets');
      return response.data.map((dataset: any) => dataset.id);
    },
    queryKey: ["all-datasets"],
    meta: {
      errorMessage: "Failed to fetch datasets"
    }
  });
};

export const useDatasetCards = (datasetIds: string[]) => {
  return useQuery<DataCard[], Error>({
    queryFn: async () => {
      const cardsPromises = datasetIds.map((id: string) => 
        api.get(`/data_cards/${id}`)
      );
      const cardsResponses = await Promise.all(cardsPromises);
      return cardsResponses.map(res => res.data);
    },
    queryKey: ["dataset-cards", datasetIds],
    enabled: datasetIds.length > 0,
    meta: {
      errorMessage: "Failed to fetch dataset cards"
    }
  });
};
