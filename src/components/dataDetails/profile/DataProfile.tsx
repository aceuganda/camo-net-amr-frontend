"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Info, LoaderCircle, RefreshCw, Search, TriangleAlert, X } from "lucide-react";
import { useColumnProfile, useExportOptions } from "@/lib/hooks/useExports";
import type { ColumnKind, ColumnProfile, ExportOptions, FlatProfile } from "@/types/exports";
import { ColumnGroupRow, ColumnRow } from "./ColumnRows";
import {
  KIND_LABEL,
  KIND_ORDER,
  formatCompact,
  formatDateTime,
  formatPct,
  groupColumns,
  matchesSearch,
  meanCompleteness,
  type ProfileEntry,
} from "./profileUtils";

const PAGE = 25;

interface DataProfileProps {
  /** Dataset key used by the export endpoints (data_set.db_name). */
  source: string;
}

export default function DataProfile({ source }: DataProfileProps) {
  const options = useExportOptions(source);
  const profile = useColumnProfile(source, { enabled: !options.isLoading });
  const [sectionIdx, setSectionIdx] = useState(0);

  const flats = profile.data?.status === "ready" ? profile.data.flats : [];
  const flat = flats[Math.min(sectionIdx, Math.max(0, flats.length - 1))] ?? null;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#24408E]">Data profile</h3>
        <p className="text-sm text-slate-600 mt-0.5 max-w-prose">
          Completeness, value ranges and common values for every variable, so you can judge fit
          before downloading.
        </p>
        {options.data?.description && (
          <p className="mt-2 max-w-prose rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-slate-600 leading-relaxed">
            <span className="font-medium text-[#24408E]">Row layout: </span>
            {options.data.description}
          </p>
        )}
        {options.data?.currency_note && (
          <p className="mt-2 max-w-prose rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-slate-600 leading-relaxed">
            <span className="font-medium text-amber-800">Currency: </span>
            {options.data.currency_note}
          </p>
        )}
      </div>

      {(options.isLoading || profile.isLoading) && <ProfileSkeleton />}

      {profile.isError && !profile.data && (
        <StateBox tone="error" title="The data profile could not be loaded">
          <p>Check your connection, then try again.</p>
          <RetryButton onClick={() => profile.refetch()} busy={profile.isFetching} label="Try again" />
        </StateBox>
      )}

      {profile.data?.status === "pending" && (
        <StateBox
          tone="info"
          icon={
            profile.pollingStopped ? (
              <Info className="h-5 w-5" />
            ) : (
              <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" />
            )
          }
          title={
            profile.pollingStopped
              ? "The profile is still being computed"
              : "The profile is being computed…"
          }
        >
          {profile.pollingStopped ? (
            <>
              <p>This can take a few minutes for large datasets.</p>
              <RetryButton onClick={() => profile.refetch()} busy={profile.isFetching} label="Check again" />
            </>
          ) : (
            <p>This page checks again every 10 seconds and updates on its own.</p>
          )}
        </StateBox>
      )}

      {profile.data?.status === "unavailable" && (
        <StateBox tone="muted" title="No data profile for this dataset yet">
          <p>{profile.data.message || "The export files for this dataset have not been built."}</p>
        </StateBox>
      )}

      {profile.data?.status === "ready" && flats.length === 0 && (
        <StateBox tone="muted" title="No variables to profile">
          <p>This dataset's export has no columns you can view.</p>
        </StateBox>
      )}

      {flat && (
        <>
          {flats.length > 1 && (
            <SectionPicker flats={flats} value={flats.indexOf(flat)} onChange={setSectionIdx} />
          )}
          <SummaryStrip
            flat={flat}
            options={options.data}
            multiSection={flats.length > 1}
            minCellCount={profile.data?.min_cell_count ?? null}
          />
          {/* Re-mount the list when the section changes so filters and paging reset. */}
          <ColumnList key={flat.table} flat={flat} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- summary

function SummaryStrip({
  flat,
  options,
  multiSection,
  minCellCount,
}: {
  flat: FlatProfile;
  options: ExportOptions | undefined;
  /** Several sections (economic): patient / visit counts do not apply to one. */
  multiSection: boolean;
  minCellCount: number | null;
}) {
  const overall = meanCompleteness(flat.columns);
  const items: { label: string; value: string; hint?: string }[] = [
    { label: "Rows", value: formatCompact(flat.row_count ?? options?.row_count) },
    ...(multiSection
      ? []
      : [
          { label: "Patients", value: formatCompact(options?.patient_count) },
          { label: "Visits", value: formatCompact(options?.visit_count) },
        ]),
    { label: "Variables", value: formatCompact(flat.columns.length) },
    {
      label: "Completeness",
      value: formatPct(overall),
      hint: "Average share of non-empty cells per variable",
    },
  ];

  return (
    <section
      aria-label="Profile summary"
      className="rounded-xl border border-[#24408E]/10 bg-gradient-to-r from-[#24408E]/[0.045] via-white to-[#00B9F1]/[0.06] mb-5"
    >
      {multiSection && (
        <p className="border-b border-slate-200/70 px-4 py-2 text-xs font-medium text-[#1C2E5E]">
          {flat.section_title || flat.table}
        </p>
      )}
      <dl
        className={`grid grid-cols-2 sm:grid-cols-3 ${
          items.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3"
        } divide-slate-200/80 [&>div]:px-4 [&>div]:py-3 lg:divide-x`}
      >
        {items.map((it) => (
          <div key={it.label} title={it.hint}>
            <dt className="text-xs text-slate-500">{it.label}</dt>
            <dd className="text-xl font-semibold text-[#1C2E5E]">{it.value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-slate-200/70 px-4 py-2 text-[11px] text-slate-500 leading-relaxed">
        Computed {formatDateTime(flat.computed_at)}. Distinct counts are approximate.
        {minCellCount != null &&
          ` Values seen fewer than ${minCellCount} times are withheld to protect privacy.`}
      </p>
    </section>
  );
}

function SectionPicker({
  flats,
  value,
  onChange,
}: {
  flats: FlatProfile[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs text-slate-500 mb-2">
        This dataset has {flats.length} sections. Choose one to see its variables.
      </p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dataset sections">
        {flats.map((f, i) => {
          const active = i === value;
          return (
            <button
              key={f.table}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1] ${
                active
                  ? "border-[#24408E] bg-[#24408E] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#00B9F1]"
              }`}
            >
              {f.section_title || f.section || f.table}
              <span className={`ml-2 text-xs tabular-nums ${active ? "text-white/70" : "text-slate-400"}`}>
                {f.columns.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- column list

type KindFilter = ColumnKind | "all";

function ColumnList({ flat }: { flat: FlatProfile }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [visible, setVisible] = useState(PAGE);
  const deferredSearch = useDeferredValue(search);
  const q = deferredSearch.trim().toLowerCase();

  const entries = useMemo(() => groupColumns(flat.columns), [flat.columns]);

  const kindCounts = useMemo(() => {
    const m = new Map<ColumnKind, number>();
    for (const c of flat.columns) m.set(c.kind, (m.get(c.kind) ?? 0) + 1);
    return m;
  }, [flat.columns]);

  const filtered = useMemo(() => {
    const out: { entry: ProfileEntry; visibleCols: ColumnProfile[] }[] = [];
    for (const e of entries) {
      if (e.type === "column") {
        if ((kind === "all" || e.column.kind === kind) && matchesSearch(e.column, q)) {
          out.push({ entry: e, visibleCols: [e.column] });
        }
        continue;
      }
      const baseHit = !q || e.base.toLowerCase().includes(q) || e.label.toLowerCase().includes(q);
      const cols = e.columns.filter(
        (c) => (kind === "all" || c.kind === kind) && (baseHit || matchesSearch(c, q))
      );
      if (cols.length) out.push({ entry: e, visibleCols: cols });
    }
    return out;
  }, [entries, kind, q]);

  const matchedColumns = filtered.reduce((s, f) => s + f.visibleCols.length, 0);
  const groupCount = entries.filter((e) => e.type === "group").length;
  const filtering = q !== "" || kind !== "all";

  const updateSearch = (v: string) => {
    setSearch(v);
    setVisible(PAGE);
  };
  const updateKind = (k: KindFilter) => {
    setKind(k);
    setVisible(PAGE);
  };

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-3">
        <label className="relative block lg:w-80">
          <span className="sr-only">Search columns</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search columns"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00B9F1]"
          />
          {search && (
            <button
              type="button"
              onClick={() => updateSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by column type">
          <KindChip active={kind === "all"} onClick={() => updateKind("all")} label="All" count={flat.columns.length} />
          {KIND_ORDER.filter((k) => kindCounts.has(k)).map((k) => (
            <KindChip
              key={k}
              active={kind === k}
              onClick={() => updateKind(k)}
              label={KIND_LABEL[k]}
              count={kindCounts.get(k) ?? 0}
            />
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs text-slate-500" aria-live="polite">
        {filtering
          ? `${matchedColumns} of ${flat.columns.length} columns match`
          : `${flat.columns.length} columns`}
        {groupCount > 0 &&
          `, with repeating fields folded into ${groupCount} group${groupCount === 1 ? "" : "s"}`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No columns match these filters</p>
          <button
            type="button"
            onClick={() => {
              updateSearch("");
              updateKind("all");
            }}
            className="mt-2 text-sm font-medium text-[#0090bd] hover:text-[#24408E]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,1.5fr)_1.25rem] gap-x-6 border-b border-slate-200 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500">
            <span>Column</span>
            <span>Completeness</span>
            <span>Distribution</span>
            <span />
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.slice(0, visible).map(({ entry, visibleCols }) =>
              entry.type === "column" ? (
                <ColumnRow key={entry.key} column={entry.column} rowCount={flat.row_count} />
              ) : (
                <ColumnGroupRow
                  key={entry.key}
                  base={entry.base}
                  label={entry.label}
                  columns={entry.columns}
                  visible={visibleCols}
                  rowCount={flat.row_count}
                  forceOpen={q !== "" && visibleCols.length !== entry.columns.length}
                />
              )
            )}
          </ul>
          {filtered.length > visible && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-lg border border-[#24408E]/20 bg-white px-4 py-2 text-sm font-medium text-[#24408E] hover:border-[#00B9F1] hover:text-[#0090bd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1]"
              >
                Show {Math.min(PAGE, filtered.length - visible)} more
                <span className="ml-1 font-normal text-slate-500">
                  ({filtered.length - visible} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KindChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1] ${
        active
          ? "border-transparent bg-gradient-to-r from-[#00B9F1] to-[#24408E] text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-600 hover:border-[#00B9F1] hover:text-[#0090bd]"
      }`}
    >
      {label}
      <span className={`ml-1.5 tabular-nums ${active ? "text-white/75" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}

// ---------------------------------------------------------------- states

function StateBox({
  tone,
  title,
  icon,
  children,
}: {
  tone: "info" | "muted" | "error";
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const styles = {
    info: "border-[#00B9F1]/30 bg-gradient-to-r from-blue-50 to-cyan-50 text-[#24408E]",
    muted: "border-slate-200 bg-slate-50 text-slate-700",
    error: "border-red-200 bg-red-50 text-red-700",
  }[tone];
  const defaultIcon =
    tone === "error" ? <TriangleAlert className="h-5 w-5" /> : <Info className="h-5 w-5" />;
  return (
    <div className={`flex gap-3 rounded-xl border p-5 ${styles}`} role={tone === "error" ? "alert" : "status"}>
      <span className="mt-0.5 shrink-0">{icon ?? defaultIcon}</span>
      <div className="space-y-2 text-sm">
        <p className="font-semibold">{title}</p>
        <div className="space-y-3 opacity-90">{children}</div>
      </div>
    </div>
  );
}

function RetryButton({ onClick, busy, label }: { onClick: () => void; busy: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-current/20 bg-white px-3 py-1.5 text-sm font-medium hover:shadow-sm disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin motion-reduce:animate-none" : ""}`} />
      {label}
    </button>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading data profile" className="animate-pulse motion-reduce:animate-none">
      <div className="h-20 rounded-xl bg-slate-200/60 mb-5" />
      <div className="h-9 w-80 max-w-full rounded-lg bg-slate-200/60 mb-3" />
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid md:grid-cols-[1.15fr_0.8fr_1.5fr] gap-6 px-4 py-4">
            <div className="space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
            <div className="h-2 self-center rounded-full bg-slate-100" />
            <div className="flex items-end gap-[2px] h-10">
              {Array.from({ length: 16 }, (_, j) => (
                <div key={j} className="flex-1 rounded-t-[3px] bg-slate-100" style={{ height: `${25 + ((j * 37 + i * 11) % 70)}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

