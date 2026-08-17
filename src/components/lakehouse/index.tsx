"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Layers,
  RefreshCw,
  Table2,
  Warehouse,
} from "lucide-react";
import {
  useLakehouseCatalogs,
  useLakehouseHealth,
  useLakehouseOverview,
  useLakehouseTableColumns,
} from "@/lib/hooks/useLakehouse";

/** Catalogs are named by connector, so infer a readable source type from the name. */
const catalogKind = (catalog: string) => {
  if (catalog.includes("mssql")) return "SQL Server";
  if (catalog === "iceberg") return "Iceberg on MinIO";
  return "Catalog";
};

export default function LakehouseOverview() {
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
    isFetching: healthFetching,
  } = useLakehouseHealth();

  const { data: catalogsData, isLoading: catalogsLoading } =
    useLakehouseCatalogs();

  const catalogs = catalogsData?.data?.catalogs ?? [];
  const [activeCatalog, setActiveCatalog] = useState<string | null>(null);
  const [openSchema, setOpenSchema] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<{
    schema: string;
    table: string;
  } | null>(null);

  // Select the first catalog once the list arrives.
  useEffect(() => {
    if (!activeCatalog && catalogs.length > 0) {
      setActiveCatalog(catalogs[0]);
    }
  }, [catalogs, activeCatalog]);

  const { data: overviewData, isFetching: overviewFetching } =
    useLakehouseOverview(activeCatalog);

  const { data: columnsData, isFetching: columnsFetching } =
    useLakehouseTableColumns(
      activeCatalog,
      activeTable?.schema ?? null,
      activeTable?.table ?? null
    );

  const health = healthData?.data;
  const overview = overviewData?.data;
  const columns = columnsData?.data;

  const totalTables = useMemo(
    () =>
      overview?.schemas.reduce((sum, entry) => sum + entry.table_count, 0) ?? 0,
    [overview]
  );

  const isConnected = !healthError && health?.status === "success";

  return (
    <div className="space-y-4">
      {/* Connection status ------------------------------------------------ */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                isConnected
                  ? "bg-cyan-400/15 text-cyan-600"
                  : "bg-rose-400/15 text-rose-600"
              }`}
            >
              <Warehouse className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-600">
                Query engine
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Lakehouse
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {healthLoading
                  ? "Checking connection..."
                  : isConnected
                  ? `Connected over ${health?.connection.http_scheme} to ${health?.connection.host}`
                  : "Cannot reach the query engine"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <CircleAlert className="h-3.5 w-3.5" />
              )}
              {healthLoading
                ? "Checking"
                : isConnected
                ? "Online"
                : "Unreachable"}
            </span>
            <button
              onClick={() => refetchHealth()}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Refresh connection status"
            >
              <RefreshCw
                className={`h-4 w-4 ${healthFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* A configured catalog the engine does not report is a real
            misconfiguration, so surface it rather than silently omitting it. */}
        {isConnected && (health?.configured_but_missing?.length ?? 0) > 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Configured but not reported by the engine:{" "}
            {health?.configured_but_missing.join(", ")}
          </p>
        )}

        {healthError && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">
            The backend could not reach Trino. This is a connection problem, not
            a permissions one.
          </p>
        )}
      </section>

      {/* Summary tiles ---------------------------------------------------- */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Catalogs",
            value: catalogs.length,
            icon: Boxes,
            hint: "Analytical sources exposed",
          },
          {
            label: "Schemas",
            value: overview?.schema_count ?? 0,
            icon: Layers,
            hint: activeCatalog ?? "-",
          },
          {
            label: "Tables",
            value: totalTables,
            icon: Table2,
            hint: activeCatalog ?? "-",
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
                {catalogsLoading ? "-" : tile.value}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">{tile.hint}</p>
            </div>
          );
        })}
      </section>

      {/* Catalog selector -------------------------------------------------- */}
      {catalogs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {catalogs.map((catalog) => {
            const isActive = catalog === activeCatalog;
            return (
              <button
                key={catalog}
                onClick={() => {
                  setActiveCatalog(catalog);
                  setOpenSchema(null);
                  setActiveTable(null);
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  isActive
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:text-cyan-700"
                }`}
              >
                {catalog}
                <span
                  className={`ml-2 text-[10px] ${
                    isActive ? "text-slate-900/60" : "text-slate-500"
                  }`}
                >
                  {catalogKind(catalog)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tree + column detail ---------------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {activeCatalog ?? "Catalog"} contents
            </h3>
            {overviewFetching && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>

          {!overview && !overviewFetching && (
            <p className="py-6 text-center text-sm text-slate-500">
              No catalog selected.
            </p>
          )}

          <div className="space-y-2">
            {overview?.schemas.map((entry) => {
              const isOpen = openSchema === entry.schema;
              return (
                <div
                  key={entry.schema}
                  className="rounded-xl border border-slate-200"
                >
                  <button
                    onClick={() => setOpenSchema(isOpen ? null : entry.schema)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                      <span className="truncate text-sm font-medium text-slate-800">
                        {entry.schema}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-600">
                      {entry.table_count}
                    </span>
                  </button>

                  {entry.error && (
                    <p className="mx-3 mb-2 rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-700">
                      {entry.error}
                    </p>
                  )}

                  {isOpen && entry.tables.length > 0 && (
                    <ul className="border-t border-slate-100 px-2 py-2">
                      {entry.tables.map((table) => {
                        const isSelected =
                          activeTable?.schema === entry.schema &&
                          activeTable?.table === table;
                        return (
                          <li key={table}>
                            <button
                              onClick={() =>
                                setActiveTable({
                                  schema: entry.schema,
                                  table,
                                })
                              }
                              className={`w-full truncate rounded-lg px-3 py-1.5 text-left font-mono text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                                isSelected
                                  ? "bg-cyan-50 text-cyan-800"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {table}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Columns</h3>
            {columnsFetching && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
            )}
          </div>

          {!activeTable && (
            <p className="py-6 text-center text-sm text-slate-500">
              Select a table to inspect its columns.
            </p>
          )}

          {activeTable && columns && (
            <>
              <p className="mb-2 truncate font-mono text-xs text-slate-500">
                {activeTable.schema}.{activeTable.table}
                <span className="ml-2 tabular-nums">
                  ({columns.column_count})
                </span>
              </p>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <tbody>
                    {columns.columns.map((column) => (
                      <tr
                        key={column.name}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-1.5 pr-2 font-mono text-slate-800">
                          {column.name}
                        </td>
                        <td className="py-1.5 text-right font-mono text-slate-500">
                          {column.type}
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
