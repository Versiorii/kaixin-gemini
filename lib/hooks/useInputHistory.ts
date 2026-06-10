import { useChatStore } from '@/lib/store';
import { useCallback } from 'react';

/**
 * 输入历史 hook
 * 管理用户输入历史记录（支持 Up/Down 浏览）
 */
export function useInputHistory() {
  const { inputHistory, inputHistoryIndex, addInputHistory, setInputHistoryIndex } = useChatStore();

  const addToHistory = useCallback(
    (input: string) => {
      if (input.trim()) {
        addInputHistory(input);
      }
    },
    [addInputHistory]
  );

  const goToPreviousInput = useCallback(() => {
    let nextIndex = inputHistoryIndex + 1;
    if (nextIndex > inputHistory.length) {
      nextIndex = inputHistory.length;
    }
    setInputHistoryIndex(nextIndex);
    return inputHistory[inputHistory.length - 1 - nextIndex] || '';
  }, [inputHistory, inputHistoryIndex, setInputHistoryIndex]);

  const goToNextInput = useCallback(() => {
    let nextIndex = inputHistoryIndex - 1;
    if (nextIndex < -1) {
      nextIndex = -1;
    }
    setInputHistoryIndex(nextIndex);
    if (nextIndex === -1) {
      return '';
    }
    return inputHistory[inputHistory.length - 1 - nextIndex] || '';
  }, [inputHistory, inputHistoryIndex, setInputHistoryIndex]);

  const clearHistory = useCallback(() => {
    setInputHistoryIndex(-1);
  }, [setInputHistoryIndex]);

  return {
    inputHistory,
    inputHistoryIndex,
    addToHistory,
    goToPreviousInput,
    goToNextInput,
    clearHistory,
  };
}
