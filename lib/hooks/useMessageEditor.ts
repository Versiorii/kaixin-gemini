import { useCallback } from 'react';
import { useMessageStore } from '@/lib/store';
import type { EditingMessage } from '@/lib/store';

/**
 * 消息编辑 hook
 * 处理消息编辑状态、历史记录等
 */
export function useMessageEditor() {
  const { editingMessage, setEditingMessage } = useMessageStore();

  const startEditing = useCallback(
    (messageId: string, content: string) => {
      const editing: EditingMessage = {
        id: messageId,
        originalContent: content,
        currentContent: content,
        startedAt: Date.now(),
      };
      setEditingMessage(editing);
    },
    [setEditingMessage]
  );

  const updateEditingContent = useCallback(
    (content: string) => {
      if (editingMessage) {
        setEditingMessage({
          ...editingMessage,
          currentContent: content,
        });
      }
    },
    [editingMessage, setEditingMessage]
  );

  const finishEditing = useCallback(async () => {
    if (!editingMessage) return;

    const { originalContent, currentContent } = editingMessage;

    if (currentContent !== originalContent) {
      // 保存编辑到服务器
      // await fetch(`/api/messages/${id}`, { method: 'PATCH', ... })
    }

    setEditingMessage(null);
  }, [editingMessage, setEditingMessage]);

  const cancelEditing = useCallback(() => {
    setEditingMessage(null);
  }, [setEditingMessage]);

  const getEditingState = useCallback(() => {
    return editingMessage;
  }, [editingMessage]);

  return {
    editingMessage,
    startEditing,
    updateEditingContent,
    finishEditing,
    cancelEditing,
    getEditingState,
  };
}
