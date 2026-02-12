<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-6">Orders</h2>
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="px-6 py-3 font-medium">Order ID</th>
            <th class="px-6 py-3 font-medium">Customer</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium">Date</th>
            <th class="px-6 py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="5" class="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
          <tr v-for="order in orders" v-else :key="order.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-mono text-xs">#{{ order.id.slice(-8).toUpperCase() }}</td>
            <td class="px-6 py-4 text-gray-500">{{ order.user?.name }}</td>
            <td class="px-6 py-4">
              <select
                :value="order.status"
                class="text-xs border border-gray-300 rounded-lg px-2 py-1"
                @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ new Date(order.createdAt).toLocaleDateString('id-ID') }}</td>
            <td class="px-6 py-4 text-right font-semibold">{{ formatPrice(order.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ordersApi } from '@/api/orders';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
const orders = ref<{ id: string; status: string; total: string; createdAt: string; user?: { name: string } }[]>([]);
const loading = ref(true);
const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

async function fetchOrders(): Promise<void> {
  loading.value = true;
  const res = await ordersApi.adminList();
  orders.value = res.data;
  loading.value = false;
}

async function updateStatus(id: string, status: string): Promise<void> {
  try {
    await ordersApi.adminUpdateStatus(id, status);
    notificationStore.success('Status updated');
    fetchOrders();
  } catch {
    notificationStore.error('Failed to update status');
  }
}

onMounted(fetchOrders);
</script>
