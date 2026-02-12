<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <div v-else-if="orders.length" class="space-y-4">
      <RouterLink
        v-for="order in orders"
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-gray-900 text-sm">Order #{{ order.id.slice(-8).toUpperCase() }}</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
            <p class="text-sm text-gray-500">{{ order.items.length }} item(s)</p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': order.status === 'PAID' || order.status === 'DELIVERED',
                'bg-yellow-100 text-yellow-800': order.status === 'PENDING' || order.status === 'PROCESSING',
                'bg-blue-100 text-blue-800': order.status === 'SHIPPED',
                'bg-red-100 text-red-800': order.status === 'CANCELLED',
              }"
            >{{ order.status }}</span>
            <p class="font-bold text-gray-900 text-lg mt-1">{{ formatPrice(order.total) }}</p>
          </div>
        </div>
      </RouterLink>
    </div>

    <div v-else class="text-center py-24">
      <p class="text-gray-400">No orders yet.</p>
      <RouterLink to="/" class="mt-4 inline-block bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-700">Shop Now</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { ordersApi } from '@/api/orders';
import type { Order } from '@/api/orders';

const orders = ref<Order[]>([]);
const loading = ref(true);

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

onMounted(async () => {
  try {
    const res = await ordersApi.list();
    orders.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>
