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
  /** The dataset this flat is built from. A many-sheet dataset is many flats. */
  dataset: string | null;
  slug: string | null;
  /** data_sets.id of the catalogue entry, when the dataset has one. */
  dataset_id: string | null;
  /** Section of a multi-section dataset (economic); null for single-flat datasets. */
  section: string | null;
  shape: FlatShape;
  template: string | null;
  column_count: number;
  /** Rows in the flat. In a long patient flat these are records, not people. */
  row_count: number | null;
  /** Distinct patients / visits, counted at build time. Null for flats without those keys. */
  patient_count: number | null;
  visit_count: number | null;
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
  dataset_id: string | null;
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

/* ------------------------------------------------------------------------ *
 * Flat builds
 *
 * Building is a background job: the POST answers 202 with a build record
 * straight away and the page polls it. A wide build measures the data before
 * it can even create the table, so it can run for minutes; the record carries
 * the current step, a weighted percentage and the live Trino query stats.
 * ------------------------------------------------------------------------ */

export type FlatBuildStatus = "queued" | "running" | "succeeded" | "failed";

export interface FlatBuildQueryStats {
  query_id: string | null;
  state: string | null;
  /** Trino's own 0-100 progress for the running statement. */
  progress: number | null;
  processed_rows: number | null;
  written_bytes: number | null;
  elapsed_ms: number | null;
}

export interface FlatBuildDetail {
  table: string | null;
  step: "measure" | "probe" | "create" | "load" | "swap" | null;
  flat_index: number | null;
  flat_count: number | null;
  query: FlatBuildQueryStats | null;
}

export interface FlatBuild {
  /** Stable per slug+shape: a rebuild reuses the record rather than adding one. */
  id: string;
  slug: string;
  dataset: string | null;
  dataset_id: string | null;
  shape: FlatShape;
  status: FlatBuildStatus;
  /** Human-readable current step, e.g. "Loading flat_daring_wide (3 of 8)". */
  phase: string | null;
  percent: number;
  detail: FlatBuildDetail | null;
  /** The build report, present once status is "succeeded". */
  result: any | null;
  error: string | null;
  started_by: string | null;
  started_at: string;
  updated_at: string;
  finished_at: string | null;
}

export const isBuildActive = (build: FlatBuild | null | undefined) =>
  build?.status === "queued" || build?.status === "running";

/** How often an in-flight build is re-read. */
const BUILD_POLL_MS = 2000;

/** Poll one build until it settles; stops refetching once it has. */
export const useFlatBuild = (buildId: string | null) =>
  useQuery<any, Error, { data: FlatBuild }>({
    queryKey: ["lakehouse_flat_build", buildId],
    queryFn: () =>
      api.get(`/lakehouse/flats/builds/${encodeURIComponent(buildId as string)}`),
    enabled: Boolean(buildId),
    refetchInterval: (query) => {
      const build = query.state.data?.data as FlatBuild | undefined;
      return build && !isBuildActive(build) ? false : BUILD_POLL_MS;
    },
    retry: false,
    meta: {
      errorMessage: "Failed to read flat build progress",
    },
  });

/**
 * The most recent build of one flat, whatever its state. Used to attach to a
 * build another session started when a POST is refused with 409.
 */
export const fetchLatestFlatBuild = async (
  slug: string,
  shape: FlatShape
): Promise<FlatBuild> => {
  const response = await api.get(
    `/lakehouse/flats/${encodeURIComponent(slug)}/builds/latest?shape=${shape}`
  );
  return response.data;
};

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

/* ------------------------------------------------------------------------ *
 * Flat preview: the first rows of a flat as the table really holds them.
 * ------------------------------------------------------------------------ */

export interface FlatPreviewColumn extends FlatColumn {}

export interface FlatPreview extends Pick<
  LakehouseFlat,
  | "table"
  | "dataset"
  | "slug"
  | "dataset_id"
  | "section"
  | "shape"
  | "patient_count"
  | "visit_count"
> {
  limit: number;
  /** Total rows in the flat (from the Iceberg snapshot), not the rows returned. */
  row_count: number | null;
  built_at: string | null;
  column_count: number;
  /**
   * Columns the rows are ordered and grouped by, as stored (e.g. patientid,
   * visitid). Empty for a flat without patient/visit keys.
   */
  grain_columns: string[];
  columns: FlatPreviewColumn[];
  /** One array per row, in column order. Decimals arrive as strings. */
  rows: (string | number | boolean | null)[][];
}

export const PREVIEW_LIMITS = [25, 50, 100, 200] as const;
export type PreviewLimit = (typeof PREVIEW_LIMITS)[number];

export const useFlatPreview = (
  table: string | null,
  limit: PreviewLimit = 50,
  enabled = true
) =>
  useQuery<any, Error, { data: FlatPreview }>({
    queryKey: ["lakehouse_flat_preview", table, limit],
    queryFn: () =>
      api.get(
        `/lakehouse/flats/table/${encodeURIComponent(table as string)}/preview?limit=${limit}`
      ),
    enabled: enabled && Boolean(table),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    meta: {
      errorMessage: "Failed to load flat preview",
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
 * Start building a dataset's flats, replacing any that exist. Answers 202 with
 * the build to poll (see useFlatBuild); 409 if one is already running. A wide
 * build first measures how many times each repeating record occurs within a
 * visit, so it takes longer than a long one and its column count depends on
 * the data.
 */
export const buildFlat = async (
  slug: string,
  shape: FlatShape = "long"
): Promise<FlatBuild> => {
  const response = await api.post(
    `/lakehouse/flats/${encodeURIComponent(slug)}?shape=${shape}`
  );
  return response.data;
};

/** Rebuild from source. Documentation on the existing flat is carried over. */
export const refreshFlat = async (
  slug: string,
  shape: FlatShape = "long"
): Promise<FlatBuild> => {
  const response = await api.post(
    `/lakehouse/flats/${encodeURIComponent(slug)}/refresh?shape=${shape}`
  );
  return response.data;
};

// --- Export schema maintenance -----------------------------------------------

export type ExportSchemaStatus = {
  catalog: string;
  schema: string;
  exists: boolean;
  location: string | null;
  expected_location: string | null;
  healthy: boolean;
  problem: string | null;
  ddl: string | null;
  dropped_tables?: string[];
};

/** Where the export schema is stored and whether that matches the config. */
export const useExportSchemaStatus = (enabled = true) =>
  useQuery<any, Error, { data: ExportSchemaStatus }>({
    queryKey: ["lakehouse_export_schema"],
    queryFn: () => api.get("/lakehouse/flats/schema"),
    enabled,
    meta: {
      errorMessage: "Failed to inspect the export schema",
    },
  });

/** Drop the export schema with every flat in it and recreate it in the warehouse. */
export const repairExportSchema = async (): Promise<ExportSchemaStatus> => {
  const response = await api.post("/lakehouse/flats/schema/repair");
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
