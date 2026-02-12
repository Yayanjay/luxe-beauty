<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="n in notificationStore.notifications"
        :key="n.id"
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white min-w-[260px]"
        :class="{
          'bg-green-600': n.type === 'success',
          'bg-red-600': n.type === 'error',
          'bg-blue-600': n.type === 'info',
          'bg-amber-500': n.type === 'warning',
        }"
      >
        {{ n.message }}
        <button class="ml-auto opacity-70 hover:opacity-100" @click="notificationStore.remove(n.id)">
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { transform: translateX(100%); opacity: 0; }
.toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
