import { apiClient, type ApiResponse } from '../client';
import type { ChatMessage } from '@/lib/types';

export type ChatRequest = {
  conversationId?: string;
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
};

export type ChatResponse = {
  conversationId: string;
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
};

export const chatApi = {
  /**
   * 发送聊天消息（流式）
   */
  async send(request: ChatRequest, signal?: AbortSignal): Promise<Response> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    return res;
  },

  /**
   * 发送聊天消息（非流式）
   */
  async sendNonStream(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return apiClient.post<ChatResponse>('/chat', request);
  },
};
