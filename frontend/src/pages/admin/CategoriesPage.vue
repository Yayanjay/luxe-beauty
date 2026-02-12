<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Categories</h2>
      <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700" @click="showModal = true">
        + New Category
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Slug</th>
            <th class="px-6 py-3 font-medium">Parent</th>
            <th class="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="4" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr v-for="cat in categories" v-else :key="cat.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ cat.name }}</td>
            <td class="px-6 py-4 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
            <td class="px-6 py-4 text-gray-500">{{ cat.parentId ? 'Sub' : 'Root' }}</td>
            <td class="px-6 py-4 text-right">
              <button class="text-rose-600 hover:text-rose-800 text-xs font-medium" @click="deleteCategory(cat.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="font-semibold text-gray-900 mb-4">New Category</h3>
        <form class="space-y-4" @submit.prevent="createCategory">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm" />
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
import { categoriesApi } from '@/api/categories';
import type { Category } from '@/api/categories';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const categories = ref<Category[]>([]);
const loading = ref(true);
const showModal = ref(false);
const form = ref({ name: '', parentId: '' });

async function fetchCategories(): Promise<void> {
  loading.value = true;
  categories.value = await categoriesApi.list();
  loading.value = false;
}

async function createCategory(): Promise<void> {
  try {
    await categoriesApi.adminCreate({ name: form.value.name });
    notificationStore.success('Category created!');
    showModal.value = false;
    fetchCategories();
  } catch {
    notificationStore.error('Failed to create category');
  }
}

async function deleteCategory(id: string): Promise<void> {
  if (!confirm('Delete this category?')) return;
  try {
    await categoriesApi.adminDelete(id);
    notificationStore.success('Category deleted');
    fetchCategories();
  } catch {
    notificationStore.error('Failed to delete category');
  }
}

onMounted(fetchCategories);
</script>
