"use client";

import { BookOpen, FileSpreadsheet, FileText, FolderArchive, Rows3 } from "lucide-react";
import type { ExportOptions } from "@/types/exports";
import { formatCompact, formatDateTime } from "./profile/profileUtils";

interface DownloadContentsProps {
  options: ExportOptions | undefined;
  loading: boolean;
}

const FILE_NOTES: Record<string, { icon: typeof FileText; note: string }> = {
  "catalogue.xlsx": {
    icon: FileSpreadsheet,
    note: "Every exported column with its statistics: completeness, distinct values, ranges and common values",
  },
  "data_dictionary.xlsx": {
    icon: BookOpen,
    note: "Each variable's column name, type and description",
  },
};

/**
 * What the download contains: one zip with the data, a catalogue and a data
 * dictionary, and how its rows are laid out. Before a dataset's export is
 * built the server sends a plain CSV instead.
 */
export default function DownloadContents({ options, loading }: DownloadContentsProps) {
  if (loading) {
    return (
      <div className="animate-pulse motion-reduce:animate-none space-y-3" aria-busy="true">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-40 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const ready = !!options?.available && options.files.length > 0;
  const counts: [string, number | null | undefined][] = [
    ["Rows", options?.row_count],
    ["Patients", options?.patient_count],
    ["Visits", options?.visit_count],
    ["Columns", options?.column_count],
  ];
  const shownCounts = counts.filter(([, v]) => v != null);

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-5">
      <p className="font-semibold text-[#24408E]">What you&apos;ll receive</p>

      {ready && options ? (
        <>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <FolderArchive className="h-4 w-4 text-[#00B9F1]" aria-hidden />
            <span>One .zip file containing:</span>
          </div>
          <ul className="mt-3 space-y-3 text-sm">
            {options.files.map((file) => {
              const extra = FILE_NOTES[file];
              const Icon = extra?.icon ?? FileText;
              return (
                <li key={file} className="flex gap-2.5">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-[#24408E]" aria-hidden />
                  <span className="min-w-0">
                    <code className="font-mono text-[13px] text-slate-800">{file}</code>
                    <span className="block text-xs text-slate-500">
                      {extra?.note ?? "The data, limited to the variables you were approved for"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {shownCounts.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-3 sm:grid-cols-4">
              {shownCounts.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[11px] text-slate-500">{k}</dt>
                  <dd className="text-sm font-semibold text-[#1C2E5E] truncate">{formatCompact(v)}</dd>
                </div>
              ))}
            </dl>
          )}

          {options.built_at && (
            <p className="mt-2 text-[11px] text-slate-500">
              Export last built {formatDateTime(options.built_at)}.
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 flex items-start gap-2 text-sm text-slate-700">
          <FileText className="h-4 w-4 mt-0.5 shrink-0 text-[#24408E]" aria-hidden />
          <span>One CSV file with the variables you were approved for.</span>
        </div>
      )}

      {options?.description && (
        <div className="mt-4 flex gap-2.5 rounded-lg bg-blue-50/70 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
          <Rows3 className="h-4 w-4 mt-0.5 shrink-0 text-[#24408E]" aria-hidden />
          <p>
            <span className="font-medium text-[#24408E]">Row layout: </span>
            {options.description}
          </p>
        </div>
      )}
    </div>
  );
}
