"use client";

/**
 * A look at the rows a flat really holds.
 *
 * Opens as a full-width sheet so a wide flat (hundreds of columns) has room to
 * scroll. The header and row numbers stay pinned; a column finder and a
 * "hide empty columns" switch keep a 500-column wide flat readable, since the
 * high-numbered occurrence columns are mostly null.
 *
 * A long patient flat holds several records per visit, and most of a record's
 * columns repeat the visit's. The rows come back ordered by patient and visit;
 * the rows of one visit share a band, and any value that repeats the row above
 * is dimmed, so what actually differs between records (result, antibiotic,
 * culture) is what the eye lands on.
 */

import { useDeferredValue, useMemo, useState } from "react";
import {
  AlertTriangle,
  Columns3,
  EyeOff,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  PREVIEW_LIMITS,
  useFlatPreview,
  type FlatPreview,
  type FlatPreviewColumn,
  type PreviewLimit,
} from "@/lib/hooks/useLakehouse";

type Cell = FlatPreview["rows"][number][number];

const NUMERIC = /^(tinyint|smallint|integer|bigint|real|double|decimal)/;
const TEMPORAL = /^(date|time|timestamp)/;

const isNumeric = (column: FlatPreviewColumn) =>
  Boolean(column.sql_type && NUMERIC.test(column.sql_type));

const isTemporal = (column: FlatPreviewColumn) =>
  Boolean(column.sql_type && TEMPORAL.test(column.sql_type));

const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "–" : value.toLocaleString();

const formatBuilt = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return parsed.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const cellText = (value: Cell) =>
  value === null || value === undefined ? "" : String(value);

const errorText = (error: any) =>
  error?.response?.data?.detail ?? error?.message ?? "the query engine did not answer";

/** Section slugs are snake_case; people read them with spaces. */
const humanise = (value: string) => value.replace(/_/g, " ");

function CellValue({ value, column }: { value: Cell; column: FlatPreviewColumn }) {
  if (value === null || value === undefined) {
    return (
      <span aria-label="null" className="select-none text-slate-300">
        ∅
      </span>
    );
  }
  if (typeof value === "boolean") {
    return (
      <span className={`font-mono ${value ? "text-emerald-700" : "text-slate-500"}`}>
        {value ? "true" : "false"}
      </span>
    );
  }
  if (isNumeric(column) || typeof value === "number") {
    return <span className="font-mono tabular-nums text-slate-800">{String(value)}</span>;
  }
  if (isTemporal(column)) {
    return <span className="font-mono text-slate-700">{String(value)}</span>;
  }
  const text = String(value);
  return (
    <span className="block max-w-[18rem] truncate text-slate-800" title={text}>
      {text}
    </span>
  );
}

