import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartApi } from '@/api/cart';
import type { Cart } from '@/api/cart';
import { useAuthStore } from './auth.store';

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart | null>(null);
  const loading = ref(false);

  const itemCount = computed(() =>
    cart.value?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  const total = computed(() =>
    cart.value?.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    ) ?? 0,
  );

  async function fetchCart(): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;
    loading.value = true;
    try {
      cart.value = await cartApi.get();
    } finally {
      loading.value = false;
    }
  }

  async function addItem(variantId: string, quantity = 1): Promise<void> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      // Redirect to login or handle guest cart
      return;
    }
    cart.value = await cartApi.addItem(variantId, quantity);
  }

  async function updateItem(itemId: string, quantity: number): Promise<void> {
    cart.value = await cartApi.updateItem(itemId, quantity);
  }

  async function removeItem(itemId: string): Promise<void> {
    cart.value = await cartApi.removeItem(itemId);
  }

  function clearCart(): void {
    cart.value = null;
  }

  return { cart, loading, itemCount, total, fetchCart, addItem, updateItem, removeItem, clearCart };
});
