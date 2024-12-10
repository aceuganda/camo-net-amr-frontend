import { useQuery } from "@tanstack/react-query";
import api from './../axios';



export const assignRole = async (data: {user_id:string, role: string}) => {
  const response = await api.post('/roles/assign', data);
  return response.data;
};

export const revokeAccess = async (data: {user_id:string, disabled: boolean}) => {
  const response = await api.get(`/users/${data.user_id}/disable?disabled=${data.disabled}`);
  return response.data;
};

export const removeRole = async (data: {user_id:string, role: string}) => {
    const response = await api.patch('/roles/remove', data);
    return response.data;
  };

  export const useAdminUsersWith = () => {
    return useQuery<any, Error, {data: any}>({
      queryFn: () => api.get('/users'),
      queryKey: ["admin_users"],
      meta: {
        errorMessage: "Failed to fetch users"
      }
    });
  }