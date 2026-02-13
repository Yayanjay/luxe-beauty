import apiClient from './client';

export interface UploadResponse {
  url: string;
  key: string;
}

export const uploadApi = {
  uploadImage: async (file: File, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const params = folder ? { folder } : undefined;
    const response = await apiClient.post<UploadResponse>('/api/upload/image', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default uploadApi;
