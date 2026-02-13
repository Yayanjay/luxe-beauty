<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Banners</h2>
      <button class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700" @click="openCreateModal">+ New Banner</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="loading" v-for="i in 2" :key="i" class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      <div
        v-for="banner in banners"
        v-else
        :key="banner.id"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden group cursor-pointer"
        @click="openEditModal(banner)"
      >
        <img :src="banner.image" :alt="banner.title" class="w-full h-32 object-cover">
        <div class="p-4 flex justify-between items-center">
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ banner.title }}</p>
            <span :class="banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded-full text-xs font-medium">
              {{ banner.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <button
            class="text-rose-600 hover:text-rose-800 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="deleteBanner(banner.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="font-semibold text-gray-900 mb-4">{{ editingBanner ? 'Edit Banner' : 'New Banner' }}</h3>
        <form class="space-y-4" @submit.prevent="saveBanner">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input v-model="form.title" type="text" required class="w-full border rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <ImageUpload v-model="imageUploadValue" :folder="'banners'" :multiple="false" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
            <input v-model="form.link" type="text" class="w-full border rounded-lg px-3 py-2 text-sm">
          </div>
          <div class="flex items-center gap-2">
            <input id="isActive" v-model="form.isActive" type="checkbox" class="rounded">
            <label for="isActive" class="text-sm text-gray-700">Active</label>
          </div>
          <div class="flex gap-3 justify-end pt-2">
            <button type="button" class="px-4 py-2 text-sm text-gray-600" @click="closeModal">Cancel</button>
            <button type="submit" class="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm">
              {{ editingBanner ? 'Save Changes' : 'Create' }}
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
import bannersApi, { type Banner } from '@/api/banners';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const banners = ref<Banner[]>([]);
const loading = ref(true);
const showModal = ref(false);
const editingBanner = ref<Banner | null>(null);
const form = ref({ title: '', link: '', isActive: true });
const uploadedImage = ref<{ url: string; key?: string } | null>(null);

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

async function fetchBanners(): Promise<void> {
  loading.value = true;
  try {
    const data = await bannersApi.adminList();
    banners.value = data;
  } catch {
    notificationStore.error('Failed to load banners');
  } finally {
    loading.value = false;
  }
}

function openCreateModal(): void {
  editingBanner.value = null;
  form.value = { title: '', link: '', isActive: true };
  uploadedImage.value = null;
  showModal.value = true;
}

function openEditModal(banner: Banner): void {
  editingBanner.value = banner;
  form.value = { title: banner.title, link: banner.link || '', isActive: banner.isActive };
  uploadedImage.value = { url: banner.image };
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
  editingBanner.value = null;
  form.value = { title: '', link: '', isActive: true };
  uploadedImage.value = null;
}

async function saveBanner(): Promise<void> {
  if (!uploadedImage.value) {
    notificationStore.error('Please upload an image');
    return;
  }

  try {
    const bannerData = {
      title: form.value.title,
      image: uploadedImage.value.url,
      link: form.value.link || undefined,
      isActive: form.value.isActive,
    };

    if (editingBanner.value) {
      await bannersApi.update(editingBanner.value.id, bannerData);
      notificationStore.success('Banner updated!');
    } else {
      await bannersApi.create(bannerData);
      notificationStore.success('Banner created!');
    }
    closeModal();
    fetchBanners();
  } catch {
    notificationStore.error(editingBanner.value ? 'Failed to update banner' : 'Failed to create banner');
  }
}

async function deleteBanner(id: string): Promise<void> {
  if (!confirm('Delete this banner?')) return;
  try {
    await bannersApi.delete(id);
    notificationStore.success('Banner deleted');
    fetchBanners();
  } catch {
    notificationStore.error('Failed to delete banner');
  }
}

onMounted(fetchBanners);
</script>
