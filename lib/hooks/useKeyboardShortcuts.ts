import { useEffect, useCallback } from 'react';

/**
 * 键盘快捷键 hook
 * 处理全局快捷键事件
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+K: 打开快速命令面板
      if (modKey && e.key === 'k') {
        e.preventDefault();
        shortcuts['cmd+k']?.();
      }

      // Cmd/Ctrl+M: 模型切换
      if (modKey && e.key === 'm') {
        e.preventDefault();
        shortcuts['cmd+m']?.();
      }

      // Cmd/Ctrl+/: 搜索
      if (modKey && e.key === '/') {
        e.preventDefault();
        shortcuts['cmd+/']?.();
      }

      // Cmd/Ctrl+E: 导出
      if (modKey && e.key === 'e') {
        e.preventDefault();
        shortcuts['cmd+e']?.();
      }

      // Cmd/Ctrl+N: 新建对话
      if (modKey && e.key === 'n') {
        e.preventDefault();
        shortcuts['cmd+n']?.();
      }

      // Cmd/Ctrl+L: 清空消息
      if (modKey && e.key === 'l') {
        e.preventDefault();
        shortcuts['cmd+l']?.();
      }

      // ?: 快捷键帮助
      if (e.key === '?' && !modKey && e.shiftKey) {
        e.preventDefault();
        shortcuts['help']?.();
      }

      // Cmd/Ctrl+Shift+C: 复制消息
      if (modKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        shortcuts['cmd+shift+c']?.();
      }

      // Cmd/Ctrl+Shift+E: 编辑消息
      if (modKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        shortcuts['cmd+shift+e']?.();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { handleKeyDown };
}
