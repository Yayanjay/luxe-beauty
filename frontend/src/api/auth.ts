import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/api/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthTokens>('/api/auth/register', payload).then((r) => r.data),

  me: () => apiClient.get('/api/auth/me').then((r) => r.data),

  refresh: (userId: string, refreshToken: string) =>
    apiClient.post<{ accessToken: string }>('/api/auth/refresh', { userId, refreshToken }).then((r) => r.data),
};
