import { useCallback, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import type { ChatMessage } from '@/lib/types';

/**
 * 聊天流操作 hook
 * 处理消息发送、流式接收、中断等
 */
export function useChat() {
  const {
    model,
    isStreaming,
    streamingContent,
    setModel,
    setIsStreaming,
    appendStreamingContent,
    clearStreamingContent,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (messages: ChatMessage[], onStream?: (content: string) => void) => {
      setIsStreaming(true);
      clearStreamingContent();

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.body) {
          throw new Error('无响应体');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;

            try {
              const data = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
              };
              const content = data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || '';
              fullContent += content;
              appendStreamingContent(content);
              onStream?.(content);
            } catch {
              // 忽略 JSON 解析错误
            }
          }
        }

        return fullContent;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [model, setIsStreaming, clearStreamingContent, appendStreamingContent]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  const changeModel = useCallback(
    (newModel: string) => {
      setModel(newModel);
    },
    [setModel]
  );

  return {
    model,
    isStreaming,
    streamingContent,
    sendMessage,
    stopStreaming,
    changeModel,
  };
}
