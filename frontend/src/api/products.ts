import apiClient from './client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string | null }[];
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  attributes: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const productsApi = {
  list: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    apiClient.get<PaginatedResponse<Product>>('/api/products', { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Product>(`/api/products/${slug}`).then((r) => r.data),

  // Admin
  adminList: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Product>>('/api/admin/products', { params }).then((r) => r.data),

  adminCreate: (data: { name: string; description?: string; categoryId: string; isActive?: boolean }) =>
    apiClient.post<Product>('/api/admin/products', data).then((r) => r.data),

  adminUpdate: (id: string, data: Partial<{ name: string; description: string; categoryId: string; isActive: boolean }>) =>
    apiClient.patch<Product>(`/api/admin/products/${id}`, data).then((r) => r.data),

  adminDelete: (id: string) =>
    apiClient.delete(`/api/admin/products/${id}`),
};
