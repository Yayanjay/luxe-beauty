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
            <th class="px-6 py-3 font-medium">Image</th>
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Category</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="5" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr
            v-for="p in products"
            v-else
            :key="p.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="openEditModal(p)"
          >
            <td class="px-6 py-4">
              <img
                v-if="p.images?.[0]"
                :src="p.images[0].url"
                :alt="p.name"
                class="w-12 h-12 rounded object-cover"
              >
              <div v-else class="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900">{{ p.name }}</td>
            <td class="px-6 py-4 text-gray-500">{{ p.category?.name }}</td>
            <td class="px-6 py-4">
              <span :class="p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ p.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                class="text-rose-600 hover:text-rose-800 text-xs font-medium"
                @click.stop="deleteProduct(p.id)"
              >Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="font-semibold text-gray-900 mb-4">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h3>
        <form class="space-y-4" @submit.prevent="saveProduct">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select v-model="form.categoryId" required class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input id="isActive" v-model="form.isActive" type="checkbox" class="rounded">
            <label for="isActive" class="text-sm text-gray-700">Active</label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <p class="text-xs text-gray-500 mb-2">First image will be the thumbnail</p>
            <div v-if="!editingProduct" class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-sm text-amber-800">
                Images can be added after creating the product. Save this product first, then edit it to upload images.
              </p>
            </div>
            <ImageUpload
              v-else
              v-model="productImages"
              :folder="'products'"
              :multiple="true"
              :on-upload="uploadProductImage"
            />
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="closeModal">Cancel</button>
            <button
              type="submit"
              class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ImageUpload from '@/components/admin/ImageUpload.vue';
import { productsApi } from '@/api/products';
import { categoriesApi, type Category } from '@/api/categories';
import type { Product } from '@/api/products';
import { useNotificationStore } from '@/stores/notification.store';

interface ImageItem {
  id?: string;
  url: string;
  key?: string;
  alt?: string | null;
}

const notificationStore = useNotificationStore();
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const total = ref(0);
const loading = ref(true);
const showModal = ref(false);
const editingProduct = ref<Product | null>(null);
const form = ref({ name: '', description: '', categoryId: '', isActive: true });
const productImages = ref<ImageItem[]>([]);
const isSaving = ref(false);

async function fetchProducts(): Promise<void> {
  loading.value = true;
  try {
    const res = await productsApi.adminList();
    products.value = res.data;
    total.value = res.total;
  } catch {
    notificationStore.error('Failed to load products');
  } finally {
    loading.value = false;
  }
}

async function fetchCategories(): Promise<void> {
  try {
    categories.value = await categoriesApi.list();
  } catch {
    notificationStore.error('Failed to load categories');
  }
}

function openCreateModal(): void {
  editingProduct.value = null;
  form.value = { name: '', description: '', categoryId: '', isActive: true };
  productImages.value = [];
  showModal.value = true;
}

function openEditModal(product: Product): void {
  editingProduct.value = product;
  form.value = {
    name: product.name,
    description: product.description || '',
    categoryId: product.category?.id || '',
    isActive: product.isActive,
  };
  // Convert existing images to ImageItem format
  productImages.value = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  }));
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
  editingProduct.value = null;
  form.value = { name: '', description: '', categoryId: '', isActive: true };
  productImages.value = [];
  isSaving.value = false;
}

async function uploadProductImage(file: File): Promise<{ url: string; key?: string }> {
  if (!editingProduct.value) {
    throw new Error('Cannot upload image before creating product');
  }
  const result = await productsApi.addImage(editingProduct.value.id, file);
  return { url: result.url };
}

async function saveProduct(): Promise<void> {
  if (!form.value.categoryId) {
    notificationStore.error('Please select a category');
    return;
  }

  isSaving.value = true;

  try {
    let productId: string;

    if (editingProduct.value) {
      // Update existing product
      const updated = await productsApi.adminUpdate(editingProduct.value.id, {
        name: form.value.name,
        description: form.value.description || undefined,
        categoryId: form.value.categoryId,
        isActive: form.value.isActive,
      });
      productId = updated.id;

      // Handle images: find which ones are new, which need to be deleted, and reorder if needed
      const currentImageIds = new Set(productImages.value.map((img) => img.id).filter(Boolean));

      // Delete removed images
      for (const oldImage of editingProduct.value.images) {
        if (!currentImageIds.has(oldImage.id)) {
          await productsApi.removeImage(productId, oldImage.id);
        }
      }

      // Reorder images if the order changed
      const newImageIds = productImages.value.map((img) => img.id).filter(Boolean) as string[];
      if (newImageIds.length > 0 && JSON.stringify(newImageIds) !== JSON.stringify(editingProduct.value.images.map((img) => img.id))) {
        await productsApi.reorderImages(productId, newImageIds);
      }

      notificationStore.success('Product updated!');
    } else {
      // Create new product first
      const created = await productsApi.adminCreate({
        name: form.value.name,
        description: form.value.description || undefined,
        categoryId: form.value.categoryId,
        isActive: form.value.isActive,
      });
      productId = created.id;

      notificationStore.success('Product created!');
      // Note: For new products, images must be added by editing the product after creation
    }

    closeModal();
    fetchProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    notificationStore.error(editingProduct.value ? 'Failed to update product' : 'Failed to create product');
  } finally {
    isSaving.value = false;
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

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>
