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
    apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Product>(`/products/${slug}`).then((r) => r.data),

  // Admin
  adminList: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Product>>('/admin/products', { params }).then((r) => r.data),

  adminCreate: (data: { name: string; description?: string; categoryId: string; isActive?: boolean }) =>
    apiClient.post<Product>('/admin/products', data).then((r) => r.data),

  adminUpdate: (id: string, data: Partial<{ name: string; description: string; categoryId: string; isActive: boolean }>) =>
    apiClient.patch<Product>(`/admin/products/${id}`, data).then((r) => r.data),

  adminDelete: (id: string) =>
    apiClient.delete(`/admin/products/${id}`),

  // Product Images
  addImage: (productId: string, file: File, alt?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    return apiClient.post<{ id: string; url: string; alt: string | null }>(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  removeImage: (productId: string, imageId: string) =>
    apiClient.delete(`/admin/products/${productId}/images/${imageId}`),

  reorderImages: (productId: string, imageIds: string[]) =>
    apiClient.patch(`/admin/products/${productId}/images/reorder`, { imageIds }),
};

export default productsApi;
