<template>
  <div>
    <!-- Hero Banners -->
    <section v-if="banners.length" class="relative overflow-hidden">
      <div class="aspect-[16/5] bg-gray-100">
        <img
          :src="banners[0].image"
          :alt="banners[0].title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight">{{ banners[0].title }}</h1>
          <RouterLink
            v-if="banners[0].link"
            :to="banners[0].link"
            class="mt-6 bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-rose-50 transition-colors"
          >Shop Now</RouterLink>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 flex items-end p-4"
        >
          <img v-if="cat.image" :src="cat.image" :alt="cat.name" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <span class="relative text-white font-semibold text-lg drop-shadow">{{ cat.name }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">New Arrivals</h2>
      <div v-if="loadingProducts" class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import type { Product } from '@/api/products';
import type { Category } from '@/api/categories';
import ProductCard from '@/components/ui/ProductCard.vue';

const banners = ref<{ id: string; title: string; image: string; link: string | null }[]>([]);
const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const loadingProducts = ref(true);

onMounted(async () => {
  const [cats, prods] = await Promise.all([
    categoriesApi.list(),
    productsApi.list({ limit: 8 }),
  ]);
  categories.value = cats.filter((c) => !c.parentId);
  products.value = prods.data;
  loadingProducts.value = false;
});
</script>
