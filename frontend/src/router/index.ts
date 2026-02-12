import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ─── Storefront Layout ────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/components/layouts/StorefrontLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
        },
        {
          path: 'category/:slug',
          name: 'category',
          component: () => import('@/pages/CategoryPage.vue'),
        },
        {
          path: 'product/:slug',
          name: 'product',
          component: () => import('@/pages/ProductPage.vue'),
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/pages/CartPage.vue'),
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/pages/CheckoutPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/pages/OrdersPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/pages/OrderDetailPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'page/:slug',
          name: 'cms-page',
          component: () => import('@/pages/CmsPage.vue'),
        },
      ],
    },

    // ─── Auth (no layout) ─────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/pages/AuthCallbackPage.vue'),
    },

    // ─── Admin Layout ─────────────────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/components/layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/DashboardPage.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/pages/admin/ProductsPage.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/pages/admin/CategoriesPage.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/pages/admin/OrdersPage.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/pages/admin/UsersPage.vue'),
        },
        {
          path: 'cms',
          name: 'admin-cms',
          component: () => import('@/pages/admin/CmsPage.vue'),
        },
        {
          path: 'banners',
          name: 'admin-banners',
          component: () => import('@/pages/admin/BannersPage.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/SettingsPage.vue'),
        },
      ],
    },

    // ─── 404 ─────────────────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Restore user session on first load
  if (!authStore.user && authStore.accessToken) {
    await authStore.fetchMe();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;
