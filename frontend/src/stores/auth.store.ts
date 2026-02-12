import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import type { LoginPayload, RegisterPayload } from '@/api/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  avatar: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

  const isAuthenticated = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  async function login(payload: LoginPayload): Promise<void> {
    const tokens = await authApi.login(payload);
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    await fetchMe();
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const tokens = await authApi.register(payload);
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    await fetchMe();
  }

  async function fetchMe(): Promise<void> {
    if (!accessToken.value) return;
    try {
      const data = await authApi.me();
      user.value = data;
      localStorage.setItem('userId', data.id);
    } catch {
      logout();
    }
  }

  function logout(): void {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }

  return { user, accessToken, refreshToken, isAuthenticated, isAdmin, login, register, fetchMe, logout };
});
