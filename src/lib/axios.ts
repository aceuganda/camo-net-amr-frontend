import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const currentUrl = window.location.pathname;
    if (error.response && error.response.status === 403) {
      // toast.error("Your session has expired, you need to login again for data access");
      // Remove cookies by setting them to expire
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "amr_user_roles=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
       
      if((/^\/datasets\/.+/.test(currentUrl))){
        window.location.href = '/authenticate'; 
      }
       
    }

    return Promise.reject(error);
  }
);

export default api;
