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
  institution: string;
  age_range: string;
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
export const useVerifyEmail =  (token: string | null) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/users/verify?token=${token}`),
    queryKey: ["verify_email"],
    meta: {
      errorMessage: "Failed to verify user"
    }
  });
};

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
  const response =  await api.post('/logout');
  return true;
};

export const updateUser = async (data: any) => {
  const response = await api.patch('/users', data);
  return response.data;
};

export const useGetRequestUser =  (perms_id: string | null) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/permissions/${perms_id}/user`),
    queryKey: ["fetch_perms_user"],
    meta: {
      errorMessage: "Failed to permissions user"
    }
  });
};

export const submitReference = async (data: any) => {
  const response = await api.post('/referee_responses', data);
  return response.data;
};