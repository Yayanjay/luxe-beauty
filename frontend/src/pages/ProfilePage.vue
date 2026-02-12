<template>
  <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
    <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <form class="space-y-4" @submit.prevent="saveProfile">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input v-model="name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input :value="authStore.user?.email" type="email" disabled class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500" />
        </div>
        <p v-if="saved" class="text-green-600 text-sm">Profile updated successfully.</p>
        <button type="submit" :disabled="saving" class="bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import apiClient from '@/api/client';

const authStore = useAuthStore();
const name = ref(authStore.user?.name ?? '');
const saving = ref(false);
const saved = ref(false);

async function saveProfile(): Promise<void> {
  saving.value = true;
  try {
    const { data } = await apiClient.patch('/api/users/me', { name: name.value });
    authStore.$patch({ user: data });
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } finally {
    saving.value = false;
  }
}
</script>
