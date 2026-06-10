import { apiClient, type ApiResponse } from '../client';

export type PromptTemplate = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  content: string;
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export const templatesApi = {
  /**
   * 获取所有模板
   */
  async list(): Promise<ApiResponse<{ templates: PromptTemplate[] }>> {
    return apiClient.get<{ templates: PromptTemplate[] }>('/templates');
  },

  /**
   * 获取单个模板
   */
  async get(id: string): Promise<ApiResponse<PromptTemplate>> {
    return apiClient.get<PromptTemplate>(`/templates/${id}`);
  },

  /**
   * 创建模板
   */
  async create(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ApiResponse<PromptTemplate>> {
    return apiClient.post<PromptTemplate>('/templates', template);
  },

  /**
   * 更新模板
   */
  async update(id: string, updates: Partial<PromptTemplate>): Promise<ApiResponse<PromptTemplate>> {
    return apiClient.patch<PromptTemplate>(`/templates/${id}`, updates);
  },

  /**
   * 删除模板
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/templates/${id}`);
  },

  /**
   * 按分类获取模板
   */
  async getByCategory(category: string): Promise<ApiResponse<{ templates: PromptTemplate[] }>> {
    return apiClient.get<{ templates: PromptTemplate[] }>(`/templates?category=${encodeURIComponent(category)}`);
  },
};
