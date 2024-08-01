import { useQuery } from "@tanstack/react-query";
import api from './../axios';


export const useGetRoles = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/data_sets'),
    queryKey: ["data_sets"],
    meta: {
      errorMessage: "Failed to fetch datasets"
    }
  });
}


export const assignRole = async (data: {user_id:string, role: string}) => {
  const response = await api.post('/roles/assign', data);
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