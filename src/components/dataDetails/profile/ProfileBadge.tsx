"use client";

import { ChartNoAxesColumn } from "lucide-react";

/**
 * Small catalogue badge for a dataset with a generated data profile. The
 * tooltip uses a named group so it answers only to the badge, not to a hover
 * on the card around it.
 */
export default function ProfileBadge({ className = "" }: { className?: string }) {
  return (
    <span
      tabIndex={0}
      aria-label="Data profile available"
      className={`group/profile relative inline-flex shrink-0 items-center gap-1 rounded-full border border-[#00B9F1]/30 bg-gradient-to-r from-cyan-50 to-blue-50 px-2 py-0.5 text-[11px] font-medium text-[#24408E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B9F1] ${className}`}
    >
      <ChartNoAxesColumn className="h-3 w-3" aria-hidden />
      Profile
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-normal text-white opacity-0 transition-opacity group-hover/profile:opacity-100 group-focus-visible/profile:opacity-100"
      >
        Data profiles available
      </span>
    </span>
  );
}
