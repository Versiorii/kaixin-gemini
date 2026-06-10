import { apiClient, type ApiResponse } from '../client';

export type WorkflowTemplate = {
  id: string;
  userId: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStep = {
  id: string;
  type: 'question' | 'model_call' | 'code_execution' | 'wait';
  config: Record<string, unknown>;
  nextSteps?: Record<string, string>; // condition -> stepId
};

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  results: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
};

export const workflowsApi = {
  /**
   * 获取所有工作流
   */
  async list(): Promise<ApiResponse<{ workflows: WorkflowTemplate[] }>> {
    return apiClient.get<{ workflows: WorkflowTemplate[] }>('/workflows');
  },

  /**
   * 获取单个工作流
   */
  async get(id: string): Promise<ApiResponse<WorkflowTemplate>> {
    return apiClient.get<WorkflowTemplate>(`/workflows/${id}`);
  },

  /**
   * 创建工作流
   */
  async create(workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WorkflowTemplate>> {
    return apiClient.post<WorkflowTemplate>('/workflows', workflow);
  },

  /**
   * 更新工作流
   */
  async update(id: string, updates: Partial<WorkflowTemplate>): Promise<ApiResponse<WorkflowTemplate>> {
    return apiClient.patch<WorkflowTemplate>(`/workflows/${id}`, updates);
  },

  /**
   * 删除工作流
   */
  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/workflows/${id}`);
  },

  /**
   * 执行工作流
   */
  async execute(id: string, input: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
    return fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal,
    });
  },

  /**
   * 获取执行历史
   */
  async getExecutionHistory(id: string): Promise<ApiResponse<{ executions: WorkflowExecution[] }>> {
    return apiClient.get<{ executions: WorkflowExecution[] }>(`/workflows/${id}/history`);
  },
};
