import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../axios";

/**
 * Lakehouse catalog metadata, served through the backend rather than by talking
 * to Trino directly - Trino stays internal and is never exposed to the browser.
 * Every endpoint below is super-admin only on the server.
 */

export interface LakehouseHealth {
  status: string;
  connection: {
    host: string;
    port: string;
    user: string;
    http_scheme: string;
    default_catalog: string;
    default_schema: string;
  };
  exposed_catalogs: string[];
  /** Catalogs the API is configured for but the coordinator does not report. */
  configured_but_missing: string[];
  default_catalog: string;
}

export interface LakehouseCatalogs {
  catalogs: string[];
}

export interface LakehouseSchemaSummary {
  schema: string;
  table_count: number;
  tables: string[];
  /** Non-null when one schema fails to list; the rest of the tree still renders. */
  error: string | null;
}

export interface LakehouseOverview {
  catalog: string;
  schema_count: number;
  schemas: LakehouseSchemaSummary[];
}

export interface LakehouseColumn {
  name: string;
  type: string;
  extra: string;
  comment: string;
}

export interface LakehouseTableColumns {
  catalog: string;
  schema: string;
  table: string;
  column_count: number;
  columns: LakehouseColumn[];
}

export const useLakehouseHealth = (enabled = true) =>
  useQuery<any, Error, { data: LakehouseHealth }>({
    queryKey: ["lakehouse_health"],
    queryFn: () => api.get("/lakehouse/health"),
    enabled,
    retry: false,
    meta: {
      errorMessage: "Failed to reach the lakehouse query engine",
    },
  });

export const useLakehouseCatalogs = (enabled = true) =>
  useQuery<any, Error, { data: LakehouseCatalogs }>({
    queryKey: ["lakehouse_catalogs"],
    queryFn: () => api.get("/lakehouse/catalogs"),
    enabled,
    meta: {
      errorMessage: "Failed to fetch lakehouse catalogs",
    },
  });

/** One call returns the whole catalog -> schema -> table tree. */
export const useLakehouseOverview = (catalog: string | null, enabled = true) =>
  useQuery<any, Error, { data: LakehouseOverview }>({
    queryKey: ["lakehouse_overview", catalog],
    queryFn: () =>
      api.get(`/lakehouse/catalogs/${encodeURIComponent(catalog as string)}/overview`),
    enabled: enabled && Boolean(catalog),
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch catalog contents",
    },
  });

export const useLakehouseTableColumns = (
  catalog: string | null,
  schema: string | null,
  table: string | null,
  enabled = true
) =>
  useQuery<any, Error, { data: LakehouseTableColumns }>({
    queryKey: ["lakehouse_columns", catalog, schema, table],
    queryFn: () =>
      api.get(
        `/lakehouse/catalogs/${encodeURIComponent(
          catalog as string
        )}/schemas/${encodeURIComponent(
          schema as string
        )}/tables/${encodeURIComponent(table as string)}/columns`
      ),
    enabled: enabled && Boolean(catalog && schema && table),
    meta: {
      errorMessage: "Failed to fetch table columns",
    },
  });

/* ------------------------------------------------------------------------ *
 * Flat export tables
 *
 * A flat is a precomputed table carrying every variable a dataset's CSV export
 * can produce, so downloads read one table instead of re-running a large join.
 * Most datasets are one flat; economic is eight, one per section of its
 * multi-section CSV.
 *
 * Variable documentation lives as column comments on the flat itself, so
 * uploading a document needs the flat to exist first - the API answers 409
 * saying so.
 * ------------------------------------------------------------------------ */

export type FlatShape = "long" | "wide";

export interface LakehouseFlat {
  table: string;
  dataset: string | null;
  template: string | null;
  column_count: number;
  row_count: number | null;
  built_at: string | null;
  built_by: string | null;
}

export interface LakehouseFlats {
  catalog: string;
  schema: string;
  flat_count: number;
  flats: LakehouseFlat[];
}

export interface FlatColumn {
  name: string;
  sql_type: string;
  /** Export/display name. Falls back to the column name. */
  label: string;
  type: string | null;
  description: string | null;
}

