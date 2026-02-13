<template>
  <div>
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="h-28 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard label="Total Orders" :value="String(stats.totalOrders)" color="rose" />
      <StatCard label="Paid Orders" :value="String(stats.paidOrders)" color="green" />
      <StatCard label="Customers" :value="String(stats.totalCustomers)" color="blue" />
      <StatCard label="Revenue (Month)" :value="formatPrice(String(stats.monthlyRevenue))" color="amber" />
    </div>

    <!-- Recent Orders -->
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 class="font-semibold text-gray-900 mb-4">Recent Orders</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-gray-500 border-b">
            <tr>
              <th class="pb-3 font-medium">Order ID</th>
              <th class="pb-3 font-medium">Customer</th>
              <th class="pb-3 font-medium">Status</th>
              <th class="pb-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in stats.recentOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="py-3 font-mono text-xs">#{{ order.id.slice(-8).toUpperCase() }}</td>
              <td class="py-3">{{ order.user?.name }}</td>
              <td class="py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{{ order.status }}</span>
              </td>
              <td class="py-3 text-right font-semibold">{{ formatPrice(order.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import StatCard from '@/components/admin/StatCard.vue';

const loading = ref(true);
const stats = ref({
  totalOrders: 0,
  paidOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  monthlyRevenue: 0,
  recentOrders: [] as { id: string; status: string; total: string; user?: { name: string } }[],
});

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/admin/dashboard');
    stats.value = data;
  } finally {
    loading.value = false;
  }
});
</script>
