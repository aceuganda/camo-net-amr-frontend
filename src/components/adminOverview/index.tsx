"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  CheckCircle2,
  Database,
  Download,
  FileClock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useUserInfor } from "@/lib/hooks/useAuth";
import {
  useAdminActiveUsers,
  useAdminOverview,
  useAdminRecentRequests,
  useAdminRecentSubmissions,
  useAdminRecentUsers,
} from "@/lib/hooks/useAdmin";

const DotsLoader = dynamic(() => import("@/components/ui/dotsLoader"), {
  ssr: false,
});

const requestStatusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
] as const;

const globalRangeOptions = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Custom range", value: "custom" },
] as const;

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(value ?? 0);

/** Local calendar date (YYYY-MM-DD). toISOString() would shift the day for non-UTC users. */
const formatInputDate = (value: Date) => {
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const formatDate = (value: string | null) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusTone = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "denied":
      return "bg-red-100 text-red-700";
    case "requested":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border border-slate-200/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.05)] ${
        compact ? "p-3 sm:p-3.5" : "p-3.5 sm:p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p
            className={`mt-2 font-semibold text-slate-900 ${
              compact ? "text-[1.65rem] sm:text-[1.75rem]" : "text-[1.9rem]"
            }`}
          >
            {compactNumber(value)}
          </p>
          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{hint}</p>
        </div>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ${
            compact ? "h-9 w-9" : "h-10 w-10"
          }`}
        >
          <Icon className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
        </div>
      </div>
    </div>
  );
}

function SimpleList({
  title,
  subtitle,
  emptyText,
  items,
  actions,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  items: Array<{
    title: string;
    meta: string;
    value?: string;
    status?: { label: string; tone: string };
  }>;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="space-y-2.5">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            {emptyText}
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.meta}</p>
              </div>
              <div className="shrink-0 text-right">
                {item.value ? (
                  <p className="text-xs font-semibold text-slate-700">{item.value}</p>
                ) : null}
                {item.status ? (
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${item.status.tone}`}
                  >
                    {item.status.label}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminOverview() {
  const [globalRange, setGlobalRange] = useState("30");
  const [recentRequestsStatus, setRecentRequestsStatus] = useState("all");
  const [customFrom, setCustomFrom] = useState(formatInputDate(daysAgo(29)));
  const [customTo, setCustomTo] = useState(formatInputDate(new Date()));
  const { data: userInfo } = useUserInfor();
  const roles = userInfo?.data?.user?.roles ?? [];
  const isSuperAdmin = roles.includes("super_admin");

  // A single inclusive window shared by every panel, resolved server side so the
  // counts are not capped by how many rows the list endpoints return.
  const range = useMemo(() => {
    if (globalRange === "custom") {
      return { date_from: customFrom, date_to: customTo };
    }

    const days = Number(globalRange);
    return {
      date_from: formatInputDate(daysAgo(days - 1)),
      date_to: formatInputDate(new Date()),
    };
  }, [customFrom, customTo, globalRange]);

  const {
    data: overviewQuery,
    isLoading: overviewLoading,
    error: overviewError,
  } = useAdminOverview(range, isSuperAdmin);
  const { data: recentUsersQuery } = useAdminRecentUsers(range, 50, isSuperAdmin);
  const { data: activeUsersQuery } = useAdminActiveUsers(range, 50, isSuperAdmin);
  const { data: recentRequestsQuery } = useAdminRecentRequests(
    range,
    50,
    recentRequestsStatus === "all" ? undefined : recentRequestsStatus,
    isSuperAdmin
  );
  const { data: recentSubmissionsQuery } = useAdminRecentSubmissions(
    range,
    50,
    isSuperAdmin
  );

  if (!isSuperAdmin) {
    return (
      <section className="rounded-[24px] border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Overview is restricted to super admins</h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Request management below is still available, but the summary metrics and recent platform activity use super-admin-only endpoints.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (overviewLoading) {
    return (
      <section className="flex min-h-[8rem] items-center justify-center rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <DotsLoader />
      </section>
    );
  }

  if (overviewError || !overviewQuery?.data) {
    return (
      <section className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-red-700 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        Failed to load the admin overview.
      </section>
    );
  }

  const overview = overviewQuery.data;
  const rangeStats = overview.range;
  const recentUsers = recentUsersQuery?.data || [];
  const activeUsers = activeUsersQuery?.data || [];
  const recentRequests = recentRequestsQuery?.data || [];
  const recentSubmissions = recentSubmissionsQuery?.data || [];
  const topRequested = overview.datasets.most_requested || [];
  const daysForRange = rangeStats.days;
  const rangeLabel =
    globalRange === "custom"
      ? `${formatDate(rangeStats.from)} to ${formatDate(rangeStats.to)}`
      : `Last ${daysForRange} days`;
  const irbCoverage =
    overview.data_requests.total > 0
      ? Math.round(
          (overview.data_requests.with_irb_number / overview.data_requests.total) * 100
        )
      : 0;

  const filterClassName =
    "appearance-none rounded-full border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:border-sky-300 focus:border-sky-400";

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-600 sm:text-xs">
              Platform Overview
            </p>
            <h1 className="mt-1.5 text-xl font-semibold text-slate-900 sm:text-2xl">
              Admin Snapshot
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600 sm:text-sm">
              High-level platform health, account growth, request activity, and recent operational movement across the data portal.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="relative">
              <select
                value={globalRange}
                onChange={(e) => setGlobalRange(e.target.value)}
                className={filterClassName}
              >
                {globalRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {globalRange === "custom" ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-sky-300 focus:border-sky-400"
                />
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={formatInputDate(new Date())}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-sky-300 focus:border-sky-400"
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
              {rangeLabel}:{" "}
              <span className="font-semibold text-slate-900">
                {compactNumber(rangeStats.active_users)}
              </span>{" "}
              active users
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={`New Users ${daysForRange}D`}
          value={rangeStats.new_users}
          hint={`Member registrations captured in ${rangeLabel.toLowerCase()}.`}
          icon={UserCheck}
          compact
        />
        <MetricCard
          label={`New Requests ${daysForRange}D`}
          value={rangeStats.new_requests}
          hint={`${rangeStats.pending_requests} still pending, ${rangeStats.approved_requests} approved.`}
          icon={CheckCircle2}
          compact
        />
        <MetricCard
          label={`Page Views ${daysForRange}D`}
          value={rangeStats.page_views}
          hint={`Dataset page views across ${compactNumber(
            rangeStats.active_users
          )} active users.`}
          icon={Activity}
          compact
        />
        <MetricCard
          label={`Submissions ${daysForRange}D`}
          value={rangeStats.new_submissions}
          hint={`External dataset submissions in ${rangeLabel.toLowerCase()}.`}
          icon={FileClock}
          compact
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Users"
          value={overview.users.total}
          hint={`${overview.users.new_last_30d} new in 30 days, ${overview.users.disabled} disabled`}
          icon={Users}
        />
        <MetricCard
          label="Datasets"
          value={overview.datasets.total}
          hint={`${overview.datasets.in_warehouse} available in warehouse`}
          icon={Database}
        />
        <MetricCard
          label="Requests"
          value={overview.data_requests.total}
          hint={`${overview.data_requests.pending} pending, ${overview.data_requests.new_last_7d} new in 7 days`}
          icon={FileClock}
        />
        <MetricCard
          label="Downloads"
          value={overview.data_requests.total_downloads}
          hint={`Total dataset downloads across ${compactNumber(
            overview.data_requests.approved
          )} approved requests`}
          icon={Download}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">Inventory Breakdown</h3>
            <p className="mt-1 text-xs text-slate-500">
              Category totals and warehouse availability across the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(overview.datasets.warehouse_status_by_category).map(
              ([category, stats]) => {
                const total = stats.available + stats.not_available;
                const availableWidth = total > 0 ? (stats.available / total) * 100 : 0;

                return (
                  <div
                    key={category}
                    className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {category}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {total} total
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {Math.round(availableWidth)}%
                        </p>
                        <p className="text-[11px] text-slate-500">available</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{stats.available} available</span>
                      <span>{stats.not_available} unavailable</span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">Operational Ratios</h3>
            <p className="mt-1 text-xs text-slate-500">
              A quick read on user verification, request flow, and ethics coverage.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Verified Users
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                {overview.users.verified}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {overview.users.unverified} unverified accounts remain
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Pending Requests
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                {overview.data_requests.pending}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {overview.data_requests.approved} approved, {overview.data_requests.denied} denied
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <ShieldCheck className="h-3 w-3" /> IRB Coverage
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                {irbCoverage}%
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {overview.data_requests.missing_irb_number} requests have no IRB number on file
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/75 px-3.5 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                External Submissions
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                {overview.external_submissions.total}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {overview.external_submissions.pending_review} waiting for review
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <SimpleList
          title="Most Requested Datasets"
          subtitle="Top demand across the request pipeline."
          emptyText="No request activity available yet."
          items={topRequested.map((item) => ({
            title: item.name,
            meta: item.amr_category || "uncategorised",
            value: `${item.request_count} requests`,
          }))}
        />

        <SimpleList
          title="Recently Registered Users"
          subtitle={`Latest registered members in ${rangeLabel.toLowerCase()}.`}
          emptyText="No recent user registrations."
          items={recentUsers.map((user) => ({
            title: user.name,
            meta: `${user.email}${user.institution ? ` • ${user.institution}` : ""}`,
            value: formatDate(user.registered_at),
            status: user.disabled
              ? {
                  label: "Disabled",
                  tone: "bg-red-100 text-red-700",
                }
              : user.is_verified
              ? {
                  label: "Verified",
                  tone: "bg-emerald-100 text-emerald-700",
                }
              : {
                  label: "Pending",
                  tone: "bg-amber-100 text-amber-700",
                },
          }))}
        />

        <SimpleList
          title="Active Users"
          subtitle={`Users with page views in ${rangeLabel.toLowerCase()}.`}
          emptyText="No active users recorded in the selected period."
          items={activeUsers.map((user) => ({
            title: user.name,
            meta: `${user.email}${user.institution ? ` • ${user.institution}` : ""}`,
            value: `${user.page_views} views`,
            status: {
              label: formatDate(user.last_seen),
              tone: "bg-cyan-100 text-cyan-700",
            },
          }))}
        />

        <SimpleList
          title="Recent Requests"
          subtitle={`Latest access requests in ${rangeLabel.toLowerCase()}.`}
          emptyText="No recent requests available."
          actions={
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <select
                  value={recentRequestsStatus}
                  onChange={(e) => setRecentRequestsStatus(e.target.value)}
                  className={filterClassName}
                >
                  {requestStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          }
          items={recentRequests.map((request) => ({
            title: request.dataset_name,
            meta: `${request.user_name} • ${request.user_email}${
              request.irb_number ? ` • IRB ${request.irb_number}` : " • no IRB number"
            }`,
            value: formatDate(request.created_at),
            status: {
              label: request.status,
              tone: statusTone(request.status),
            },
          }))}
        />

        <SimpleList
          title="Recent Submissions"
          subtitle={`Newest external dataset submissions in ${rangeLabel.toLowerCase()}.`}
          emptyText="No recent submissions available."
          items={recentSubmissions.map((submission) => ({
            title: submission.title,
            meta: `${submission.submitted_by}${submission.institution ? ` • ${submission.institution}` : ""}`,
            value: formatDate(submission.created_at),
            status: {
              label: submission.approval_status,
              tone:
                submission.approval_status === "pending_review"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-cyan-100 text-cyan-700",
            },
          }))}
        />
      </div>
    </section>
  );
}
