import { useQuery } from "@tanstack/react-query";
import api from "../axios";

export interface AdminOverviewResponse {
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

export const useAdminOverview = (enabled = true) =>
  useQuery<any, Error, { data: AdminOverviewResponse }>({
    queryKey: ["admin_overview"],
    queryFn: () => api.get("/admin/overview"),
    enabled,
    meta: {
      errorMessage: "Failed to fetch admin overview",
    },
  });

export const useAdminRecentUsers = (days = 30, limit = 6, enabled = true) =>
  useQuery<any, Error, { data: AdminRecentUser[] }>({
    queryKey: ["admin_recent_users", days, limit],
    queryFn: () => api.get(`/admin/users/recent?days=${days}&limit=${limit}`),
    enabled,
    meta: {
      errorMessage: "Failed to fetch recent users",
    },
  });

export const useAdminActiveUsers = (days = 7, limit = 6, enabled = true) =>
  useQuery<any, Error, { data: AdminActiveUser[] }>({
    queryKey: ["admin_active_users", days, limit],
    queryFn: () => api.get(`/admin/users/active?days=${days}&limit=${limit}`),
    enabled,
    meta: {
      errorMessage: "Failed to fetch active users",
    },
  });

export const useAdminRecentRequests = (
  days = 30,
  limit = 6,
  status?: string,
  enabled = true
) =>
  useQuery<any, Error, { data: AdminRecentRequest[] }>({
    queryKey: ["admin_recent_requests", days, limit, status ?? "all"],
    queryFn: () =>
      api.get(
        `/admin/requests/recent?days=${days}&limit=${limit}${
          status ? `&status=${status}` : ""
        }`
      ),
    enabled,
    meta: {
      errorMessage: "Failed to fetch recent requests",
    },
  });

export const useAdminRecentSubmissions = (days = 30, limit = 6, enabled = true) =>
  useQuery<any, Error, { data: AdminRecentSubmission[] }>({
    queryKey: ["admin_recent_submissions", days, limit],
    queryFn: () =>
      api.get(`/admin/submissions/recent?days=${days}&limit=${limit}`),
    enabled,
    meta: {
      errorMessage: "Failed to fetch recent submissions",
    },
  });
