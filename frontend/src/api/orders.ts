import apiClient from './client';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingCost: string;
  total: string;
  shippingAddress: ShippingAddress;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  variant: {
    sku: string;
    product: { name: string; images: { url: string }[] };
  };
}

export const ordersApi = {
  create: (shippingAddress: ShippingAddress, notes?: string) =>
    apiClient.post<Order>('/orders', { shippingAddress, notes }).then((r) => r.data),

  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: Order[]; total: number }>('/orders', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  // Admin
  adminList: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/admin/orders', { params }).then((r) => r.data),

  adminUpdateStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};
