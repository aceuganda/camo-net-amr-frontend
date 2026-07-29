import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from './../axios';

export interface RefereeResponse {
  id: string;
  referee_name: string | null;
  referee_email: string | null;
  approval_status: string | null;
  feedback: string | null;
  response_date: string | null;
}

export interface AdminPermission {
  permission_id: string;
  data_set_id: string | null;
  data_set_name: string | null;
  data_set_amr_category: string | null;
  data_set_doi: string | null;
  data_set_license: string | null;
  data_set_citation_info: string | null;
  data_set_principal_investigator: string | null;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_institution: string | null;
  user_contact: string | null;
  user_external_profile_link: string | null;
  user_is_verified: boolean | null;
  project_title: string | null;
  project_description: string | null;
  /** Requester's job title / position, captured on the request form. */
  title: string | null;
  institution: string | null;
  category: string | null;
  irb_number: string | null;
  agreed_to_privacy: boolean | null;
  status: string;
  denial_reason: string | null;
  created_at: string | null;
  last_update: string | null;
  downloads_count: number | null;
  re_request_count: number | null;
  requested_variables: string[] | null;
  requested_variables_count: number;
  referee_name: string | null;
  referee_email: string | null;
  /** Mirrors the most recent referee response. */
  feedback: string | null;
  approval_status: string | null;
  referee_responses: RefereeResponse[];
  approver_name: string | null;
  approver_email: string | null;
}

export interface AdminPermissionsPage {
  items: AdminPermission[];
  total: number;
  skip: number;
  limit: number;
  status_counts: Record<string, number>;
}

export const useFetchAdminPermissions = (
  q = "",
  { status = "", page = 1, pageSize = 10 } = {}
) => {
  return useQuery<any, Error, { data: AdminPermissionsPage }>({
    queryFn: () =>
      api.get('/user_permissions', {
        params: {
          ...(q ? { q } : {}),
          ...(status ? { status } : {}),
          skip: (page - 1) * pageSize,
          limit: pageSize,
        },
      }),
    queryKey: ["user_permissions", q, status, page, pageSize],
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: "Failed to fetch permissions"
    }
  });
}

export const allowAccess = async (id: string) => {
  const response = await api.patch(`/permissions/${id}/approve`);
  return response.data;
};

export const denyAccess = async (data: any) => {
  const permId = data.id
  delete data['id']
  const response = await api.patch(`/permissions/${permId}/deny`, data);
  return response.data;
};
