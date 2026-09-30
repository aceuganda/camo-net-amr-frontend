"use client";

import { memo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Fingerprint,
  Hash,
  Layers,
  Tags,
  ToggleLeft,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { ColumnKind, ColumnProfile } from "@/types/exports";
import {
  CompletenessBar,
  MiniHistogram,
  NoDistribution,
  NumericStats,
  OccurrenceStrip,
  TopValues,
} from "./MiniCharts";
import {
  KIND_LABEL,
  columnTotal,
  completeness,
  formatCompact,
  formatCount,
  formatDate,
  formatPct,
  formatSpan,
  formatStat,
  meanCompleteness,
} from "./profileUtils";

const KIND_ICON: Record<ColumnKind, LucideIcon> = {
  numeric: Hash,
  categorical: Tags,
  boolean: ToggleLeft,
  temporal: CalendarDays,
  text: Type,
  identifier: Fingerprint,
};

export function KindBadge({ kind }: { kind: ColumnKind }) {
  const Icon = KIND_ICON[kind] ?? Type;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#24408E]/15 bg-[#24408E]/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-[#24408E]">
      <Icon className="h-3 w-3" aria-hidden />
      {KIND_LABEL[kind] ?? kind}
    </span>
  );
}

// Shared grid: identity | completeness | distribution | chevron
const ROW_GRID =
  "grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,1.5fr)_1.25rem] gap-x-6 gap-y-3";

interface ColumnRowProps {
  column: ColumnProfile;
  rowCount: number | null;
  /** Inside an occurrence group: show the occurrence number instead of the label. */
  nested?: boolean;
}

export const ColumnRow = memo(function ColumnRow({
  column,
  rowCount,
  nested = false,
}: ColumnRowProps) {
  const [open, setOpen] = useState(false);
  const total = columnTotal(column, rowCount);
  const label = column.label?.trim() || column.name;

  return (
    <li className={nested ? "border-t border-slate-100 first:border-t-0" : ""}>
      <div
        className={`${ROW_GRID} px-4 py-3.5 transition-colors ${
          open ? "bg-[#F4F8FD]" : "hover:bg-slate-50/70"
        }`}
      >
        {/* identity */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-w-0 self-start text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1]"
          title={column.description ?? undefined}
        >
          <span className="block truncate text-sm font-semibold text-[#1C2E5E]">
            {nested && column.occurrence != null ? `Occurrence ${column.occurrence}` : label}
          </span>
          <span className="mt-0.5 flex items-center gap-2 min-w-0">
            <code className="truncate font-mono text-[11px] text-slate-500">{column.name}</code>
            <KindBadge kind={column.kind} />
          </span>
          {!nested && column.description && (
            <span className="mt-1 block truncate text-xs text-slate-500">{column.description}</span>
          )}
        </button>

        {/* completeness + distinct */}
        <div className="min-w-0 self-start pt-1 space-y-1.5">
          <CompletenessBar pct={completeness(column)} />
          <p className="text-[11px] text-slate-500 tabular-nums">
            {column.distinct != null ? (
              <span title="Approximate distinct count">≈ {formatCompact(column.distinct)} distinct</span>
            ) : (
              "Distinct count unknown"
            )}
            {column.null_count != null && column.null_count > 0 && (
              <span className="ml-2 text-slate-400">{formatCompact(column.null_count)} empty</span>
            )}
          </p>
        </div>

        {/* distribution */}
        <div className="min-w-0">
          <Distribution column={column} total={total} limit={open ? undefined : 4} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? `Hide details for ${column.name}` : `Show details for ${column.name}`}
          className="hidden md:flex items-start justify-center pt-1 text-slate-400 hover:text-[#24408E] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1]"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && <ColumnDetails column={column} total={total} />}
    </li>
  );
});

function Distribution({
  column,
  total,
  limit,
}: {
  column: ColumnProfile;
  total: number | null;
  limit?: number;
}) {
  switch (column.kind) {
    case "numeric":
      return (
        <>
          <MiniHistogram column={column} />
          <NumericStats column={column} />
        </>
      );
    case "categorical":
    case "boolean":
      return (
        <div>
          {column.top_values?.length ? (
            <TopValues values={column.top_values} total={total} limit={limit} />
          ) : (
            <NoDistribution text="No frequent values to show" />
          )}
          <SuppressionNote column={column} shownAll={limit == null} />
        </div>
      );
    case "temporal": {
      const span = formatSpan(column.min, column.max);
      return (
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 tabular-nums">{formatDate(column.min)}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-[#24408E] to-[#00B9F1]" aria-hidden />
            <span className="font-medium text-slate-800 tabular-nums">{formatDate(column.max)}</span>
          </div>
          {span && <p className="mt-1 text-[11px] text-slate-500">Spans {span}</p>}
        </div>
      );
    }
    case "text":
    case "identifier":
    default:
      return (
        <p className="text-xs text-slate-500">
          {column.top_values_note ||
            (column.kind === "identifier"
              ? "Identifier: only counts are profiled."
              : "Free text: individual values are not listed.")}
        </p>
      );
  }
}

