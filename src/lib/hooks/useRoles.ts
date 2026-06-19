import { useQuery } from "@tanstack/react-query";
import api from './../axios';



export const assignRole = async (data: {user_id:string, role: string}) => {
  const response = await api.post('/roles/assign', data);
  return response.data;
};

export const revokeAccess = async (data: {user_id:string, disabled: boolean}) => {
  const response = await api.patch(`/users/${data.user_id}/disable`, {
    disabled: data.disabled,
  });
  return response.data;
};

export const removeRole = async (data: {user_id:string, role: string}) => {
    const response = await api.patch('/roles/remove', data);
    return response.data;
  };

export const assignDataSet = async (data: {user_id: string, data_set_id: string}) => {
  const response = await api.post('/roles/assign_data_set', data);
  return response.data;
};

export const removeDataSet = async (data: {user_id: string, data_set_id: string}) => {
  const response = await api.patch('/roles/remove_data_set', data);
  return response.data;
};

export const useUserDataSets = (userId: string, enabled = true) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/users/${userId}/data_sets`),
    queryKey: ["user_data_sets", userId],
    enabled: !!userId && enabled,
    meta: {
      errorMessage: "Failed to fetch user datasets"
    }
  });
};

  export const useAdminUsersWith = (q = "") => {
    return useQuery<any, Error, {data: any}>({
      queryFn: () =>
        api.get("/users", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          params: {
            t: Date.now(),
            ...(q ? { q } : {}),
          },
        }),
      queryKey: ["admin_users", q],
      meta: {
        errorMessage: "Failed to fetch users"
      },
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    });
  }
