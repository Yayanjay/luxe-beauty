<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-6">Users</h2>
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Email</th>
            <th class="px-6 py-3 font-medium">Role</th>
            <th class="px-6 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="4" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr v-for="u in users" v-else :key="u.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ u.name }}</td>
            <td class="px-6 py-4 text-gray-500">{{ u.email }}</td>
            <td class="px-6 py-4">
              <span :class="u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'"
                class="px-2 py-0.5 rounded-full text-xs font-medium">{{ u.role }}</span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ new Date(u.createdAt).toLocaleDateString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';

const users = ref<{ id: string; name: string; email: string; role: string; createdAt: string }[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/api/admin/users');
    users.value = data.data;
  } finally {
    loading.value = false;
  }
});
</script>
