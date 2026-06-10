import { apiClient, type ApiResponse } from '../client';

export type FileInfo = {
  id: string;
  userId: string;
  conversationId?: string;
  r2Key: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export const filesApi = {
  /**
   * 获取所有文件
   */
  async list(): Promise<ApiResponse<{ files: FileInfo[] }>> {
    return apiClient.get<{ files: FileInfo[] }>('/files');
  },

  /**
   * 获取单个文件
   */
  async get(id: string): Promise<ApiResponse<FileInfo>> {
    return apiClient.get<FileInfo>(`/files/${id}`);
  },

  /**
   * 上传文件
   */
  async upload(file: File, conversationId?: string): Promise<ApiResponse<FileInfo>> {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    const res = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data: data as FileInfo,
      error: res.ok ? undefined : 'Upload failed',
    };
  },

  /**
   * 删除文件
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/files/${id}`);
  },

  /**
   * 获取文件下载链接
   */
  async getDownloadUrl(id: string): Promise<ApiResponse<{ url: string }>> {
    return apiClient.get<{ url: string }>(`/files/${id}/download`);
  },
};
