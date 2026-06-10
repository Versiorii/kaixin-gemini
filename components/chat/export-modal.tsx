"use client";

import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/common/dialog';
import { Input } from '@/components/ui/input';
import { exportApi, type ExportFormat } from '@/lib/api/endpoints/export';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversationTitle: string;
  messageCount: number;
}

export function ExportModal({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
  messageCount,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [selectedRange, setSelectedRange] = useState<'all' | 'custom'>('all');
  const [startIndex, setStartIndex] = useState('0');
  const [endIndex, setEndIndex] = useState(String(messageCount - 1));
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);

  const formats: Array<{ id: ExportFormat; name: string; description: string }> = [
    { id: 'markdown', name: 'Markdown', description: '保留格式和代码块' },
    { id: 'pdf', name: 'PDF', description: '美化排版，可打印' },
    { id: 'html', name: 'HTML', description: '可嵌入网站' },
    { id: 'json', name: 'JSON', description: '原始数据备份' },
  ];

  const handleExport = async () => {
    setExporting(true);

    const messageIndices =
      selectedRange === 'all'
        ? undefined
        : Array.from(
            { length: parseInt(endIndex) - parseInt(startIndex) + 1 },
            (_, i) => parseInt(startIndex) + i
          );

    try {
      const blob = await exportApi.export({
        conversationId,
        format: selectedFormat,
        messageIndices,
      });

      // 下载
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversationTitle}.${selectedFormat === 'markdown' ? 'md' : selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onOpenChange(false);
    } catch (err) {
      console.error('导出失败:', err);
    }

    setExporting(false);
  };

  const handleGenerateShareLink = async () => {
    try {
      const response = await exportApi.createShareLink(conversationId, {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (response.ok && response.data) {
        const shareUrl = `${window.location.origin}/share/${response.data.token}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('分享链接已复制到剪贴板');
      }
    } catch (err) {
      console.error('生成分享链接失败:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="导出对话"
      description={`导出 "${conversationTitle}" - ${messageCount} 条消息`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            取消
          </Button>
          <Button onClick={handleGenerateShareLink} variant="outline" disabled={exporting}>
            <Share2 size={14} className="mr-1" /> 生成分享链接
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            <Download size={14} className="mr-1" /> {exporting ? '导出中...' : '导出'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 格式选择 */}
        <div>
          <p className="text-sm font-bold text-cyber-text mb-2">导出格式</p>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-3 text-left border rounded transition ${
                  selectedFormat === fmt.id
                    ? 'border-cyber-green bg-cyber-green/10'
                    : 'border-cyber-cyan/25 bg-cyber-black/50 hover:border-cyber-cyan/40'
                }`}
              >
                <p className="font-bold text-sm text-cyber-text">{fmt.name}</p>
                <p className="text-xs text-cyber-muted">{fmt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 消息范围 */}
        <div>
          <p className="text-sm font-bold text-cyber-text mb-2">消息范围</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={selectedRange === 'all'}
                onChange={() => setSelectedRange('all')}
                className="w-4 h-4"
              />
              <span className="text-sm text-cyber-text">全部消息</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={selectedRange === 'custom'}
                onChange={() => setSelectedRange('custom')}
                className="w-4 h-4"
              />
              <span className="text-sm text-cyber-text">自定义范围</span>
            </label>

            {selectedRange === 'custom' && (
              <div className="ml-6 flex gap-2 items-center">
                <span className="text-xs text-cyber-muted">从</span>
                <Input
                  type="number"
                  value={startIndex}
                  onChange={(e) => setStartIndex(e.target.value)}
                  min="0"
                  max={messageCount - 1}
                  className="w-20 h-8 text-xs"
                />
                <span className="text-xs text-cyber-muted">到</span>
                <Input
                  type="number"
                  value={endIndex}
                  onChange={(e) => setEndIndex(e.target.value)}
                  min="0"
                  max={messageCount - 1}
                  className="w-20 h-8 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* 选项 */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-cyber-text">包含元数据（时间戳、模型等）</span>
          </label>
        </div>

        {/* 预览 */}
        {selectedRange === 'custom' && (
          <div className="bg-cyber-black/50 border border-cyber-cyan/25 p-3 rounded text-xs text-cyber-muted">
            将导出 <strong>{parseInt(endIndex) - parseInt(startIndex) + 1}</strong> 条消息
          </div>
        )}
      </div>
    </Dialog>
  );
}

// 分享链接查看页面
interface ShareLinkViewProps {
  token: string;
  isPreview?: boolean;
}

export function ShareLinkView({ token, isPreview = false }: ShareLinkViewProps) {
  const [shareData, setShareData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadShare() {
      try {
        const response = await exportApi.getShareLink(token);
        if (response.ok && response.data) {
          setShareData(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadShare();
  }, [token]);

  if (loading) {
    return <div className="text-center text-cyber-muted py-8">加载中...</div>;
  }

  if (!shareData) {
    return <div className="text-center text-cyber-red py-8">分享链接无效或已过期</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border border-cyber-cyan/25 bg-cyber-black/50 p-4 rounded">
        <h1 className="text-2xl font-bold text-cyber-text mb-2">{shareData.title}</h1>
        <p className="text-sm text-cyber-muted">
          {shareData.messages?.length || 0} 条消息
        </p>
      </div>

      {/* 消息列表 */}
      <div className="space-y-3">
        {shareData.messages?.map((msg: any, idx: number) => (
          <div
            key={idx}
            className={`p-4 border rounded ${
              msg.role === 'user'
                ? 'border-cyber-green/45 bg-cyber-green/10'
                : 'border-cyber-cyan/25 bg-cyber-black/50'
            }`}
          >
            <p className="text-xs font-bold text-cyber-muted uppercase mb-2">
              {msg.role === 'user' ? '📝 用户' : '🤖 AI'}
            </p>
            <p className="text-sm text-cyber-text">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
