<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-gray-700">
        <span class="text-lg font-bold">Luxe Admin</span>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-1">
        <AdminNavItem to="/admin" :exact="true" icon="chart-bar">Dashboard</AdminNavItem>
        <AdminNavItem to="/admin/products" icon="cube">Products</AdminNavItem>
        <AdminNavItem to="/admin/categories" icon="tag">Categories</AdminNavItem>
        <AdminNavItem to="/admin/orders" icon="clipboard-list">Orders</AdminNavItem>
        <AdminNavItem to="/admin/users" icon="users">Users</AdminNavItem>
        <AdminNavItem to="/admin/cms" icon="document-text">CMS Pages</AdminNavItem>
        <AdminNavItem to="/admin/banners" icon="photograph">Banners</AdminNavItem>
        <AdminNavItem to="/admin/settings" icon="cog">Settings</AdminNavItem>
      </nav>
      <div class="px-4 py-4 border-t border-gray-700">
        <RouterLink to="/" class="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to store
        </RouterLink>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span>{{ authStore.user?.name }}</span>
          <button class="text-gray-400 hover:text-gray-700" @click="authStore.logout()">Logout</button>
        </div>
      </header>

      <main class="flex-1 p-8 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import AdminNavItem from '@/components/admin/AdminNavItem.vue';

const authStore = useAuthStore();
const route = useRoute();

const pageTitle = computed(() => {
  const name = String(route.name ?? '');
  return name.replace('admin-', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
});
</script>
