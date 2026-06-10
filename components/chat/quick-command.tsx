"use client";

import React from 'react';
import { Command } from 'lucide-react';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { Dialog } from '@/components/common/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface QuickCommand {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keys?: string;
}

interface QuickCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: QuickCommand[];
}

export function QuickCommandPalette({ open, onOpenChange, commands }: QuickCommandPaletteProps) {
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!search) return commands;
    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, commands]);

  React.useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="快速命令"
      description="按 Cmd+K 打开，输入搜索或选择命令"
      size="lg"
    >
      <div className="space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Command className="absolute left-3 top-3 text-cyber-cyan/60" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索命令..."
            autoFocus
            className="pl-10 h-10"
          />
        </div>

        {/* 命令列表 */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center text-cyber-muted text-sm py-4">未找到命令</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between p-3 border border-cyber-cyan/25 bg-cyber-black/50 hover:bg-cyber-cyan/10 transition rounded text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-cyber-cyan">{cmd.icon}</span>
                  <div>
                    <p className="font-bold text-cyber-text text-sm">{cmd.name}</p>
                    <p className="text-xs text-cyber-muted">{cmd.description}</p>
                  </div>
                </div>
                {cmd.keys && <span className="text-xs text-cyber-muted">{cmd.keys}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}

// 快捷键帮助面板
interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsHelp({ open, onOpenChange }: ShortcutsHelpProps) {
  const shortcuts = [
    { keys: 'Cmd+K / Ctrl+K', action: '打开快速命令' },
    { keys: 'Cmd+M / Ctrl+M', action: '模型切换' },
    { keys: 'Cmd+/ / Ctrl+/', action: '打开搜索' },
    { keys: 'Cmd+E / Ctrl+E', action: '导出对话' },
    { keys: 'Cmd+N / Ctrl+N', action: '新建对话' },
    { keys: 'Cmd+L / Ctrl+L', action: '清空消息' },
    { keys: 'Up / Down', action: '浏览输入历史' },
    { keys: 'Cmd+Shift+C / Ctrl+Shift+C', action: '复制消息' },
    { keys: 'Cmd+Shift+E / Ctrl+Shift+E', action: '编辑消息' },
    { keys: 'Shift+?', action: '显示快捷键帮助' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="键盘快捷键"
      description="快速操作指南"
      size="md"
    >
      <div className="space-y-2">
        {shortcuts.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 border border-cyber-cyan/25 bg-cyber-black/50 rounded"
          >
            <p className="text-sm text-cyber-text">{item.action}</p>
            <code className="text-xs bg-cyber-metal px-2 py-1 rounded text-cyber-green font-mono">
              {item.keys}
            </code>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
