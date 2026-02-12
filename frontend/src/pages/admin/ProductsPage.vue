<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Products ({{ total }})</h2>
      <button
        class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700"
        @click="openCreateModal"
      >+ New Product</button>
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Category</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="4" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr
            v-for="p in products"
            v-else
            :key="p.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium text-gray-900">{{ p.name }}</td>
            <td class="px-6 py-4 text-gray-500">{{ p.category?.name }}</td>
            <td class="px-6 py-4">
              <span :class="p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ p.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button class="text-rose-600 hover:text-rose-800 text-xs font-medium" @click="deleteProduct(p.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal (simple inline) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 class="font-semibold text-gray-900 mb-4">New Product</h3>
        <form class="space-y-4" @submit.prevent="createProduct">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
            <input v-model="form.categoryId" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="showModal = false">Cancel</button>
            <button type="submit" class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productsApi } from '@/api/products';
import type { Product } from '@/api/products';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const products = ref<Product[]>([]);
const total = ref(0);
const loading = ref(true);
const showModal = ref(false);
const form = ref({ name: '', description: '', categoryId: '' });

async function fetchProducts(): Promise<void> {
  loading.value = true;
  const res = await productsApi.adminList();
  products.value = res.data;
  total.value = res.total;
  loading.value = false;
}

function openCreateModal(): void {
  form.value = { name: '', description: '', categoryId: '' };
  showModal.value = true;
}

async function createProduct(): Promise<void> {
  try {
    await productsApi.adminCreate(form.value);
    notificationStore.success('Product created!');
    showModal.value = false;
    fetchProducts();
  } catch {
    notificationStore.error('Failed to create product');
  }
}

async function deleteProduct(id: string): Promise<void> {
  if (!confirm('Delete this product?')) return;
  try {
    await productsApi.adminDelete(id);
    notificationStore.success('Product deleted');
    fetchProducts();
  } catch {
    notificationStore.error('Failed to delete product');
  }
}

onMounted(fetchProducts);
</script>
