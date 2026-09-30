import type {
  ColumnKind,
  ColumnProfile,
  HistogramBucket,
} from "@/types/exports";

// ---------------------------------------------------------------- formatting

const intFmt = new Intl.NumberFormat("en-GB");
const compactFmt = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCount = (n: number | null | undefined) =>
  n == null ? "—" : intFmt.format(n);

export const formatCompact = (n: number | null | undefined) =>
  n == null ? "—" : n < 10_000 ? intFmt.format(n) : compactFmt.format(n);

/** Numeric statistic: up to 3 significant decimals, compact when large. */
export const formatStat = (v: number | string | null | undefined) => {
  if (v == null || v === "") return "—";
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) return String(v);
  const abs = Math.abs(v);
  if (abs >= 100_000) return compactFmt.format(v);
  if (Number.isInteger(v)) return intFmt.format(v);
  const digits = abs >= 100 ? 1 : abs >= 1 ? 2 : 3;
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: digits }).format(v);
};

export const formatPct = (pct: number | null | undefined) => {
  if (pct == null || !Number.isFinite(pct)) return "—";
  if (pct > 0 && pct < 0.1) return "<0.1%";
  if (pct < 100 && pct > 99.9) return ">99.9%";
  return `${pct >= 10 || Number.isInteger(pct) ? Math.round(pct * 10) / 10 : pct.toFixed(1)}%`;
};

const parseDate = (v: string | number | null | undefined) => {
  if (v == null || typeof v === "number") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (v: string | number | null | undefined) => {
  const d = parseDate(v);
  if (!d) return v == null ? "—" : String(v);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (v: string | null | undefined) => {
  const d = parseDate(v);
  if (!d) return v ?? "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Human span between two ISO dates, e.g. "5.9 years" or "43 days". */
export const formatSpan = (
  a: string | number | null | undefined,
  b: string | number | null | undefined
) => {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return null;
  const days = Math.abs(db.getTime() - da.getTime()) / 86_400_000;
  if (days >= 730) return `${(days / 365.25).toFixed(1)} years`;
  if (days >= 60) return `${Math.round(days / 30.44)} months`;
  return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
};

export const completeness = (c: Pick<ColumnProfile, "null_pct">) =>
  c.null_pct == null ? null : Math.max(0, Math.min(100, 100 - c.null_pct));

export const columnTotal = (c: ColumnProfile, fallbackRows: number | null) =>
  c.non_null != null && c.null_count != null
    ? c.non_null + c.null_count
    : fallbackRows;

// ---------------------------------------------------------------- kinds

export const KIND_ORDER: ColumnKind[] = [
  "numeric",
  "categorical",
  "boolean",
  "temporal",
  "text",
  "identifier",
];

export const KIND_LABEL: Record<ColumnKind, string> = {
  numeric: "Numeric",
  categorical: "Categorical",
  boolean: "Yes / no",
  temporal: "Date",
  text: "Free text",
  identifier: "Identifier",
};

// ---------------------------------------------------------------- histogram

/**
 * The API returns approximate centroids (unevenly spaced). Drawing each
 * centroid as an equal-width bar would misstate density, so re-bin the counts
 * onto an even grid across [min, max].
 */
export const rebinHistogram = (
  buckets: HistogramBucket[],
  min: number | null,
  max: number | null,
  target = 24
): { lo: number; hi: number; count: number }[] => {
  if (!buckets.length) return [];
  const lo = min ?? buckets[0].x;
  const hi = max ?? buckets[buckets.length - 1].x;
  if (!(hi > lo)) {
    const total = buckets.reduce((s, b) => s + b.count, 0);
    return [{ lo, hi, count: total }];
  }
  const n = Math.max(4, Math.min(target, buckets.length));
  const width = (hi - lo) / n;
  const bins = Array.from({ length: n }, (_, i) => ({
    lo: lo + i * width,
    hi: lo + (i + 1) * width,
    count: 0,
  }));
  for (const b of buckets) {
    const i = Math.min(n - 1, Math.max(0, Math.floor((b.x - lo) / width)));
    bins[i].count += b.count;
  }
  return bins;
};

// ---------------------------------------------------------------- grouping

export interface SingleEntry {
  type: "column";
  key: string;
  column: ColumnProfile;
}

export interface GroupEntry {
  type: "group";
  key: string;
  base: string;
  label: string;
  /** Sorted by occurrence. */
  columns: ColumnProfile[];
}

export type ProfileEntry = SingleEntry | GroupEntry;

/**
 * Collapse numbered wide-flat columns (`base_variable` + `occurrence`) into one
 * group per base variable, placed where its first occurrence appears.
 * A base variable with a single occurrence stays a plain column.
 */
export const groupColumns = (columns: ColumnProfile[]): ProfileEntry[] => {
  const byBase = new Map<string, ColumnProfile[]>();
  for (const c of columns) {
    if (c.occurrence != null && c.base_variable) {
      const list = byBase.get(c.base_variable) ?? [];
      list.push(c);
      byBase.set(c.base_variable, list);
    }
  }

  const entries: ProfileEntry[] = [];
  const emitted = new Set<string>();
  for (const c of columns) {
    const group =
      c.occurrence != null && c.base_variable ? byBase.get(c.base_variable) : undefined;
    if (!group || group.length < 2) {
      entries.push({ type: "column", key: `c:${c.name}`, column: c });
      continue;
    }
    const base = c.base_variable as string;
    if (emitted.has(base)) continue;
    emitted.add(base);
    const sorted = [...group].sort((a, b) => (a.occurrence ?? 0) - (b.occurrence ?? 0));
    entries.push({
      type: "group",
      key: `g:${base}`,
      base,
      label: groupLabel(sorted[0], base),
      columns: sorted,
    });
  }
  return entries;
};

/** Strip a trailing occurrence number from the first column's label. */
const groupLabel = (first: ColumnProfile, base: string) => {
  const label = first.label?.trim();
  if (!label) return base;
  const stripped = label.replace(/[\s_#(-]*\(?\d+\)?$/, "").trim();
  return stripped || base;
};

export const matchesSearch = (c: ColumnProfile, q: string) => {
  if (!q) return true;
  return [c.name, c.label, c.description, c.base_variable]
    .some((s) => s != null && s.toLowerCase().includes(q));
};

/** Mean completeness across columns (each column weighted equally). */
export const meanCompleteness = (columns: ColumnProfile[]) => {
  const vals = columns.map(completeness).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
};
