import { useQuery } from "@tanstack/react-query";
import api from "./../axios";
import { DataCard, DatasetType } from "@/types/constants";
import { normalizeDatasetCardSlug } from "../datasetCardLinks";
import { useGetCatalogue } from "./useCatalogue";

type DatasetListItem = Pick<DatasetType, "id" | "name">;

export const useDatasetCard = (datasetIdentifier: string) => {
  const { data: catalogueData, error: catalogueError, isLoading: isCatalogueLoading } =
    useGetCatalogue();
  const datasets = (catalogueData?.data || []) as DatasetListItem[];
  const normalizedIdentifier = normalizeDatasetCardSlug(datasetIdentifier);

  const matchedDataset = datasets.find(
    (dataset) =>
      dataset.id === datasetIdentifier ||
      normalizeDatasetCardSlug(dataset.name) === normalizedIdentifier
  );

  const resolvedDatasetId = matchedDataset?.id || datasetIdentifier;

  return useQuery<DataCard, Error>({
    queryFn: async () => {
      const response = await api.get(`/data_cards/${resolvedDatasetId}`);
      return response.data;
    },
    queryKey: ["dataset-card", datasetIdentifier, resolvedDatasetId],
    enabled: !!datasetIdentifier && (!isCatalogueLoading || !!catalogueError),
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
