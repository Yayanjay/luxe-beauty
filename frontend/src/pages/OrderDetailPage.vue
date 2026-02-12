<template>
  <div v-if="order" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <RouterLink to="/orders" class="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-6">
      ← Back to Orders
    </RouterLink>
    <div class="flex justify-between items-start mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Order #{{ order.id.slice(-8).toUpperCase() }}</h1>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {{ order.status }}
      </span>
    </div>

    <!-- Items -->
    <div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Items</h2>
      <div class="space-y-4">
        <div v-for="item in order.items" :key="item.id" class="flex gap-4">
          <img
            :src="item.variant.product.images[0]?.url ?? 'https://placehold.co/64'"
            class="w-16 h-16 object-cover rounded-xl bg-gray-100"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ item.variant.product.name }}</p>
            <p class="text-sm text-gray-500">{{ item.variant.sku }} × {{ item.quantity }}</p>
          </div>
          <p class="font-semibold">{{ formatPrice(String(Number(item.price) * item.quantity)) }}</p>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 class="font-semibold text-gray-900 mb-4">Summary</h2>
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex justify-between"><span>Subtotal</span><span>{{ formatPrice(order.subtotal) }}</span></div>
        <div class="flex justify-between"><span>Shipping</span><span>{{ formatPrice(order.shippingCost) }}</span></div>
        <div class="border-t pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>{{ formatPrice(order.total) }}</span></div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center py-32">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ordersApi } from '@/api/orders';
import type { Order } from '@/api/orders';

const route = useRoute();
const order = ref<Order | null>(null);

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

onMounted(async () => {
  order.value = await ordersApi.getById(route.params.id as string);
});
</script>
