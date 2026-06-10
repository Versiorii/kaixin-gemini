import { useCallback } from 'react';
import { useConversationStore } from '@/lib/store';
import type { Conversation } from '@/lib/types';

/**
 * 对话管理 hook
 * 处理对话的加载、创建、更新、删除
 */
export function useConversations() {
  const {
    conversations,
    currentId,
    loading,
    error,
    setConversations,
    setCurrentId,
    setLoading,
    setError,
    addConversation,
    updateConversation,
    deleteConversation,
  } = useConversationStore();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = (await res.json()) as { conversations?: Conversation[] };
        setConversations(data.conversations || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载对话失败');
    } finally {
      setLoading(false);
    }
  }, [setConversations, setLoading, setError]);

  const openConversation = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (res.ok) {
          const data = (await res.json()) as {
            conversation: Conversation;
            messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
          };
          setCurrentId(id);
          return data;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '打开对话失败');
      } finally {
        setLoading(false);
      }
    },
    [setCurrentId, setLoading, setError]
  );

  const createConversation = useCallback(
    (title: string, model: string) => {
      const conversation: Conversation = {
        id: `con_${Date.now()}`,
        user_id: 'current',
        title,
        model,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      addConversation(conversation);
      setCurrentId(conversation.id);
      return conversation;
    },
    [addConversation, setCurrentId]
  );

  const archiveConversation = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived_at: new Date().toISOString() }),
        });
        if (res.ok) {
          updateConversation(id, { archived_at: new Date().toISOString() });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '归档失败');
      }
    },
    [updateConversation, setError]
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          updateConversation(id, { title });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '重命名失败');
      }
    },
    [updateConversation, setError]
  );

  const deleteConv = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          deleteConversation(id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除失败');
      }
    },
    [deleteConversation, setError]
  );

  return {
    conversations,
    currentId,
    loading,
    error,
    loadConversations,
    openConversation,
    createConversation,
    archiveConversation,
    renameConversation,
    deleteConversation: deleteConv,
  };
}
