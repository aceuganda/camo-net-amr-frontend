"use client";

/**
 * Admin surface for the flat export tables.
 *
 * A flat is a precomputed table holding every variable a dataset's CSV export
 * can produce, so a download reads one table instead of re-running a large
 * join. Most datasets are a single flat; economic is eight, one per section of
 * its multi-section CSV, and all eight must exist before downloads use them.
 *
 * Variable documentation lives as column comments on the flat itself, which is
 * why uploading a document requires the flat to exist first.
 */

import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Columns3,
  Database,
  FileJson,
  Hammer,
  Loader2,
  RefreshCw,
  RotateCcw,
  Table2,
  Trash2,
} from "lucide-react";

import {
  buildFlat,
  dropFlat,
  refreshFlat,
  resetDatasetVariables,
  uploadDatasetVariablesFile,
  useDatasetVariables,
  useLakehouseDatasets,
  useLakehouseFlat,
  useLakehouseFlats,
  type FlatShape,
  type LakehouseDataset,
} from "@/lib/hooks/useLakehouse";

/** Datasets whose repeating records can be pivoted into numbered columns. */
const WIDE_CAPABLE = new Set(["flemming", "patient_outcomes", "daring"]);

const formatWhen = (value: string | null) => {
  if (!value) return "never";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleString();
};

const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : value.toLocaleString();

const errorText = (error: any, fallback: string) =>
  error?.response?.data?.detail ?? error?.message ?? fallback;

