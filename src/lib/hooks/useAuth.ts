import { useMutation, useQuery } from '@tanstack/react-query';
import api from './../axios';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}


export const useUserInfor = () => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get('/users/me'),
    queryKey: ["user_info"],
    meta: {
      errorMessage: "Failed to fetch user"
    }
  });
}

export const login = async (data: LoginData) => {
  // Send login request
  const response = await api.post('/login', data);

  return response.data;
};

export const Register = async (data: RegisterData) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const logout = async () => {

  await api.post('/logout');
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "amr_user_roles=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  
  return true;
};
