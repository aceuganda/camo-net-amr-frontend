import { DataCard } from "@/types/constants";

type DatasetCardLinkable = Pick<DataCard, "id" | "name">;

export const normalizeDatasetCardSlug = (value: string) =>
  decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getDatasetCardSlug = (dataset: DatasetCardLinkable) =>
  normalizeDatasetCardSlug(dataset.name);

export const getDatasetCardPath = (dataset: DatasetCardLinkable) =>
  `/datasets/card/${getDatasetCardSlug(dataset)}`;
