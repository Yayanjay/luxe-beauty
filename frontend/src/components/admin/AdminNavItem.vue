<template>
  <RouterLink
    :to="to"
    :exact="exact"
    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    :class="isActive ? 'bg-rose-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
  >
    <slot />
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const props = defineProps<{
  to: string;
  icon?: string;
  exact?: boolean;
}>();

const route = useRoute();
const isActive = computed(() =>
  props.exact ? route.path === props.to : route.path.startsWith(props.to),
);
</script>