function SkeletonGrid() {
  return (
    <div className="animate-pulse px-5 py-4" aria-hidden>
      <div className="mb-3 flex gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-3 w-24 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: 12 }).map((_, row) => (
        <div key={row} className="mb-2 flex gap-3">
          {Array.from({ length: 8 }).map((_, col) => (
            <div
              key={col}
              className="h-3 w-24 rounded bg-slate-100"
              style={{ opacity: 1 - row * 0.06 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function FlatPreviewSheet({
  table,
  onClose,
}: {
  /** The flat to show, or null to keep the sheet closed. */
  table: string | null;
  onClose: () => void;
}) {
  const [limit, setLimit] = useState<PreviewLimit>(50);
  const [rowQuery, setRowQuery] = useState("");
  const [columnQuery, setColumnQuery] = useState("");
  const [hideEmpty, setHideEmpty] = useState(false);
  const [dimRepeats, setDimRepeats] = useState(true);

  const deferredRowQuery = useDeferredValue(rowQuery);
  const deferredColumnQuery = useDeferredValue(columnQuery);

  const { data, error, isLoading, isFetching, refetch } = useFlatPreview(
    table,
    limit,
    Boolean(table)
  );
  const preview = data?.data;

  // Columns with no value in any returned row. In a wide flat these are the
  // tail of each repeating group, and they can be most of the table.
  const emptyColumns = useMemo(() => {
    if (!preview) return new Set<number>();
    const empty = new Set<number>();
    preview.columns.forEach((_, index) => {
      if (preview.rows.every((row) => row[index] === null || row[index] === undefined)) {
        empty.add(index);
      }
    });
    return empty;
  }, [preview]);

  const visibleColumns = useMemo(() => {
    if (!preview) return [];
    const needle = deferredColumnQuery.trim().toLowerCase();
    return preview.columns
      .map((column, index) => ({ column, index }))
      .filter(({ column, index }) => {
        if (hideEmpty && emptyColumns.has(index)) return false;
        if (!needle) return true;
        return (
          column.label.toLowerCase().includes(needle) ||
          column.name.toLowerCase().includes(needle)
        );
      });
  }, [preview, deferredColumnQuery, hideEmpty, emptyColumns]);

  const visibleRows = useMemo(() => {
    if (!preview) return [];
    const needle = deferredRowQuery.trim().toLowerCase();
    const indexed = preview.rows.map((row, index) => ({ row, index }));
    if (!needle) return indexed;
    return indexed.filter(({ row }) =>
      visibleColumns.some(({ index }) => cellText(row[index]).toLowerCase().includes(needle))
    );
  }, [preview, deferredRowQuery, visibleColumns]);

  // Indexes of the columns rows are grouped by (patient, visit).
  const grainIndexes = useMemo(() => {
    if (!preview) return [];
    const wanted = new Set(preview.grain_columns.map((name) => name.toLowerCase()));
    return preview.columns
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => wanted.has(column.name.toLowerCase()))
      .map(({ index }) => index);
  }, [preview]);
  const grouped = grainIndexes.length > 0;

  // Band each run of rows sharing the grain: which band a row is in, whether
  // it opens a new group, and the row above it within the group (for dimming).
  const bands = useMemo(() => {
    let band = 0;
    let previousKey: string | null = null;
    let previousRow: Cell[] | null = null;
    return visibleRows.map(({ row }) => {
      const key = grouped ? JSON.stringify(grainIndexes.map((index) => row[index])) : null;
      const opens = !grouped || key !== previousKey;
      if (opens && previousKey !== null) band += 1;
      const above = opens ? null : previousRow;
      previousKey = key;
      previousRow = row;
      return { band, opens, above };
    });
  }, [visibleRows, grainIndexes, grouped]);

  const reset = () => {
    setRowQuery("");
    setColumnQuery("");
    setHideEmpty(false);
    setDimRepeats(true);
  };

  return (
    <Sheet
      open={Boolean(table)}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="flex h-[88vh] flex-col gap-0 rounded-t-2xl p-0 sm:h-[90vh]"
      >
        {/* Header ---------------------------------------------------------- */}
        <div className="border-b border-slate-200 px-5 pb-3 pt-4 pr-14">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <SheetTitle className="font-mono text-sm font-semibold text-slate-900">
              {table}
            </SheetTitle>
            {preview?.slug && (
              <span className="rounded-full bg-cyan-50 px-2 py-px text-xs text-cyan-800">
                {preview.slug}
                {preview.section && (
                  <span className="text-cyan-700/70"> / {humanise(preview.section)}</span>
                )}
              </span>
            )}
            {preview && (
              <span className="rounded-full bg-slate-100 px-2 py-px text-xs text-slate-600">
                {preview.shape}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {preview ? (
              <>
                First {formatCount(Math.min(preview.limit, preview.rows.length))} of{" "}
                <span className="tabular-nums">{formatCount(preview.row_count)}</span> rows
                {preview.patient_count !== null && preview.patient_count !== undefined && (
                  <>
                    {" "}from{" "}
                    <span className="tabular-nums font-medium text-slate-700">
                      {formatCount(preview.patient_count)}
                    </span>{" "}
                    patients
                    {preview.visit_count !== null && preview.visit_count !== undefined && (
                      <>
                        {" "}(<span className="tabular-nums">{formatCount(preview.visit_count)}</span>{" "}
                        visits)
                      </>
                    )}
                  </>
                )}
                , <span className="tabular-nums">{formatCount(preview.column_count)}</span>{" "}
                columns
                {preview.built_at && <> — built {formatBuilt(preview.built_at)}</>}
              </>
            ) : (
              "Loading the first rows"
            )}
          </p>
        </div>

        {/* Toolbar ---------------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-2">
          <label className="relative min-w-0 flex-1 basis-48">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={rowQuery}
              onChange={(event) => setRowQuery(event.target.value)}
              placeholder="Filter rows"
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-7 text-xs text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            {rowQuery && (
              <button
                onClick={() => setRowQuery("")}
                aria-label="Clear row filter"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </label>

          <label className="relative min-w-0 flex-1 basis-48">
            <Columns3 className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={columnQuery}
              onChange={(event) => setColumnQuery(event.target.value)}
              placeholder="Find a column"
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-7 text-xs text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            {columnQuery && (
              <button
                onClick={() => setColumnQuery("")}
                aria-label="Clear column filter"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={() => setHideEmpty((value) => !value)}
            aria-pressed={hideEmpty}
            disabled={emptyColumns.size === 0}
            title={
              emptyColumns.size === 0
                ? "Every column has a value in these rows"
                : `${emptyColumns.size} columns are empty in these rows`
            }
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition disabled:opacity-40 ${
              hideEmpty
                ? "border-cyan-600 bg-cyan-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <EyeOff className="h-3.5 w-3.5" />
            Hide empty columns
            {emptyColumns.size > 0 && (
              <span
                className={`rounded-full px-1.5 tabular-nums ${
                  hideEmpty ? "bg-white/20" : "bg-slate-100 text-slate-600"
                }`}
              >
                {emptyColumns.size}
              </span>
            )}
          </button>

          {grouped && (
            <button
              type="button"
              onClick={() => setDimRepeats((value) => !value)}
              aria-pressed={dimRepeats}
              title="Within a patient's rows, fade values that repeat the row above"
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition ${
                dimRepeats
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Dim repeats
            </button>
          )}

          <div
            role="group"
            aria-label="Rows to load"
            className="inline-flex h-8 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs"
          >
            {PREVIEW_LIMITS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLimit(option)}
                aria-pressed={limit === option}
                className={`px-2.5 tabular-nums transition ${
                  limit === option
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Reload rows"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Grid ------------------------------------------------------------- */}
        <div className="relative min-h-0 flex-1 overflow-auto overscroll-contain">
          {isLoading && <SkeletonGrid />}

          {!isLoading && error && (
            <div className="m-5 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Couldn&apos;t load the preview: {errorText(error)}.{" "}
                <button onClick={() => refetch()} className="underline underline-offset-2">
                  Try again
                </button>
              </p>
            </div>
          )}

          {preview && preview.rows.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-500">
              This flat has no rows yet. Rebuild it once the source has data.
            </p>
          )}

          {preview && preview.rows.length > 0 && (
            <table className="min-w-max border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 top-0 z-30 w-10 border-b border-r border-slate-200 bg-white px-2 py-2 text-right font-normal tabular-nums text-slate-400"
                  >
                    #
                  </th>
                  {visibleColumns.map(({ column }) => (
                    <th
                      key={column.name}
                      scope="col"
                      title={
                        column.description
                          ? `${column.name}\n${column.description}`
                          : column.name
                      }
                      className={`sticky top-0 z-20 border-b border-slate-200 bg-white px-2.5 py-1.5 align-bottom font-normal ${
                        isNumeric(column) ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="block max-w-[18rem] truncate font-medium text-slate-700">
                        {column.label}
                      </span>
                      <span className="block font-mono text-[10px] leading-4 text-slate-400">
                        {column.sql_type}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ row, index }, position) => {
                  const { band, opens, above } = bands[position];
                  const shaded = band % 2 === 1;
                  // A group's first row is separated from the one above it;
                  // rows inside a group run together.
                  const rowBorder = grouped
                    ? opens && position > 0
                      ? "border-t border-slate-300/80"
                      : "border-t border-transparent"
                    : "border-b border-slate-100";
                  return (
                    <tr
                      key={index}
                      className={`group ${shaded ? "bg-slate-50/70" : "bg-white"} hover:bg-cyan-50/50`}
                    >
                      <td
                        className={`sticky left-0 z-10 border-r border-slate-100 px-2 py-1.5 text-right font-mono tabular-nums group-hover:bg-cyan-50 ${rowBorder} ${
                          shaded ? "bg-slate-50" : "bg-white"
                        } ${opens || !grouped ? "text-slate-400" : "text-slate-300"}`}
                      >
                        {index + 1}
                      </td>
                      {visibleColumns.map(({ column, index: columnIndex }) => {
                        const value = row[columnIndex];
                        const repeated =
                          grouped &&
                          dimRepeats &&
                          above !== null &&
                          cellText(above[columnIndex]) === cellText(value);
                        return (
                          <td
                            key={column.name}
                            className={`whitespace-nowrap px-2.5 py-1.5 ${rowBorder} ${
                              isNumeric(column) ? "text-right" : "text-left"
                            } ${repeated ? "opacity-30" : ""}`}
                          >
                            <CellValue value={value} column={column} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {preview && preview.rows.length > 0 && visibleRows.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No loaded row contains &ldquo;{deferredRowQuery}&rdquo;. The filter only
              searches the {preview.rows.length} rows shown.
            </p>
          )}

          {preview && preview.rows.length > 0 && visibleColumns.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No column matches &ldquo;{deferredColumnQuery}&rdquo;.
            </p>
          )}
        </div>

        {/* Footer ----------------------------------------------------------- */}
        {preview && preview.rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-2 text-[11px] text-slate-500">
            <span className="tabular-nums">
              {visibleRows.length === preview.rows.length
                ? `${preview.rows.length} rows`
                : `${visibleRows.length} of ${preview.rows.length} rows match`}
              {" · "}
              {visibleColumns.length === preview.columns.length
                ? `${preview.columns.length} columns`
                : `${visibleColumns.length} of ${preview.columns.length} columns shown`}
            </span>
            <span>
              {grouped
                ? `Rows of one ${
                    grainIndexes.length > 1 ? "visit" : "patient"
                  } share a band${dimRepeats ? "; values repeating the row above are faded" : ""}. Nulls appear as ∅.`
                : "Cells show stored values; nulls appear as ∅."}
            </span>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
