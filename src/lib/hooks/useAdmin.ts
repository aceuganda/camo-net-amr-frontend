import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../axios";

export interface AdminRange {
  from: string;
  to: string;
  days: number;
  new_users: number;
  new_requests: number;
  pending_requests: number;
  approved_requests: number;
  denied_requests: number;
  page_views: number;
  active_users: number;
  new_submissions: number;
}

export interface AdminOverviewResponse {
  range: AdminRange;
  users: {
    total: number;
    verified: number;
    unverified: number;
    disabled: number;
    new_last_7d: number;
    new_last_30d: number;
  };
  datasets: {
    total: number;
    in_warehouse: number;
    not_in_warehouse: number;
    by_category: Record<string, number>;
    warehouse_status_by_category: Record<
      string,
      { available: number; not_available: number }
    >;
    most_requested: Array<{
      name: string;
      amr_category: string | null;
      request_count: number;
    }>;
  };
  data_requests: {
    total: number;
    pending: number;
    approved: number;
    denied: number;
    new_last_7d: number;
    new_last_30d: number;
    total_downloads: number;
    with_irb_number: number;
    missing_irb_number: number;
  };
  external_submissions: {
    total: number;
    pending_review: number;
    new_last_7d: number;
    new_last_30d: number;
  };
  activity: {
    page_views_last_7d: number;
    page_views_last_30d: number;
    unique_active_users_last_7d: number;
  };
}

export interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  is_verified: boolean;
  disabled: boolean | null;
  registered_at: string | null;
}

export interface AdminActiveUser {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  last_seen: string | null;
  page_views: number;
}

export interface AdminRecentRequest {
  id: string;
  status: string;
  created_at: string | null;
  last_update: string | null;
  project_title: string | null;
  institution: string | null;
  irb_number: string | null;
  referee_name: string | null;
  referee_email: string | null;
  category: string | null;
  downloads_count: number;
  re_request_count: number;
  user_name: string;
  user_email: string;
  dataset_name: string;
  amr_category: string | null;
}

export interface AdminRecentSubmission {
  id: string;
  title: string;
  amr_category: string | null;
  approval_status: string;
  created_at: string | null;
  countries: string | null;
  study_design: string | null;
  submitted_by: string;
  submitter_email: string;
  institution: string | null;
}

/** Inclusive window sent to every admin endpoint so all panels report the same period. */
export interface DateRangeParams {
  date_from: string;
  date_to: string;
}

const rangeQuery = ({ date_from, date_to }: DateRangeParams) =>
  `date_from=${encodeURIComponent(date_from)}&date_to=${encodeURIComponent(date_to)}`;

export const useAdminOverview = (range: DateRangeParams, enabled = true) =>
  useQuery<any, Error, { data: AdminOverviewResponse }>({
    queryKey: ["admin_overview", range.date_from, range.date_to],
    queryFn: () => api.get(`/admin/overview?${rangeQuery(range)}`),
    enabled,
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch admin overview",
    },
  });

export const useAdminRecentUsers = (
  range: DateRangeParams,
  limit = 6,
  enabled = true
) =>
  useQuery<any, Error, { data: AdminRecentUser[] }>({
    queryKey: ["admin_recent_users", range.date_from, range.date_to, limit],
    queryFn: () =>
      api.get(`/admin/users/recent?${rangeQuery(range)}&limit=${limit}`),
    enabled,
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch recent users",
    },
  });

export const useAdminActiveUsers = (
  range: DateRangeParams,
  limit = 6,
  enabled = true
) =>
  useQuery<any, Error, { data: AdminActiveUser[] }>({
    queryKey: ["admin_active_users", range.date_from, range.date_to, limit],
    queryFn: () =>
      api.get(`/admin/users/active?${rangeQuery(range)}&limit=${limit}`),
    enabled,
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch active users",
    },
  });

export const useAdminRecentRequests = (
  range: DateRangeParams,
  limit = 6,
  status?: string,
  enabled = true
) =>
  useQuery<any, Error, { data: AdminRecentRequest[] }>({
    queryKey: [
      "admin_recent_requests",
      range.date_from,
      range.date_to,
      limit,
      status ?? "all",
    ],
    queryFn: () =>
      api.get(
        `/admin/requests/recent?${rangeQuery(range)}&limit=${limit}${
          status ? `&status=${status}` : ""
        }`
      ),
    enabled,
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch recent requests",
    },
  });

export const useAdminRecentSubmissions = (
  range: DateRangeParams,
  limit = 6,
  enabled = true
) =>
  useQuery<any, Error, { data: AdminRecentSubmission[] }>({
    queryKey: ["admin_recent_submissions", range.date_from, range.date_to, limit],
    queryFn: () =>
      api.get(`/admin/submissions/recent?${rangeQuery(range)}&limit=${limit}`),
    enabled,
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch recent submissions",
    },
  });
