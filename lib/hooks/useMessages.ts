import { useCallback } from 'react';
import { useMessageStore } from '@/lib/store';
import type { Message } from '@/lib/types';

/**
 * 消息管理 hook
 * 处理消息的添加、编辑、删除、选中等操作
 */
export function useMessages() {
  const {
    messages,
    editingMessage,
    selectedMessageIds,
    messageReferences,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setEditingMessage,
    toggleMessageSelection,
    clearSelection,
    addMessageReference,
    clearMessages,
  } = useMessageStore();

  const appendMessage = useCallback(
    (message: Message) => {
      addMessage(message);
    },
    [addMessage]
  );

  const updateLastMessage = useCallback(
    (content: string) => {
      if (messages.length > 0) {
        updateMessage(messages.length - 1, { content });
      }
    },
    [messages.length, updateMessage]
  );

  const editMessage = useCallback(
    (index: number) => {
      if (messages[index]) {
        setEditingMessage({
          id: `msg_${index}`,
          originalContent: messages[index].content,
          currentContent: messages[index].content,
          startedAt: Date.now(),
        });
      }
    },
    [messages, setEditingMessage]
  );

  const saveMessageEdit = useCallback(
    async (index: number, newContent: string) => {
      if (editingMessage && newContent !== editingMessage.originalContent) {
        // 保存到服务器
        // await fetch(`/api/messages/${id}`, { method: 'PATCH', ... })
        updateMessage(index, { content: newContent });
      }
      setEditingMessage(null);
    },
    [editingMessage, updateMessage, setEditingMessage]
  );

  const cancelMessageEdit = useCallback(() => {
    setEditingMessage(null);
  }, [setEditingMessage]);

  const removeMessage = useCallback(
    (index: number) => {
      deleteMessage(index);
    },
    [deleteMessage]
  );

  const selectMessage = useCallback(
    (index: number) => {
      toggleMessageSelection(index);
    },
    [toggleMessageSelection]
  );

  const clearMessageSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const getSelectedMessages = useCallback(() => {
    return messages.filter((_, i) => selectedMessageIds.has(String(i)));
  }, [messages, selectedMessageIds]);

  const referenceMessage = useCallback(
    (fromIndex: string, toIndex: string) => {
      addMessageReference(fromIndex, toIndex);
    },
    [addMessageReference]
  );

  const getMessageReferences = useCallback(
    (msgId: string) => {
      return messageReferences.get(msgId) || [];
    },
    [messageReferences]
  );

  const clearAllMessages = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  return {
    messages,
    editingMessage,
    selectedMessageIds,
    messageReferences,
    appendMessage,
    updateLastMessage,
    editMessage,
    saveMessageEdit,
    cancelMessageEdit,
    removeMessage,
    selectMessage,
    clearMessageSelection,
    getSelectedMessages,
    referenceMessage,
    getMessageReferences,
    clearAllMessages,
  };
}
