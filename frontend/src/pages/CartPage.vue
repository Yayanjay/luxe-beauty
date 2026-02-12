<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

    <div v-if="!authStore.isAuthenticated" class="text-center py-24">
      <p class="text-gray-500 mb-4">Please login to view your cart.</p>
      <RouterLink to="/login" class="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-700">Login</RouterLink>
    </div>

    <div v-else-if="cartStore.cart?.items.length" class="grid lg:grid-cols-3 gap-10">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.cart.items"
          :key="item.id"
          class="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
        >
          <img
            :src="item.variant.product.images[0]?.url ?? 'https://placehold.co/80'"
            :alt="item.variant.product.name"
            class="w-20 h-20 rounded-xl object-cover bg-gray-100"
          />
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/product/${item.variant.product.slug}`" class="font-semibold text-gray-900 hover:text-rose-600">
              {{ item.variant.product.name }}
            </RouterLink>
            <p class="text-sm text-gray-500 mt-0.5">{{ Object.values(item.variant.attributes).join(', ') || item.variant.sku }}</p>
            <p class="font-bold text-gray-900 mt-1">{{ formatPrice(item.variant.price) }}</p>
          </div>
          <div class="flex flex-col items-end justify-between">
            <button class="text-gray-400 hover:text-red-500" @click="cartStore.removeItem(item.id)">✕</button>
            <div class="flex items-center gap-2">
              <button class="w-7 h-7 border rounded-lg text-sm" @click="cartStore.updateItem(item.id, item.quantity - 1)">−</button>
              <span class="text-sm font-medium">{{ item.quantity }}</span>
              <button class="w-7 h-7 border rounded-lg text-sm" @click="cartStore.updateItem(item.id, item.quantity + 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
        <h2 class="font-semibold text-gray-900 text-lg mb-4">Order Summary</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{{ formatPrice(String(cartStore.total)) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="border-t pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{{ formatPrice(String(cartStore.total)) }}</span>
          </div>
        </div>
        <RouterLink
          to="/checkout"
          class="mt-6 block w-full bg-rose-600 text-white text-center font-semibold py-3 rounded-xl hover:bg-rose-700 transition-colors"
        >Proceed to Checkout</RouterLink>
      </div>
    </div>

    <div v-else class="text-center py-24">
      <p class="text-gray-400 text-lg mb-4">Your cart is empty.</p>
      <RouterLink to="/" class="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-700">Start Shopping</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';

const cartStore = useCartStore();
const authStore = useAuthStore();

function formatPrice(price: string): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price));
}

onMounted(() => { cartStore.fetchCart(); });
</script>
