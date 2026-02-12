<template>
  <div v-if="product" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="grid md:grid-cols-2 gap-12">
      <!-- Images -->
      <div>
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
          <img
            :src="selectedImage?.url ?? 'https://placehold.co/600'"
            :alt="selectedImage?.alt ?? product.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="img in product.images"
            :key="img.id"
            class="w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
            :class="selectedImage?.id === img.id ? 'border-rose-500' : 'border-transparent'"
            @click="selectedImage = img"
          >
            <img :src="img.url" :alt="img.alt ?? ''" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Details -->
      <div>
        <p class="text-sm text-gray-500 mb-1">{{ product.category?.name }}</p>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>

        <div class="flex items-center gap-3 mb-6">
          <span class="text-2xl font-bold text-gray-900">{{ formatPrice(selectedVariant?.price) }}</span>
          <span v-if="selectedVariant?.compareAtPrice" class="text-gray-400 line-through">
            {{ formatPrice(selectedVariant.compareAtPrice) }}
          </span>
        </div>

        <!-- Variant Selector -->
        <div v-if="product.variants.length > 1" class="mb-6">
          <p class="text-sm font-medium text-gray-700 mb-2">Size</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="v in product.variants"
              :key="v.id"
              class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              :class="selectedVariant?.id === v.id
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'"
              :disabled="v.stock === 0"
              @click="selectedVariant = v"
            >
              {{ v.attributes.size ?? v.sku }}
              <span v-if="v.stock === 0" class="ml-1 text-xs text-gray-400">(sold out)</span>
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="flex items-center gap-3 mb-6">
          <button class="w-9 h-9 border rounded-lg text-gray-600 hover:bg-gray-50" @click="qty = Math.max(1, qty - 1)">−</button>
          <span class="font-medium">{{ qty }}</span>
          <button class="w-9 h-9 border rounded-lg text-gray-600 hover:bg-gray-50" @click="qty++">+</button>
        </div>

        <!-- Add to Cart -->
        <button
          class="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
          :disabled="!selectedVariant || selectedVariant.stock === 0 || addingToCart"
          @click="addToCart"
        >
          {{ addingToCart ? 'Adding...' : selectedVariant?.stock === 0 ? 'Sold Out' : 'Add to Cart' }}
        </button>

        <!-- Description -->
        <div v-if="product.description" class="mt-8 text-gray-600 text-sm leading-relaxed">
          {{ product.description }}
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="flex items-center justify-center py-32">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
  </div>

  <div v-else class="text-center py-32 text-gray-400">Product not found.</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productsApi } from '@/api/products';
import type { Product, ProductVariant } from '@/api/products';
import { useCartStore } from '@/stores/cart.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const loading = ref(true);
const selectedVariant = ref<ProductVariant | null>(null);
const selectedImage = ref<{ id: string; url: string; alt: string | null } | null>(null);
const qty = ref(1);
const addingToCart = ref(false);

function formatPrice(price?: string | null): string {
  if (!price) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

async function addToCart(): Promise<void> {
  if (!selectedVariant.value) return;

  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  addingToCart.value = true;
  try {
    await cartStore.addItem(selectedVariant.value.id, qty.value);
    notificationStore.success('Added to cart!');
  } catch {
    notificationStore.error('Failed to add to cart');
  } finally {
    addingToCart.value = false;
  }
}

onMounted(async () => {
  try {
    product.value = await productsApi.getBySlug(route.params.slug as string);
    selectedVariant.value = product.value.variants[0] ?? null;
    selectedImage.value = product.value.images[0] ?? null;
  } finally {
    loading.value = false;
  }
});
</script>
