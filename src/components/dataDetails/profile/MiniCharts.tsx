"use client";

// Lightweight div-based mini charts for the column profile. A wide flat can
// show hundreds of these, so no canvas / chart.js instances here: single-hue
// bars in brand navy, a 2px surface gap between touching bars, and a hover
// readout in text ink (never the data colour).

import { useState } from "react";
import type { ColumnProfile, ColumnQuantiles, TopValue } from "@/types/exports";
import {
  completeness,
  formatCount,
  formatPct,
  formatStat,
  rebinHistogram,
} from "./profileUtils";

const NAVY = "#24408E";

// ---------------------------------------------------------------- completeness

export function CompletenessBar({
  pct,
  compact = false,
}: {
  pct: number | null;
  compact?: boolean;
}) {
  if (pct == null) {
    return <span className="text-xs text-slate-400">Completeness unknown</span>;
  }
  const sparse = pct < 50;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="relative h-1.5 flex-1 rounded-full bg-[#E3ECF7] overflow-hidden"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Completeness"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${sparse ? "bg-amber-500" : "bg-[#24408E]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs tabular-nums shrink-0 ${compact ? "w-11" : "w-12"} text-right ${
          sparse ? "text-amber-700 font-medium" : "text-slate-600"
        }`}
      >
        {formatPct(pct)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- histogram

export function MiniHistogram({ column }: { column: ColumnProfile }) {
  const [hover, setHover] = useState<number | null>(null);
  const min = typeof column.min === "number" ? column.min : null;
  const max = typeof column.max === "number" ? column.max : null;
  const bins = rebinHistogram(column.histogram ?? [], min, max);
  if (!bins.length) return <NoDistribution />;

  const peak = Math.max(...bins.map((b) => b.count), 1);
  const total = bins.reduce((s, b) => s + b.count, 0);
  const active = hover != null ? bins[hover] : null;

  return (
    <div className="min-w-0">
      <div
        className="flex items-end gap-[2px] h-12"
        onMouseLeave={() => setHover(null)}
        aria-label={`Distribution of ${column.label || column.name}`}
        role="img"
      >
        {bins.map((b, i) => {
          const h = b.count === 0 ? 0 : Math.max(4, (b.count / peak) * 100);
          return (
            <div
              key={i}
              className="flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setHover(i)}
            >
              <div
                className="w-full rounded-t-[3px] transition-colors"
                style={{
                  height: `${h}%`,
                  backgroundColor: hover === i ? "#00B9F1" : NAVY,
                  opacity: hover == null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="h-px bg-slate-200" />
      <RangeTrack quantiles={column.quantiles} min={min} max={max} />
      <p className="mt-1 h-4 text-[11px] leading-4 text-slate-500 tabular-nums truncate">
        {active
          ? `${formatStat(active.lo)} to ${formatStat(active.hi)}: ${formatCount(active.count)} rows (${formatPct(
              total ? (active.count / total) * 100 : 0
            )})`
          : "Hover the bars for counts"}
      </p>
    </div>
  );
}

/** min … max track with the p05–p95 band and a median tick, same x-scale as the bins. */
function RangeTrack({
  quantiles,
  min,
  max,
}: {
  quantiles: ColumnQuantiles | null;
  min: number | null;
  max: number | null;
}) {
  if (min == null || max == null || !(max > min) || !quantiles) return null;
  const pos = (v: number | null) =>
    v == null ? null : Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const p05 = pos(quantiles.p05);
  const p95 = pos(quantiles.p95);
  const p50 = pos(quantiles.p50);
  return (
    <div
      className="relative h-3 mt-1"
      title={`Middle 90% of values: ${formatStat(quantiles.p05)} to ${formatStat(quantiles.p95)}`}
    >
      {p05 != null && p95 != null && (
        <div
          className="absolute top-1 h-1 rounded-full bg-[#24408E]/25"
          style={{ left: `${p05}%`, width: `${Math.max(1, p95 - p05)}%` }}
        />
      )}
      {p50 != null && (
        <div
          className="absolute top-0 h-3 w-[2px] rounded-full bg-[#24408E]"
          style={{ left: `calc(${p50}% - 1px)` }}
        />
      )}
    </div>
  );
}

export function NumericStats({ column }: { column: ColumnProfile }) {
  const q = column.quantiles;
  const cells: [string, number | string | null][] = [
    ["Min", column.min],
    ["Median", q?.p50 ?? null],
    ["Mean", column.mean],
    ["Max", column.max],
  ];
  return (
    <div className="mt-1">
      <dl className="grid grid-cols-4 gap-2">
        {cells.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] text-slate-500">{k}</dt>
            <dd className="text-xs font-medium text-slate-800 tabular-nums truncate">
              {formatStat(v)}
            </dd>
          </div>
        ))}
      </dl>
      {q && (q.p05 != null || q.p95 != null) && (
        <p className="mt-1 text-[11px] text-slate-500">
          Middle 90%:{" "}
          <span className="tabular-nums text-slate-700">
            {formatStat(q.p05)} to {formatStat(q.p95)}
          </span>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- top values

const valueLabel = (v: TopValue["value"]) =>
  v == null ? "(empty)" : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);

export function TopValues({
  values,
  total,
  limit,
}: {
  values: TopValue[];
  total: number | null;
  limit?: number;
}) {
  const shown = limit ? values.slice(0, limit) : values;
  if (!shown.length) return <NoDistribution text="No values to show" />;
  const peak = Math.max(...shown.map((v) => v.count), 1);
  return (
    <ul className="space-y-1">
      {shown.map((v, i) => {
        const label = valueLabel(v.value);
        const share = total ? (v.count / total) * 100 : null;
        return (
          <li
            key={`${label}-${i}`}
            className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-2 text-xs"
            title={`${label}: ${formatCount(v.count)} rows${share != null ? ` (${formatPct(share)} of all rows)` : ""}`}
          >
            <span className="truncate text-slate-700">{label}</span>
            <span className="h-2.5 rounded-r-[3px] bg-[#E3ECF7]/60">
              <span
                className="block h-full rounded-r-[3px] bg-[#24408E]"
                style={{ width: `${Math.max(1.5, (v.count / peak) * 100)}%` }}
              />
            </span>
            <span className="tabular-nums text-slate-500 text-right whitespace-nowrap">
              {formatCount(v.count)}
              {share != null && <span className="ml-1 text-slate-400">{formatPct(share)}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- occurrences

/**
 * One column per occurrence, height = completeness. Shows at a glance how a
 * repeating variable thins out (Diagnosis_1 full, Diagnosis_12 nearly empty).
 */
export function OccurrenceStrip({ columns }: { columns: ColumnProfile[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover != null ? columns[hover] : null;
  return (
    <div className="min-w-0">
      <div
        className="flex items-end gap-[2px] h-10"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Completeness by occurrence"
      >
        {columns.map((c, i) => {
          const pct = completeness(c) ?? 0;
          return (
            <div
              key={c.name}
              className="flex-1 max-w-[18px] h-full flex items-end"
              onMouseEnter={() => setHover(i)}
            >
              <div
                className="w-full rounded-t-[3px] transition-colors"
                style={{
                  height: `${pct === 0 ? 0 : Math.max(6, pct)}%`,
                  backgroundColor: hover === i ? "#00B9F1" : pct < 50 ? "#F59E0B" : NAVY,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="h-px bg-slate-200" />
      <p className="mt-1 h-4 text-[11px] leading-4 text-slate-500 tabular-nums truncate">
        {active
          ? `${active.name}:${formatPct(completeness(active))} complete`
          : `Completeness of occurrences 1 to ${columns.length}`}
      </p>
    </div>
  );
}

export function NoDistribution({ text = "No distribution available" }: { text?: string }) {
  return <p className="text-xs text-slate-400 italic">{text}</p>;
}