export default function LakehouseFlats() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const { data: datasetsData, isLoading: datasetsLoading } =
    useLakehouseDatasets();
  const { data: flatsData, isFetching: flatsFetching } = useLakehouseFlats();
  const { data: variablesData, isFetching: variablesFetching } =
    useDatasetVariables(activeSlug);
  const { data: flatDetail, isFetching: flatDetailFetching } =
    useLakehouseFlat(activeTable);

  const datasets: LakehouseDataset[] = datasetsData?.data?.datasets ?? [];
  const flats = flatsData?.data?.flats ?? [];
  const variables = variablesData?.data;
  const detail = flatDetail?.data;

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["lakehouse_flats"] });
    queryClient.invalidateQueries({ queryKey: ["lakehouse_datasets"] });
    queryClient.invalidateQueries({
      queryKey: ["lakehouse_dataset_variables"],
    });
    queryClient.invalidateQueries({ queryKey: ["lakehouse_flat"] });
  };

  const build = useMutation({
    mutationFn: ({
      slug,
      shape,
      existing,
    }: {
      slug: string;
      shape: FlatShape;
      existing: boolean;
    }) => (existing ? refreshFlat(slug, shape) : buildFlat(slug, shape)),
    onSuccess: (result) => {
      // A wide build clips groups that exceed the column ceiling. That is
      // invisible in the resulting file, so surface it rather than log it.
      const truncated = (result?.flats ?? []).flatMap((flat: any) =>
        Object.entries(flat.truncated ?? {}).map(
          ([group, count]) => `${group} (${count})`
        )
      );

      if (truncated.length > 0) {
        toast.warning(
          `Built, but truncated to the column limit: ${truncated.join(", ")}`
        );
      } else {
        toast.success(
          `Built ${result?.flat_count ?? 1} ${
            result?.flat_count === 1 ? "table" : "tables"
          } for ${result?.dataset ?? "dataset"}`
        );
      }
      refreshAll();
    },
    onError: (error: any) =>
      toast.error(errorText(error, "Flat build failed")),
  });

  const remove = useMutation({
    mutationFn: (table: string) => dropFlat(table),
    onSuccess: (_result, table) => {
      toast.success(`Dropped ${table}`);
      if (activeTable === table) setActiveTable(null);
      refreshAll();
    },
    onError: (error: any) => toast.error(errorText(error, "Could not drop")),
  });

  const upload = useMutation({
    mutationFn: ({ slug, file }: { slug: string; file: File }) =>
      uploadDatasetVariablesFile(slug, file),
    onSuccess: (result) => {
      // Variables the flats have no column for are stored nowhere and silently
      // do nothing, so the count comes back and is shown.
      if (result?.ignored_count > 0) {
        toast.warning(
          `Applied ${result.applied_count}; ignored ${result.ignored_count} unknown: ` +
            `${(result.ignored ?? []).slice(0, 5).join(", ")}`
        );
      } else {
        toast.success(`Applied ${result?.applied_count ?? 0} descriptions`);
      }
      refreshAll();
    },
    onError: (error: any) =>
      toast.error(errorText(error, "Upload failed")),
  });

  const reset = useMutation({
    mutationFn: (slug: string) => resetDatasetVariables(slug),
    onSuccess: (result) => {
      toast.success(
        `Reset ${result?.reset_count ?? 0} descriptions to the built-in defaults`
      );
      refreshAll();
    },
    onError: (error: any) => toast.error(errorText(error, "Reset failed")),
  });

  const busySlug =
    build.isPending
      ? build.variables?.slug
      : upload.isPending
      ? upload.variables?.slug
      : reset.isPending
      ? (reset.variables as string)
      : null;

  const totals = useMemo(() => {
    const built = datasets.filter((d) => d.has_flat).length;
    const documented = datasets.reduce(
      (sum, d) => sum + d.documented_count,
      0
    );
    return { built, documented };
  }, [datasets]);

  const onPickFile = (slug: string) => {
    setUploadTarget(slug);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && uploadTarget) {
            upload.mutate({ slug: uploadTarget, file });
          }
          // Reset so picking the same file twice still fires a change event.
          event.target.value = "";
        }}
      />

      {/* Summary ---------------------------------------------------------- */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Datasets",
            value: datasets.length,
            icon: Database,
            hint: `${totals.built} fully built`,
          },
          {
            label: "Flat tables",
            value: flats.length,
            icon: Table2,
            hint: flatsData?.data?.schema ?? "-",
          },
          {
            label: "Documented columns",
            value: totals.documented,
            icon: Columns3,
            hint: "From flat column comments",
          },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {tile.label}
                </p>
                <Icon className="h-4 w-4 text-cyan-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                {datasetsLoading ? "-" : tile.value}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">{tile.hint}</p>
            </div>
          );
        })}
      </section>

      {/* Datasets --------------------------------------------------------- */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Downloadable datasets
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Building replaces the existing table and carries its documentation
              over.
            </p>
          </div>
          {flatsFetching && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
          )}
        </div>

        <div className="space-y-2">
          {datasets.map((dataset) => {
            const isBusy = busySlug === dataset.slug;
            const isActive = activeSlug === dataset.slug;
            const partial =
              dataset.built_count > 0 &&
              dataset.built_count < dataset.flat_count;

            return (
              <div
                key={dataset.slug}
                className={`rounded-xl border p-3 transition ${
                  isActive
                    ? "border-cyan-300 bg-cyan-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    onClick={() =>
                      setActiveSlug(isActive ? null : dataset.slug)
                    }
                    className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <p className="truncate text-sm font-medium text-slate-800">
                      {dataset.dataset}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      {dataset.slug}
                      <span className="ml-2 tabular-nums">
                        {dataset.variable_count} variables
                      </span>
                      {dataset.flat_count > 1 && (
                        <span className="ml-2 tabular-nums">
                          {dataset.flat_count} sections
                        </span>
                      )}
                    </p>
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        dataset.has_flat
                          ? "bg-emerald-50 text-emerald-700"
                          : partial
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {dataset.has_flat
                        ? "built"
                        : partial
                        ? `${dataset.built_count}/${dataset.flat_count} built`
                        : "not built"}
                    </span>

                    <button
                      disabled={isBusy}
                      onClick={() =>
                        build.mutate({
                          slug: dataset.slug,
                          shape: "long",
                          existing: dataset.has_flat,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Hammer className="h-3.5 w-3.5" />
                      )}
                      {dataset.has_flat ? "Rebuild" : "Build"}
                    </button>

                    {WIDE_CAPABLE.has(dataset.slug) && (
                      <button
                        disabled={isBusy}
                        onClick={() =>
                          build.mutate({
                            slug: dataset.slug,
                            shape: "wide",
                            existing: false,
                          })
                        }
                        title="One row per visit, repeating records in numbered columns"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Columns3 className="h-3.5 w-3.5" />
                        Wide
                      </button>
                    )}

                    <button
                      disabled={isBusy || !dataset.has_flat}
                      onClick={() => onPickFile(dataset.slug)}
                      title={
                        dataset.has_flat
                          ? "Upload a variable document as JSON"
                          : "Build the flat first - descriptions are stored on it"
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <FileJson className="h-3.5 w-3.5" />
                      JSON
                    </button>

                    <button
                      disabled={isBusy || !dataset.has_flat}
                      onClick={() => reset.mutate(dataset.slug)}
                      title="Rewrite descriptions from the built-in constants"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {partial && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Only some sections are built. Downloads keep using the slow
                    path until all {dataset.flat_count} exist.
                  </p>
                )}

                {isActive && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-600">
                        Variables
                        {variables && (
                          <span className="ml-2 font-normal text-slate-400">
                            from {variables.source}
                          </span>
                        )}
                      </p>
                      {variablesFetching && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-100">
                      <table className="w-full text-left text-xs">
                        <tbody>
                          {Object.entries(variables?.variables ?? {}).map(
                            ([name, meta]) => (
                              <tr
                                key={name}
                                className="border-b border-slate-100 last:border-0"
                              >
                                <td className="w-1/3 py-1.5 pl-2 pr-2 align-top font-mono text-slate-800">
                                  {name}
                                  {meta.label && meta.label !== name && (
                                    <span className="ml-1 font-sans text-cyan-700">
                                      → {meta.label}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 pr-2 align-top text-slate-500">
                                  {meta.description ?? "-"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!datasetsLoading && datasets.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              No downloadable datasets.
            </p>
          )}
        </div>
      </section>

      {/* Built tables ------------------------------------------------------ */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:col-span-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Flat tables
          </h3>

          {flats.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Nothing built yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 font-medium">Table</th>
                    <th className="py-2 pr-2 text-right font-medium">Rows</th>
                    <th className="py-2 pr-2 text-right font-medium">Cols</th>
                    <th className="py-2 pr-2 font-medium">Built</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {flats.map((flat) => (
                    <tr
                      key={flat.table}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-1.5 pr-2">
                        <button
                          onClick={() =>
                            setActiveTable(
                              activeTable === flat.table ? null : flat.table
                            )
                          }
                          className={`truncate font-mono transition ${
                            activeTable === flat.table
                              ? "text-cyan-700"
                              : "text-slate-800 hover:text-cyan-700"
                          }`}
                        >
                          {flat.table}
                        </button>
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums text-slate-600">
                        {formatCount(flat.row_count)}
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums text-slate-600">
                        {formatCount(flat.column_count)}
                      </td>
                      <td className="py-1.5 pr-2 text-slate-500">
                        {formatWhen(flat.built_at)}
                      </td>
                      <td className="py-1.5 text-right">
                        <button
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(flat.table)}
                          title="Drop this table"
                          className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Columns</h3>
            {flatDetailFetching && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>

          {!activeTable && (
            <p className="py-6 text-center text-sm text-slate-500">
              Select a table to inspect its columns.
            </p>
          )}

          {activeTable && detail && (
            <>
              <p className="mb-2 truncate font-mono text-xs text-slate-500">
                {detail.table}
                <span className="ml-2 tabular-nums">
                  ({detail.column_count} cols, {detail.documented_count}{" "}
                  documented)
                </span>
              </p>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <tbody>
                    {detail.columns.map((column) => (
                      <tr
                        key={column.name}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1.5 pr-2 align-top">
                          <span className="font-mono text-slate-800">
                            {column.name}
                          </span>
                          {column.description && (
                            <p className="mt-0.5 text-slate-500">
                              {column.description}
                            </p>
                          )}
                        </td>
                        <td className="py-1.5 text-right align-top font-mono text-slate-400">
                          {column.sql_type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
