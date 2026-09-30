// Types for the export endpoints:
//   GET  /data/exports/options?source=...
//   GET  /data/exports/profile?source=...
//   POST /data/download...        (package query param)

/** `zip` is the server default; `csv` sends the data alone. */
export type ExportPackage = "csv" | "zip";

/**
 * What a dataset's download holds. One export per dataset: a zip with the
 * data, catalogue.xlsx and data_dictionary.xlsx.
 */
export interface ExportOptions {
  source: string;
  slug: string;
  /** False until the dataset's export is built; the download is then a plain CSV. */
  available: boolean;
  /** How the rows are laid out, for display. */
  description: string;
  /** Files in the zip, data first. Empty when not available. */
  files: string[];
  row_count: number | null;
  patient_count: number | null;
  visit_count: number | null;
  column_count: number | null;
  built_at: string | null;
  /**
   * Estimated size of this user's zip in bytes, from the dataset's last
   * download scaled to their granted variables. Null until it has one.
   */
  expected_bytes: number | null;
}

export type ProfileStatus = "ready" | "pending" | "unavailable";

export type ColumnKind =
  | "numeric"
  | "categorical"
  | "boolean"
  | "temporal"
  | "text"
  | "identifier";

export interface ColumnQuantiles {
  p05: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p95: number | null;
}

export interface HistogramBucket {
  /** Approximate bucket centroid. */
  x: number;
  count: number;
}

export interface TopValue {
  value: string | number | boolean | null;
  count: number;
}

export interface ColumnProfile {
  name: string;
  label: string | null;
  description: string | null;
  sql_type: string;
  kind: ColumnKind;
  base_variable: string | null;
  occurrence: number | null;
  non_null: number | null;
  null_count: number | null;
  /** 0–100 */
  null_pct: number | null;
  /** Approximate (Trino approx_distinct). */
  distinct: number | null;
  /** Numbers for numeric columns, ISO strings for temporal columns. */
  min: number | string | null;
  max: number | string | null;
  mean: number | null;
  stddev: number | null;
  quantiles: ColumnQuantiles | null;
  histogram: HistogramBucket[] | null;
  top_values: TopValue[] | null;
  top_values_note: string | null;
}

export interface FlatProfile {
  table: string;
  /** File name this flat is exported as. */
  file: string;
  /** Economic only; null for single-flat datasets. */
  section: string | null;
  section_title: string | null;
  row_count: number | null;
  computed_at: string | null;
  columns: ColumnProfile[];
}

export interface ExportProfile {
  source: string;
  slug: string;
  status: ProfileStatus;
  message: string | null;
  min_cell_count: number | null;
  /** Empty unless status === "ready". */
  flats: FlatProfile[];
}

export interface DownloadRequest {
  source: string;
  /** Omit to use the server default (zip). */
  package?: ExportPackage;
  /** Used for the fallback filename when Content-Disposition is missing. */
  slug?: string;
  /** Called with the bytes received so far as the download arrives. */
  onProgress?: (loaded: number) => void;
}

export interface DownloadResult {
  blob: Blob;
  filename: string;
}
