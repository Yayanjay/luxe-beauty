<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <h1 class="text-8xl font-bold text-gray-200">404</h1>
    <p class="text-2xl font-semibold text-gray-900 mt-4">Page not found</p>
    <p class="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="mt-8 bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors">
      Back to Home
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
