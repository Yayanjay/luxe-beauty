import apiClient from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  children: Category[];
}

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/api/categories').then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<Category>(`/api/categories/${slug}`).then((r) => r.data),

  adminCreate: (data: { name: string; image?: string; parentId?: string }) =>
    apiClient.post<Category>('/api/admin/categories', data).then((r) => r.data),

  adminUpdate: (id: string, data: Partial<{ name: string; image: string; parentId: string }>) =>
    apiClient.patch<Category>(`/api/admin/categories/${id}`, data).then((r) => r.data),

  adminDelete: (id: string) => apiClient.delete(`/api/admin/categories/${id}`),
};
