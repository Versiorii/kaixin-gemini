"use client";

import React, { useState } from 'react';
import { Copy, Edit2, Trash2, Reply, MoreVertical, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropdown, type DropdownOption } from '@/components/common/dropdown';
import { Dialog } from '@/components/common/dialog';
import { MarkdownMessage } from './markdown-message';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageIndex: number;
  isEditing?: boolean;
  editingContent?: string;
  onEdit?: (index: number) => void;
  onSaveEdit?: (index: number, content: string) => void;
  onCancelEdit?: () => void;
  onDelete?: (index: number) => void;
  onCopy?: () => void;
  onReference?: (index: number) => void;
  showEditHistory?: boolean;
  editHistory?: Array<{ before: string; after: string; editedAt: string }>;
}

export function MessageBubble({
  role,
  content,
  messageIndex,
  isEditing = false,
  editingContent = '',
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onCopy,
  onReference,
  showEditHistory = false,
  editHistory = [],
}: MessageBubbleProps) {
  const [editContent, setEditContent] = useState(editingContent);
  const [showHistory, setShowHistory] = useState(false);
  const [hovering, setHovering] = useState(false);

  const isUserMessage = role === 'user';

  // 菜单选项
  const menuOptions: DropdownOption[] = [
    { label: '复制', value: 'copy', icon: <Copy size={14} /> },
    { label: '编辑', value: 'edit', icon: <Edit2 size={14} /> },
    { label: '引用', value: 'reference', icon: <Reply size={14} /> },
    { label: '删除', value: 'delete', icon: <Trash2 size={14} />, divider: true },
  ];

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case 'copy':
        onCopy?.();
        break;
      case 'edit':
        onEdit?.(messageIndex);
        break;
      case 'reference':
        onReference?.(messageIndex);
        break;
      case 'delete':
        onDelete?.(messageIndex);
        break;
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-[92%] md:max-w-[74%] mx-auto">
        <div className="border border-cyber-green/45 bg-cyber-green/10 p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyber-muted">✎ 编辑消息</p>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-cyber-cyan/40 bg-cyber-black text-cyber-text text-sm min-h-24 font-mono"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancelEdit}
              className="text-xs"
            >
              取消
            </Button>
            <Button
              onClick={() => onSaveEdit?.(messageIndex, editContent)}
              className="text-xs"
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={isUserMessage ? 'flex justify-end' : 'flex justify-start'}
    >
      <div
        className={`group relative ${
          isUserMessage
            ? 'max-w-[92%] md:max-w-[74%] border border-cyber-green/45 bg-cyber-green/10 p-4'
            : 'w-full cyber-panel max-w-none p-5'
        }`}
      >
        {/* 头部 */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-cyber-muted">
            {isUserMessage ? (
              <>
                <span>📝 operator tape</span>
              </>
            ) : (
              <>
                <span>🤖 synth response</span>
              </>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-[.16em] text-cyber-muted">
            #{String(messageIndex + 1).padStart(3, '0')}
          </span>
        </div>

        {/* 内容 */}
        <div className="text-sm text-cyber-text leading-7">
          {isUserMessage ? (
            <p className="whitespace-pre-wrap font-medium">{content}</p>
          ) : (
            <MarkdownMessage content={content} />
          )}
        </div>

        {/* 操作按钮（悬停时显示） */}
        {hovering && (
          <div className="absolute -top-10 right-0 flex gap-1 bg-cyber-black/90 border border-cyber-cyan/40 p-2 rounded">
            <Button
              onClick={onCopy}
              className="p-1.5 h-auto"
              variant="ghost"
              title="复制"
            >
              <Copy size={14} />
            </Button>
            {isUserMessage && (
              <Button
                onClick={() => onEdit?.(messageIndex)}
                className="p-1.5 h-auto"
                variant="ghost"
                title="编辑"
              >
                <Edit2 size={14} />
              </Button>
            )}
            <Button
              onClick={() => onReference?.(messageIndex)}
              className="p-1.5 h-auto"
              variant="ghost"
              title="引用"
            >
              <Reply size={14} />
            </Button>
            <Dropdown
              trigger={<MoreVertical size={14} />}
              options={menuOptions.filter((opt) => opt.divider || opt.value === 'delete')}
              onSelect={handleMenuSelect}
              align="right"
            />
          </div>
        )}

        {/* 编辑历史 */}
        {showEditHistory && editHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cyber-cyan/25">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-cyber-cyan hover:text-cyber-amber transition flex items-center gap-1"
            >
              <ChevronUp size={12} className={showHistory ? '' : 'rotate-180'} />
              编辑历史 ({editHistory.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {editHistory.map((edit, idx) => (
                  <div key={idx} className="text-xs bg-cyber-black/50 p-2 rounded border border-cyber-cyan/25">
                    <p className="text-cyber-muted mb-1">{new Date(edit.editedAt).toLocaleString()}</p>
                    <div className="space-y-1">
                      <p className="text-cyber-red line-through opacity-50">{edit.before}</p>
                      <p className="text-cyber-green">{edit.after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 消息引用预览
interface MessageReferenceProps {
  referenceIndex: number;
  referenceContent: string;
  onRemove: () => void;
}

export function MessageReference({ referenceIndex, referenceContent, onRemove }: MessageReferenceProps) {
  return (
    <div className="flex gap-2 p-3 bg-cyber-cyan/5 border-l-2 border-cyber-cyan/40 rounded">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-cyber-cyan font-bold uppercase">引用消息 #{referenceIndex}</p>
        <p className="text-sm text-cyber-text mt-1 line-clamp-2">{referenceContent}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-cyber-cyan hover:text-cyber-red transition"
      >
        ✕
      </button>
    </div>
  );
}
