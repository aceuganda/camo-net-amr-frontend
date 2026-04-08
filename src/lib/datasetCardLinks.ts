type DatasetCardLinkable = {
  id: string;
  name: string;
};

export const normalizeDatasetCardSlug = (value: string) =>
  decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getDatasetCardSlug = (dataset: DatasetCardLinkable) =>
  normalizeDatasetCardSlug(dataset.name);

export const getDatasetCardPath = (dataset: DatasetCardLinkable) =>
  `/datasets/card/${dataset.id}/${getDatasetCardSlug(dataset)}`;
