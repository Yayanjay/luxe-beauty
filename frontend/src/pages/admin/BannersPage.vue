<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Banners</h2>
      <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700" @click="showModal = true">+ New Banner</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="loading" v-for="i in 2" :key="i" class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      <div
        v-for="banner in banners"
        v-else
        :key="banner.id"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <img :src="banner.image" :alt="banner.title" class="w-full h-32 object-cover" />
        <div class="p-4 flex justify-between items-center">
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ banner.title }}</p>
            <span :class="banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
              {{ banner.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <button class="text-rose-600 hover:text-rose-800 text-xs font-medium" @click="deleteBanner(banner.id)">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="font-semibold text-gray-900 mb-4">New Banner</h3>
        <form class="space-y-4" @submit.prevent="createBanner">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="form.title" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input v-model="form.image" type="url" required class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
            <input v-model="form.link" type="text" class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" class="px-4 py-2 text-sm text-gray-600" @click="showModal = false">Cancel</button>
            <button type="submit" class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const banners = ref<{ id: string; title: string; image: string; link: string | null; isActive: boolean }[]>([]);
const loading = ref(true);
const showModal = ref(false);
const form = ref({ title: '', image: '', link: '' });

async function fetchBanners(): Promise<void> {
  loading.value = true;
  const { data } = await apiClient.get('/api/admin/banners');
  banners.value = data;
  loading.value = false;
}

async function createBanner(): Promise<void> {
  try {
    await apiClient.post('/api/admin/banners', form.value);
    notificationStore.success('Banner created!');
    showModal.value = false;
    fetchBanners();
  } catch {
    notificationStore.error('Failed to create banner');
  }
}

async function deleteBanner(id: string): Promise<void> {
  if (!confirm('Delete this banner?')) return;
  try {
    await apiClient.delete(`/api/admin/banners/${id}`);
    notificationStore.success('Banner deleted');
    fetchBanners();
  } catch {
    notificationStore.error('Failed to delete banner');
  }
}

onMounted(fetchBanners);
</script>
