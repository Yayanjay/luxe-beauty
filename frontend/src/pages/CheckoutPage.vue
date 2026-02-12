<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

    <form class="space-y-6" @submit.prevent="placeOrder">
      <!-- Shipping Address -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input v-model="form.fullName" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input v-model="form.phone" type="tel" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea v-model="form.fullAddress" required rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input v-model="form.city" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
            <input v-model="form.province" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input v-model="form.postalCode" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea v-model="notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
      </div>

      <!-- Order Total -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div class="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{{ formatPrice(String(cartStore.total)) }}</span>
        </div>
      </div>

      <button
        type="submit"
        :disabled="placing"
        class="w-full bg-rose-600 text-white font-semibold py-4 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50"
      >
        {{ placing ? 'Processing...' : 'Place Order & Pay' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ordersApi } from '@/api/orders';
import { useCartStore } from '@/stores/cart.store';
import { useNotificationStore } from '@/stores/notification.store';
import apiClient from '@/api/client';

const router = useRouter();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();

const placing = ref(false);
const notes = ref('');
const form = ref({
  fullName: '',
  phone: '',
  fullAddress: '',
  city: '',
  province: '',
  postalCode: '',
});

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

async function placeOrder(): Promise<void> {
  placing.value = true;
  try {
    const order = await ordersApi.create(form.value, notes.value || undefined);

    // Get Midtrans Snap token
    const { data } = await apiClient.post(`/api/payments/midtrans/charge/${order.id}`);
    const snapToken: string = data.snapToken;

    cartStore.clearCart();

    // Open Midtrans Snap popup
    const win = window as unknown as { snap?: { pay: (token: string, opts: Record<string, unknown>) => void } };
    if (win.snap) {
      win.snap.pay(snapToken, {
        onSuccess: () => router.push({ name: 'order-detail', params: { id: order.id } }),
        onPending: () => router.push({ name: 'order-detail', params: { id: order.id } }),
        onError: () => notificationStore.error('Payment failed'),
        onClose: () => router.push({ name: 'orders' }),
      });
    } else {
      router.push({ name: 'order-detail', params: { id: order.id } });
    }
  } catch {
    notificationStore.error('Failed to place order. Please try again.');
  } finally {
    placing.value = false;
  }
}
</script>
