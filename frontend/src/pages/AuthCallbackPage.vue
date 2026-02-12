<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const accessToken = route.query.accessToken as string;
  const refreshToken = route.query.refreshToken as string;

  if (accessToken && refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    authStore.$patch({ accessToken, refreshToken });
    await authStore.fetchMe();
  }

  router.replace('/');
});
</script>
