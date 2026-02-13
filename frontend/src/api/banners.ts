import apiClient from './client';

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerInput {
  title: string;
  image: string;
  link?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateBannerInput {
  title?: string;
  image?: string;
  link?: string;
  position?: number;
  isActive?: boolean;
}

export const bannersApi = {
  list: async (): Promise<Banner[]> => {
    const response = await apiClient.get<Banner[]>('/banners');
    return response.data;
  },

  adminList: async (): Promise<Banner[]> => {
    const response = await apiClient.get<Banner[]>('/admin/banners');
    return response.data;
  },

  create: async (data: CreateBannerInput): Promise<Banner> => {
    const response = await apiClient.post<Banner>('/admin/banners', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBannerInput): Promise<Banner> => {
    const response = await apiClient.patch<Banner>(`/admin/banners/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};

export default bannersApi;
