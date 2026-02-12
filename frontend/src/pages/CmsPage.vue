<template>
  <div v-if="page" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ page.title }}</h1>
    <div class="prose max-w-none text-gray-700" v-html="page.content" />
  </div>
  <div v-else-if="loading" class="flex justify-center py-32">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
  </div>
  <div v-else class="text-center py-32 text-gray-400">Page not found.</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/client';

const route = useRoute();
const page = ref<{ title: string; content: string } | null>(null);
const loading = ref(true);

async function fetchPage(): Promise<void> {
  loading.value = true;
  page.value = null;
  try {
    const { data } = await apiClient.get(`/api/pages/${route.params.slug}`);
    page.value = data;
  } catch {
    page.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPage);
watch(() => route.params.slug, fetchPage);
</script>
