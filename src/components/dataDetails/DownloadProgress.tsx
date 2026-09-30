"use client";

import { useEffect, useState } from "react";

interface DownloadProgressProps {
  /** Bytes received so far. */
  loaded: number;
  /** Estimated total from the dataset's last download, or null when there is none. */
  expected: number | null;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};

/**
 * Progress of a download. The zip streams without a known size, so the total
 * is an estimate: the bar stops at 99% until the file is saved. With no
 * estimate it shows a moving bar and the amount received. Before the first
 * byte the server is still preparing the files (catalogue, dictionary).
 */
export default function DownloadProgress({ loaded, expected }: DownloadProgressProps) {
  const preparing = loaded === 0;

  // Most of a small export's wait is before the first byte, so count the
  // seconds there to show it is still working.
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!preparing) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [preparing]);

  const pct = expected && !preparing ? Math.min(99, Math.round((loaded / expected) * 100)) : null;

  const label = preparing
    ? "Preparing your files…"
    : pct != null
      ? loaded > expected!
        ? `${formatBytes(loaded)}, almost done…`
        : `${formatBytes(loaded)} of ~${formatBytes(expected!)}`
      : `${formatBytes(loaded)} received`;

  return (
    <div className="rounded-lg bg-[#24408E] p-4 text-white" role="status" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">Downloading</span>
        <span className="tabular-nums text-white/80">
          {label}
          {/* Hidden from screen readers so the live region does not announce every second. */}
          {preparing && <span aria-hidden> {seconds}s</span>}
          {pct != null && <span className="ml-2 font-semibold text-white">{pct}%</span>}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-label="Download progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        {pct != null ? (
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00B9F1] to-white transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        ) : (
          // No total to measure against: a pulsing bar shows it is still working.
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#00B9F1] to-white animate-pulse motion-reduce:animate-none" />
        )}
      </div>
    </div>
  );
}
