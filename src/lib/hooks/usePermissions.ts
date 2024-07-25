import { useQuery } from "@tanstack/react-query";
import api from './../axios';




  export const useFetchAdminPermissions = () => {
    return useQuery<any, Error, {data: any}>({
      queryFn: () => api.get('/user_permissions'),
      queryKey: ["user_permissions"],
      meta: {
        errorMessage: "Failed to fetch permissions"
      }
    });
  }
  
  export const allowAccess = async (id: string) => {
    const response = await api.patch(`/permissions/${id}/approve`);
    return response.data; 
  };

  export const denyAccess = async (id: string) => {
    const response = await api.patch(`/permissions/${id}/deny`);
    return response.data; 
  };