<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6">
    <p class="text-sm font-medium text-gray-500">{{ label }}</p>
    <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  color?: string;
}>();
</script>
