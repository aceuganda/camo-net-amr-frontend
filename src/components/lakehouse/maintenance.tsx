"use client";

/**
 * Super-admin maintenance for the flat export schema.
 *
 * The schema's storage location is fixed when it is created. On the cluster
 * the catalog is on Hive Metastore, and a schema created without a location
 * ends up on the Trino node's local disk, where every flat build then fails
 * writing Iceberg metadata. This panel runs exactly two fixed operations
 * through the API -- inspect the schema, and drop-and-recreate it in the
 * warehouse -- so nobody needs a route into Trino to fix that.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RefreshCw,
  Wrench,
} from "lucide-react";

import {
  repairExportSchema,
  useExportSchemaStatus,
  type ExportSchemaStatus,
} from "@/lib/hooks/useLakehouse";

const errorText = (error: any, fallback: string) =>
  error?.response?.data?.detail ?? error?.message ?? fallback;

const stamp = () => new Date().toLocaleTimeString();

type Line = { at: string; kind: "cmd" | "out" | "err"; text: string };

const statusLines = (status: ExportSchemaStatus): Line[] => {
  const lines: Line[] = [];
  const out = (text: string) => lines.push({ at: stamp(), kind: "out", text });
  const err = (text: string) => lines.push({ at: stamp(), kind: "err", text });

  out(`schema    ${status.catalog}.${status.schema}`);
  out(`exists    ${status.exists ? "yes" : "no"}`);
  out(`location  ${status.location ?? "(none)"}`);
  out(`expected  ${status.expected_location ?? "(TRINO_EXPORT_LOCATION unset)"}`);
  if (status.ddl) {
    status.ddl.split("\n").forEach((row) => out(`  ${row}`));
  }
  if (status.dropped_tables) {
    out(`dropped   ${status.dropped_tables.length} table(s)`);
    status.dropped_tables.forEach((table) => out(`  - ${table}`));
  }
  if (status.healthy) {
    out("status    OK");
  } else {
    err(`status    ${status.problem ?? "unhealthy"}`);
  }
  return lines;
};

export default function LakehouseMaintenance() {
  const queryClient = useQueryClient();
  const [log, setLog] = useState<Line[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const append = (lines: Line[]) => setLog((prev) => [...prev, ...lines]);

  const {
    data: statusResponse,
    isFetching,
    refetch,
  } = useExportSchemaStatus();
  const status = statusResponse?.data;

  const check = async () => {
    append([{ at: stamp(), kind: "cmd", text: "SHOW CREATE SCHEMA" }]);
    try {
      const result = await refetch({ throwOnError: true });
      if (result.data?.data) append(statusLines(result.data.data));
    } catch (error: any) {
      append([{ at: stamp(), kind: "err", text: errorText(error, "Check failed") }]);
    }
  };

  const repair = useMutation({
    mutationFn: repairExportSchema,
    onMutate: () => {
      append([
        {
          at: stamp(),
          kind: "cmd",
          text: "DROP TABLE ... ; DROP SCHEMA ; CREATE SCHEMA WITH (location = ...)",
        },
      ]);
    },
    onSuccess: (result) => {
      append(statusLines(result));
      setConfirmText("");
      queryClient.invalidateQueries({ queryKey: ["lakehouse_export_schema"] });
      queryClient.invalidateQueries({ queryKey: ["lakehouse_flats"] });
      toast.success("Export schema recreated");
    },
    onError: (error: any) => {
      const text = errorText(error, "Recreate failed");
      append([{ at: stamp(), kind: "err", text }]);
      toast.error(text);
    },
  });

  const schemaName = status ? `${status.catalog}.${status.schema}` : "";
  const canRepair =
    !!status &&
    !!status.expected_location &&
    confirmText.trim() === schemaName &&
    !repair.isPending;

  return (
    <div className="space-y-4">
      {/* Status --------------------------------------------------------- */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Wrench className="h-4 w-4 text-cyan-600" />
              Export schema
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Where flat tables are written. Must be in the warehouse, not on
              the Trino node&apos;s disk.
            </p>
          </div>
          <button
            onClick={check}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-cyan-700 disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Check
          </button>
        </div>

        {status && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border p-3 text-sm ${
              status.healthy
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {status.healthy ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {status.healthy ? "Schema is in the warehouse" : status.problem}
              </p>
              <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
                <dt className="text-slate-500">Current</dt>
                <dd className="break-all font-mono">{status.location ?? "—"}</dd>
                <dt className="text-slate-500">Expected</dt>
                <dd className="break-all font-mono">
                  {status.expected_location ?? "TRINO_EXPORT_LOCATION unset"}
                </dd>
              </dl>
            </div>
          </div>
        )}
      </section>

      {/* Terminal ------------------------------------------------------- */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span className="font-mono">trino · {schemaName || "export schema"}</span>
          <button
            onClick={() => setLog([])}
            className="rounded px-2 py-0.5 transition hover:bg-slate-800 hover:text-slate-200"
          >
            clear
          </button>
        </div>
        <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-5 text-slate-200">
          {log.length === 0 ? (
            <span className="text-slate-500">
              Press Check to inspect the schema. Output appears here.
            </span>
          ) : (
            log.map((line, index) => (
              <div
                key={index}
                className={
                  line.kind === "cmd"
                    ? "text-cyan-300"
                    : line.kind === "err"
                    ? "text-rose-300"
                    : ""
                }
              >
                <span className="select-none text-slate-600">{line.at} </span>
                {line.kind === "cmd" ? "$ " : "  "}
                {line.text}
              </div>
            ))
          )}
        </pre>
      </section>

      {/* Repair --------------------------------------------------------- */}
      <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm sm:p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-900">
          <AlertTriangle className="h-4 w-4" />
          Recreate schema in the warehouse
        </h3>
        <p className="mt-1 text-sm text-rose-900/80">
          Drops <strong>every flat table</strong> and the schema, then recreates
          the schema at the configured location. Flats rebuild from the
          warehouse afterwards; downloads that depend on them fail until they
          do. Refused while any build is running.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={schemaName ? `Type ${schemaName} to confirm` : "Run Check first"}
            disabled={!status}
            className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50 sm:max-w-xs"
          />
          <button
            onClick={() => repair.mutate()}
            disabled={!canRepair}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {repair.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wrench className="h-4 w-4" />
            )}
            Drop &amp; recreate
          </button>
        </div>
        {status && !status.expected_location && (
          <p className="mt-2 text-xs text-rose-800">
            TRINO_EXPORT_LOCATION is not set on the API, so recreating would put
            the schema back on local disk. Set it in the API config first.
          </p>
        )}
      </section>
    </div>
  );
}
