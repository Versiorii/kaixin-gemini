import { apiClient, type ApiResponse } from '../client';
import type { Conversation } from '@/lib/types';

export const conversationsApi = {
  /**
   * 获取所有对话
   */
  async list(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    return apiClient.get<{ conversations: Conversation[] }>('/conversations');
  },

  /**
   * 获取单个对话
   */
  async get(id: string): Promise<ApiResponse<{ conversation: Conversation; messages: any[] }>> {
    return apiClient.get(`/conversations/${id}`);
  },

  /**
   * 更新对话
   */
  async update(id: string, updates: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    return apiClient.patch<Conversation>(`/conversations/${id}`, updates);
  },

  /**
   * 删除对话
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/conversations/${id}`);
  },

  /**
   * 归档对话
   */
  async archive(id: string): Promise<ApiResponse<Conversation>> {
    return apiClient.patch<Conversation>(`/conversations/${id}`, {
      archived_at: new Date().toISOString(),
    });
  },
};
