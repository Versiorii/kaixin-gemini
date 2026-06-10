/**
 * API 客户端
 * 提供统一的 API 请求处理、错误处理、缓存等
 */

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  cache?: 'no-store' | 'force-cache';
};

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

class ApiClient {
  private baseURL: string;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 分钟

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * 发送请求
   */
  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // 检查缓存
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return { ok: true, status: 200, data: cached.data as T };
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: typeof data === 'object' && data !== null && 'error' in data
            ? String((data as Record<string, unknown>).error)
            : response.statusText,
        };
      }

      // 缓存成功的 GET 请求
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return { ok: true, status: response.status, data: data as T };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ok: false, status: 0, error: '请求已取消' };
      }
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * GET 请求
   */
  async get<T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', signal });
  }

  /**
   * POST 请求
   */
  async post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body, signal });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'PATCH', body, signal });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE', signal });
  }

  /**
   * 清除缓存
   */
  clearCache(path?: string): void {
    if (path) {
      // 清除特定路径的缓存
      for (const key of this.cache.keys()) {
        if (key.includes(path)) {
          this.cache.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear();
    }
  }
}

// 创建全局 API 客户端实例
export const apiClient = new ApiClient('/api');

// 导出类型
export type { ApiResponse, RequestOptions };
