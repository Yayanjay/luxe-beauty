import { defineStore } from 'pinia';
import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);

  function add(type: NotificationType, message: string, duration = 3000): void {
    const id = Math.random().toString(36).slice(2);
    notifications.value.push({ id, type, message });
    setTimeout(() => remove(id), duration);
  }

  function remove(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  const success = (message: string) => add('success', message);
  const error = (message: string) => add('error', message);
  const info = (message: string) => add('info', message);
  const warning = (message: string) => add('warning', message);

  return { notifications, add, remove, success, error, info, warning };
});
