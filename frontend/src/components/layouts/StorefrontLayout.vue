<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <RouterLink to="/" class="text-2xl font-bold tracking-tight text-gray-900">
          Luxe Beauty
        </RouterLink>

        <nav class="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <RouterLink to="/" class="hover:text-gray-900">Home</RouterLink>
          <RouterLink to="/category/skincare" class="hover:text-gray-900">Skincare</RouterLink>
          <RouterLink to="/category/makeup" class="hover:text-gray-900">Makeup</RouterLink>
        </nav>

        <div class="flex items-center gap-4">
          <RouterLink to="/cart" class="relative text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >{{ cartStore.itemCount }}</span>
          </RouterLink>

          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/login"
            class="text-sm font-medium text-gray-700 hover:text-gray-900"
          >Login</RouterLink>

          <template v-else>
            <RouterLink to="/profile" class="text-sm font-medium text-gray-700 hover:text-gray-900">
              {{ authStore.user?.name }}
            </RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="text-sm text-rose-600 font-medium">
              Admin
            </RouterLink>
            <button
              class="text-sm text-gray-500 hover:text-gray-900"
              @click="authStore.logout()"
            >Logout</button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p class="text-white font-semibold text-lg mb-2">Luxe Beauty</p>
        <p>Your beauty, elevated.</p>
        <div class="mt-4 flex justify-center gap-6">
          <RouterLink to="/page/about" class="hover:text-white">About</RouterLink>
          <RouterLink to="/page/faq" class="hover:text-white">FAQ</RouterLink>
          <RouterLink to="/page/privacy" class="hover:text-white">Privacy</RouterLink>
        </div>
        <p class="mt-6">&copy; {{ new Date().getFullYear() }} Luxe Beauty. All rights reserved.</p>
      </div>
    </footer>

    <!-- Notification Toast -->
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import NotificationToast from '@/components/ui/NotificationToast.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
</script>
