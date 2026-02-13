<template>
  <div class="max-w-xl">
    <h2 class="text-lg font-semibold text-gray-900 mb-6">Brand Settings</h2>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <form v-if="!loading" class="space-y-4" @submit.prevent="saveSettings">
        <div v-for="key in Object.keys(settings)" :key="key">
          <label class="block text-sm font-medium text-gray-700 mb-1 capitalize">{{ String(key).replace(/_/g, ' ') }}</label>
          <input v-model="settings[key]" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <p v-if="saved" class="text-green-600 text-sm">Settings saved.</p>
        <button type="submit" :disabled="saving" class="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-700 disabled:opacity-50">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </form>
      <div v-else class="py-8 text-center text-gray-400">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const settings = ref<Record<string, string>>({});
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);

onMounted(async () => {
  const { data } = await apiClient.get('/admin/settings');
  settings.value = data;
  loading.value = false;
});

async function saveSettings(): Promise<void> {
  saving.value = true;
  try {
    await apiClient.patch('/admin/settings', settings.value);
    notificationStore.success('Settings saved!');
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch {
    notificationStore.error('Failed to save settings');
  } finally {
    saving.value = false;
  }
}
</script>
