<template>
  <RouterLink :to="`/product/${product.slug}`" class="group block">
    <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
      <img
        v-if="product.images[0]"
        :src="product.images[0].url"
        :alt="product.images[0].alt ?? product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
        &#128144;
      </div>
    </div>
    <div>
      <p class="text-xs text-gray-500 mb-1">{{ product.category?.name }}</p>
      <h3 class="font-semibold text-gray-900 text-sm group-hover:text-rose-600 transition-colors line-clamp-2">
        {{ product.name }}
      </h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="font-bold text-gray-900">{{ formatPrice(lowestVariant?.price) }}</span>
        <span v-if="lowestVariant?.compareAtPrice" class="text-gray-400 line-through text-sm">
          {{ formatPrice(lowestVariant.compareAtPrice) }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Product } from '@/api/products';

const props = defineProps<{ product: Product }>();

const lowestVariant = computed(() => props.product.variants[0]);

function formatPrice(price?: string | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(price),
  );
}
</script>
