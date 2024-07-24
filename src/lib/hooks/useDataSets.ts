import { useQuery } from "@tanstack/react-query";
import api from './../axios';



export const downloadData = async (source: string) => {
    const response = await api.get(`/data/download?source=${source}`,{
      responseType: 'blob', 
    });
    return response.data; 
  };
  
export const requestAccess = async (id: string) => {
    const response = await api.post('/permissions/request', { id });
    return response.data; 
  };
  