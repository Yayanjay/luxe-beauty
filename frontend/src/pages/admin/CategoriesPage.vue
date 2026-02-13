<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Categories</h2>
      <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700" @click="openCreateModal">
        + New Category
      </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Image</th>
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Slug</th>
            <th class="px-6 py-3 font-medium">Parent</th>
            <th class="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="5" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr
            v-for="cat in categories"
            v-else
            :key="cat.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="openEditModal(cat)"
          >
            <td class="px-6 py-4">
              <img
                v-if="cat.image"
                :src="cat.image"
                :alt="cat.name"
                class="w-10 h-10 rounded object-cover"
              >
              <div v-else class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900">{{ cat.name }}</td>
            <td class="px-6 py-4 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
            <td class="px-6 py-4 text-gray-500">{{ cat.parentId ? 'Sub' : 'Root' }}</td>
            <td class="px-6 py-4 text-right">
              <button
                class="text-rose-600 hover:text-rose-800 text-xs font-medium"
                @click.stop="deleteCategory(cat.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="font-semibold text-gray-900 mb-4">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h3>
        <form class="space-y-4" @submit.prevent="saveCategory">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            <ImageUpload v-model="imageUploadValue" :folder="'categories'" :multiple="false" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category (optional)</label>
            <select v-model="form.parentId" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">None (Root category)</option>
              <option v-for="cat in rootCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" class="px-4 py-2 text-sm text-gray-600" @click="closeModal">Cancel</button>
            <button type="submit" class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm">
              {{ editingCategory ? 'Save Changes' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ImageUpload from '@/components/admin/ImageUpload.vue';
import { categoriesApi, type Category } from '@/api/categories';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const categories = ref<Category[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editingCategory = ref<Category | null>(null);
const form = ref({ name: '', parentId: '' });
const uploadedImage = ref<{ url: string; key?: string } | null>(null);

const rootCategories = computed(() => categories.value.filter((c) => !c.parentId));

const imageUploadValue = computed({
  get: () => uploadedImage.value ? [uploadedImage.value] : [],
  set: (value) => {
    if (value.length > 0) {
      const item = value[0];
      uploadedImage.value = typeof item === 'string' ? { url: item } : item;
    } else {
      uploadedImage.value = null;
    }
  },
});

async function fetchCategories(): Promise<void> {
  loading.value = true;
  try {
    categories.value = await categoriesApi.list();
  } catch {
    notificationStore.error('Failed to load categories');
  } finally {
    loading.value = false;
  }
}

function openCreateModal(): void {
  editingCategory.value = null;
  form.value = { name: '', parentId: '' };
  uploadedImage.value = null;
  showModal.value = true;
}

function openEditModal(cat: Category): void {
  editingCategory.value = cat;
  form.value = { name: cat.name, parentId: cat.parentId || '' };
  uploadedImage.value = cat.image ? { url: cat.image } : null;
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
  editingCategory.value = null;
  form.value = { name: '', parentId: '' };
  uploadedImage.value = null;
}

async function saveCategory(): Promise<void> {
  try {
    const categoryData = {
      name: form.value.name,
      image: uploadedImage.value?.url,
      parentId: form.value.parentId || undefined,
    };

    if (editingCategory.value) {
      await categoriesApi.adminUpdate(editingCategory.value.id, categoryData);
      notificationStore.success('Category updated!');
    } else {
      await categoriesApi.adminCreate(categoryData);
      notificationStore.success('Category created!');
    }
    closeModal();
    fetchCategories();
  } catch {
    notificationStore.error(editingCategory.value ? 'Failed to update category' : 'Failed to create category');
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