function SuppressionNote({ column, shownAll }: { column: ColumnProfile; shownAll: boolean }) {
  const hidden = shownAll ? 0 : Math.max(0, (column.top_values?.length ?? 0) - 4);
  if (!column.top_values_note && !hidden) return null;
  return (
    <p className="mt-1.5 text-[11px] text-slate-400">
      {hidden > 0 && <span>{hidden} more in details. </span>}
      {column.top_values_note}
    </p>
  );
}

function ColumnDetails({ column, total }: { column: ColumnProfile; total: number | null }) {
  const q = column.quantiles;
  const facts: [string, string][] = [
    ["Column", column.name],
    ["Storage type", column.sql_type],
    ["Recorded values", formatCount(column.non_null)],
    ["Empty", `${formatCount(column.null_count)} (${formatPct(column.null_pct)})`],
    ["Distinct (approx.)", formatCount(column.distinct)],
  ];
  if (column.kind === "numeric") {
    facts.push(["Std. deviation", formatStat(column.stddev)]);
    if (q) facts.push(["Quartiles (p25 / p75)", `${formatStat(q.p25)} / ${formatStat(q.p75)}`]);
  }
  if (column.base_variable && column.base_variable !== column.name) {
    facts.push(["Base variable", column.base_variable]);
  }
  if (total != null) facts.push(["Rows", formatCount(total)]);

  return (
    <div className="px-4 pb-4 bg-[#F4F8FD]">
      <div className="rounded-lg border border-[#24408E]/10 bg-white p-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold text-[#24408E]">Description</p>
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">
            {column.description || (
              <span className="text-slate-400">No description has been written for this column.</span>
            )}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {facts.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-slate-800 tabular-nums break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- groups

const GROUP_PAGE = 10;

interface GroupRowProps {
  base: string;
  label: string;
  columns: ColumnProfile[];
  rowCount: number | null;
  /** Columns in the group that match the current filters (subset of `columns`). */
  visible: ColumnProfile[];
  forceOpen: boolean;
}

export const ColumnGroupRow = memo(function ColumnGroupRow({
  base,
  label,
  columns,
  rowCount,
  visible,
  forceOpen,
}: GroupRowProps) {
  const [openState, setOpen] = useState(false);
  const [limit, setLimit] = useState(GROUP_PAGE);
  const open = forceOpen || openState;
  const kinds = Array.from(new Set(columns.map((c) => c.kind)));
  const mean = meanCompleteness(columns);
  const shown = visible.slice(0, limit);
  const filtered = visible.length !== columns.length;

  return (
    <li>
      <div className={`${ROW_GRID} px-4 py-3.5 ${open ? "bg-[#EEF4FC]" : "hover:bg-slate-50/70"}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-w-0 self-start text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1]"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 shrink-0 text-[#00B9F1]" aria-hidden />
            <span className="truncate text-sm font-semibold text-[#1C2E5E]">{label}</span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">
              {columns.length} occurrences
              {filtered && <span className="text-slate-400"> ({visible.length} match)</span>}
            </span>
            {kinds.map((k) => (
              <KindBadge key={k} kind={k} />
            ))}
          </span>
          <code className="mt-0.5 block truncate font-mono text-[11px] text-slate-500">
            {base}_{columns[0]?.occurrence} … {base}_{columns[columns.length - 1]?.occurrence}
          </code>
        </button>

        <div className="min-w-0 self-start pt-1 space-y-1.5">
          <CompletenessBar pct={mean} />
          <p className="text-[11px] text-slate-500">Average across occurrences</p>
        </div>

        <div className="min-w-0">
          <OccurrenceStrip columns={columns} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          className="hidden md:flex items-start justify-center pt-1 text-slate-400 hover:text-[#24408E] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1]"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="ml-4 md:ml-6 mb-2 border-l-2 border-[#00B9F1]/40">
          <ul>
            {shown.map((c) => (
              <ColumnRow key={c.name} column={c} rowCount={rowCount} nested />
            ))}
          </ul>
          {visible.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + GROUP_PAGE * 2)}
              className="ml-4 my-2 text-xs font-medium text-[#0090bd] hover:text-[#24408E]"
            >
              Show {Math.min(GROUP_PAGE * 2, visible.length - limit)} more of {visible.length - limit} remaining
            </button>
          )}
        </div>
      )}
    </li>
  );
});
