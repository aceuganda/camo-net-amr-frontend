import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "./../axios";
import { DataCard } from "@/types/constants";
import { normalizeDatasetCardSlug } from "../datasetCardLinks";

export const useDatasetCard = (datasetIdentifier: string) => {
  return useQuery<DataCard, Error>({
    queryFn: async () => {
      try {
        const response = await api.get(`/data_cards/${datasetIdentifier}`);
        return response.data;
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          throw error;
        }

        const datasetsResponse = await api.get("/data_sets");
        const matchedDataset = datasetsResponse.data.find((dataset: { id: string; name: string }) =>
          normalizeDatasetCardSlug(dataset.name) ===
          normalizeDatasetCardSlug(datasetIdentifier)
        );

        if (!matchedDataset) {
          throw error;
        }

        const response = await api.get(`/data_cards/${matchedDataset.id}`);
        return response.data;
      }
    },
    queryKey: ["dataset-card", datasetIdentifier],
    enabled: !!datasetIdentifier,
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
