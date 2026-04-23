import { apiClient } from './apiClient';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    apiClient.post<AuthResponse>('/auth/register', { email, password, name }),
};