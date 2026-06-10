import { apiClient, type ApiResponse } from '../client';

export type SearchFilter = {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  model?: string;
  hasCode?: boolean;
  tag?: string;
  isUserMessage?: boolean;
};

export type SearchResult = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export const searchApi = {
  /**
   * 搜索对话和消息
   */
  async search(filter: SearchFilter): Promise<ApiResponse<{ results: SearchResult[] }>> {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    return apiClient.get<{ results: SearchResult[] }>(`/search?${params}`);
  },

  /**
   * 获取搜索建议
   */
  async suggestions(query: string): Promise<ApiResponse<{ suggestions: string[] }>> {
    return apiClient.get<{ suggestions: string[] }>(`/search/suggestions?query=${encodeURIComponent(query)}`);
  },
};
