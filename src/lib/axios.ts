
import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      toast.error("Your session has expired, you need to login again for data access");
      localStorage.removeItem('access token');
      window.location.href = '/auth'; 
    }
    return Promise.reject(error);
  }
);


export default api;
