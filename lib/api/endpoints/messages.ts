import { apiClient, type ApiResponse } from '../client';

export type MessageEditHistory = {
  id: string;
  messageId: string;
  contentBefore: string;
  contentAfter: string;
  editedAt: string;
};

export const messagesApi = {
  /**
   * 获取消息
   */
  async get(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/messages/${id}`);
  },

  /**
   * 更新消息（编辑）
   */
  async update(id: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/messages/${id}`, { content });
  },

  /**
   * 删除消息
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/messages/${id}`);
  },

  /**
   * 获取消息编辑历史
   */
  async getEditHistory(id: string): Promise<ApiResponse<{ history: MessageEditHistory[] }>> {
    return apiClient.get<{ history: MessageEditHistory[] }>(`/messages/${id}/edit`);
  },

  /**
   * 获取消息引用
   */
  async getReferences(id: string): Promise<ApiResponse<{ references: string[] }>> {
    return apiClient.get<{ references: string[] }>(`/messages/${id}/references`);
  },

  /**
   * 添加消息引用
   */
  async addReference(fromId: string, toId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/messages/${fromId}/references`, { targetId: toId });
  },
};
