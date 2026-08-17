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
