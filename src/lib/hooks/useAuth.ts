// hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import api from './..//axios';

interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post('/login', data);
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};



export const logout = () => {
  localStorage.removeItem('token');
};
