<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ category?.name ?? 'Products' }}</h1>
    <p class="text-gray-500 mb-8">{{ total }} products found</p>

    <!-- Filters -->
    <div class="flex gap-3 mb-8 flex-wrap">
      <input
        v-model="search"
        type="text"
        placeholder="Search products..."
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        @input="debouncedFetch"
      />
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
    </div>
    <div v-else-if="products.length" class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>
    <div v-else class="text-center py-24 text-gray-400">No products found.</div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-12">
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
        :class="p === page ? 'bg-rose-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'"
        @click="goToPage(p)"
      >{{ p }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import type { Product } from '@/api/products';
import type { Category } from '@/api/categories';
import ProductCard from '@/components/ui/ProductCard.vue';

const route = useRoute();
const products = ref<Product[]>([]);
const category = ref<Category | null>(null);
const loading = ref(true);
const total = ref(0);
const page = ref(1);
const limit = 20;
const search = ref('');
let debounceTimer: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(total.value / limit));

async function fetchProducts(): Promise<void> {
  loading.value = true;
  const slug = route.params.slug as string;
  const res = await productsApi.list({ page: page.value, limit, category: slug, search: search.value || undefined });
  products.value = res.data;
  total.value = res.total;
  loading.value = false;
}

function debouncedFetch(): void {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchProducts, 400);
}

function goToPage(p: number): void {
  page.value = p;
  fetchProducts();
}

onMounted(async () => {
  const slug = route.params.slug as string;
  [category.value] = await Promise.all([
    categoriesApi.getBySlug(slug).catch(() => null),
    fetchProducts(),
  ]);
});

watch(() => route.params.slug, () => {
  page.value = 1;
  fetchProducts();
});
</script>
