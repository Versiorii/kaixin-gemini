import { apiClient, type ApiResponse } from '../client';

export type ExportFormat = 'markdown' | 'pdf' | 'html' | 'json';

export type ExportOptions = {
  conversationId: string;
  format: ExportFormat;
  messageIndices?: number[];
};

export type ShareLink = {
  id: string;
  conversationId: string;
  token: string;
  expiresAt?: string;
  passwordHash?: string;
  createdAt: string;
};

export const exportApi = {
  /**
   * 导出对话
   */
  async export(options: ExportOptions): Promise<Blob> {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return res.blob();
  },

  /**
   * 生成分享链接
   */
  async createShareLink(
    conversationId: string,
    options?: { expiresAt?: string; password?: string }
  ): Promise<ApiResponse<ShareLink>> {
    return apiClient.post<ShareLink>('/export/share', {
      conversationId,
      ...options,
    });
  },

  /**
   * 获取分享链接
   */
  async getShareLink(token: string): Promise<ApiResponse<{ conversationId: string; title: string; messages: any[] }>> {
    return apiClient.get(`/export/share/${token}`);
  },

  /**
   * 撤销分享链接
   */
  async revokeShareLink(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/export/share/${token}`);
  },
};
