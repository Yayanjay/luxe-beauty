<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">CMS Pages</h2>
      <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700" @click="openCreate">+ New Page</button>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Title</th>
            <th class="px-6 py-3 font-medium">Slug</th>
            <th class="px-6 py-3 font-medium">Published</th>
            <th class="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="4" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr v-for="page in pages" v-else :key="page.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ page.title }}</td>
            <td class="px-6 py-4 font-mono text-xs text-gray-500">{{ page.slug }}</td>
            <td class="px-6 py-4">
              <span :class="page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ page.isPublished ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button class="text-rose-600 hover:text-rose-800 text-xs font-medium" @click="deletePage(page.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h3 class="font-semibold text-gray-900 mb-4">New CMS Page</h3>
        <form class="space-y-4" @submit.prevent="createPage">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="form.title" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
            <textarea v-model="form.content" rows="6" required class="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
          <div class="flex items-center gap-2">
            <input id="published" v-model="form.isPublished" type="checkbox" />
            <label for="published" class="text-sm text-gray-700">Published</label>
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
const pages = ref<{ id: string; title: string; slug: string; isPublished: boolean }[]>([]);
const loading = ref(true);
const showModal = ref(false);
const form = ref({ title: '', content: '', isPublished: false });

async function fetchPages(): Promise<void> {
  loading.value = true;
  const { data } = await apiClient.get('/admin/cms');
  pages.value = data;
  loading.value = false;
}

function openCreate(): void {
  form.value = { title: '', content: '', isPublished: false };
  showModal.value = true;
}

async function createPage(): Promise<void> {
  try {
    await apiClient.post('/admin/cms', form.value);
    notificationStore.success('Page created!');
    showModal.value = false;
    fetchPages();
  } catch {
    notificationStore.error('Failed to create page');
  }
}

async function deletePage(id: string): Promise<void> {
  if (!confirm('Delete this page?')) return;
  try {
    await apiClient.delete(`/admin/cms/${id}`);
    notificationStore.success('Page deleted');
    fetchPages();
  } catch {
    notificationStore.error('Failed to delete page');
  }
}

onMounted(fetchPages);
</script>
