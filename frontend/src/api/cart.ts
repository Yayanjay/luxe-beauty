import apiClient from './client';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: string;
    attributes: Record<string, string>;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string; alt: string | null }[];
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export const cartApi = {
  get: () => apiClient.get<Cart>('/api/cart').then((r) => r.data),

  addItem: (variantId: string, quantity: number) =>
    apiClient.post<Cart>('/api/cart/items', { variantId, quantity }).then((r) => r.data),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch<Cart>(`/api/cart/items/${itemId}`, { quantity }).then((r) => r.data),

  removeItem: (itemId: string) =>
    apiClient.delete<Cart>(`/api/cart/items/${itemId}`).then((r) => r.data),
};