export interface LakehouseFlatDetail extends LakehouseFlat {
  catalog: string;
  schema: string;
  documented_count: number;
  columns: FlatColumn[];
}

export interface LakehouseDataset {
  slug: string;
  dataset: string;
  variable_count: number;
  flat_tables: string[];
  flat_count: number;
  built_count: number;
  has_flat: boolean;
  documented_count: number;
}

export interface LakehouseDatasets {
  datasets: LakehouseDataset[];
}

export interface DatasetVariable {
  label?: string;
  type?: string | null;
  description?: string | null;
}

export interface DatasetVariables {
  slug: string;
  dataset: string;
  flat_tables: string[];
  built_tables: string[];
  has_flat: boolean;
  /** Whether the text shown comes from the flat or the built-in constants. */
  source: string;
  variable_count: number;
  variables: Record<string, DatasetVariable>;
}

export const useLakehouseFlats = (enabled = true) =>
  useQuery<any, Error, { data: LakehouseFlats }>({
    queryKey: ["lakehouse_flats"],
    queryFn: () => api.get("/lakehouse/flats"),
    enabled,
    meta: {
      errorMessage: "Failed to fetch flat export tables",
    },
  });

export const useLakehouseFlat = (table: string | null, enabled = true) =>
  useQuery<any, Error, { data: LakehouseFlatDetail }>({
    queryKey: ["lakehouse_flat", table],
    queryFn: () =>
      api.get(`/lakehouse/flats/table/${encodeURIComponent(table as string)}`),
    enabled: enabled && Boolean(table),
    meta: {
      errorMessage: "Failed to fetch flat table details",
    },
  });

export const useLakehouseDatasets = (enabled = true) =>
  useQuery<any, Error, { data: LakehouseDatasets }>({
    queryKey: ["lakehouse_datasets"],
    queryFn: () => api.get("/lakehouse/datasets"),
    enabled,
    meta: {
      errorMessage: "Failed to fetch downloadable datasets",
    },
  });

export const useDatasetVariables = (slug: string | null, enabled = true) =>
  useQuery<any, Error, { data: DatasetVariables }>({
    queryKey: ["lakehouse_dataset_variables", slug],
    queryFn: () =>
      api.get(
        `/lakehouse/datasets/${encodeURIComponent(slug as string)}/variables`
      ),
    enabled: enabled && Boolean(slug),
    meta: {
      errorMessage: "Failed to fetch dataset variables",
    },
  });

// Super admin only ---------------------------------------------------------

/**
 * Build a dataset's flats, replacing any that exist. A wide build first
 * measures how many times each repeating record occurs within a visit, so it
 * takes longer than a long one and its column count depends on the data.
 */
export const buildFlat = async (slug: string, shape: FlatShape = "long") => {
  const response = await api.post(
    `/lakehouse/flats/${encodeURIComponent(slug)}?shape=${shape}`
  );
  return response.data;
};

/** Rebuild from source. Documentation on the existing flat is carried over. */
export const refreshFlat = async (slug: string, shape: FlatShape = "long") => {
  const response = await api.post(
    `/lakehouse/flats/${encodeURIComponent(slug)}/refresh?shape=${shape}`
  );
  return response.data;
};

export const dropFlat = async (table: string) => {
  const response = await api.delete(
    `/lakehouse/flats/table/${encodeURIComponent(table)}`
  );
  return response.data;
};

/** Write a variable document onto the dataset's flats as column comments. */
export const uploadDatasetVariables = async (slug: string, payload: unknown) => {
  const response = await api.put(
    `/lakehouse/datasets/${encodeURIComponent(slug)}/variables`,
    payload
  );
  return response.data;
};

/** Same, from a picked .json file. */
export const uploadDatasetVariablesFile = async (slug: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post(
    `/lakehouse/datasets/${encodeURIComponent(slug)}/variables/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/** Discard uploaded text and rewrite comments from the built-in constants. */
export const resetDatasetVariables = async (slug: string) => {
  const response = await api.delete(
    `/lakehouse/datasets/${encodeURIComponent(slug)}/variables`
  );
  return response.data;
};
