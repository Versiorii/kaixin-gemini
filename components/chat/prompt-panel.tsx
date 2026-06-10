"use client";

import React, { useEffect, useState } from 'react';
import { Search, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { templatesApi, type PromptTemplate } from '@/lib/api/endpoints/templates';
import { Dialog } from '@/components/common/dialog';

interface PromptPanelProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose?: () => void;
}

export function PromptPanel({ onSelectTemplate, onClose }: PromptPanelProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // 获取模板
  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      const response = await templatesApi.list();
      if (response.ok && response.data) {
        setTemplates(response.data.templates);
      }
      setLoading(false);
    }
    loadTemplates();
  }, []);

  // 过滤模板
  useEffect(() => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  // 获取所有分类
  const categories = ['all', ...new Set(templates.map((t) => t.category))];

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="border-b border-cyber-cyan/25 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-cyber-text">Prompt 模板库</h2>
          <Button
            onClick={() => setShowNewTemplate(true)}
            className="gap-2 text-xs px-3 py-1"
          >
            <Plus size={14} /> 新建
          </Button>
        </div>

        {/* 搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-cyber-cyan/60" size={14} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="pl-10 h-9"
          />
        </div>

        {/* 分类 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-bold whitespace-nowrap rounded transition
                ${
                  selectedCategory === cat
                    ? 'border border-cyber-green bg-cyber-green/10 text-cyber-amber'
                    : 'border border-cyber-cyan/25 bg-cyber-black text-cyber-muted hover:text-cyber-cyan'
                }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-cyber-muted text-sm py-8">加载中...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center text-cyber-muted text-sm py-8">无模板</div>
        ) : (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelectTemplate(template);
                onClose?.();
              }}
              className="w-full text-left border border-cyber-cyan/25 bg-cyber-black/50 hover:bg-cyber-cyan/10 p-3 rounded transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold text-cyber-text text-sm">{template.name}</p>
                  {template.description && (
                    <p className="text-xs text-cyber-muted mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs px-2 py-1 bg-cyber-violet/20 text-cyber-violet rounded border border-cyber-violet/25">
                    {template.category}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 新建模板对话框 */}
      <NewTemplateDialog
        open={showNewTemplate}
        onOpenChange={setShowNewTemplate}
        onCreated={(template) => {
          setTemplates([template, ...templates]);
        }}
      />
    </div>
  );
}

interface NewTemplatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (template: PromptTemplate) => void;
}

function NewTemplateDialog({ open, onOpenChange, onCreated }: NewTemplatDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !content.trim()) return;

    setLoading(true);
    const response = await templatesApi.create({
      userId: 'current' as any,
      name: name.trim(),
      description: description.trim(),
      category,
      content: content.trim(),
    } as any);

    setLoading(false);

    if (response.ok && response.data) {
      onCreated(response.data);
      setName('');
      setDescription('');
      setCategory('general');
      setContent('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="新建 Prompt 模板"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="px-3 py-1 text-xs">
            取消
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim() || !content.trim()} className="px-3 py-1 text-xs">
            {loading ? '创建中...' : '创建'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-cyber-muted uppercase">模板名称</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：代码审查"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-cyber-muted uppercase">分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-cyber-cyan/40 bg-cyber-black text-cyber-text text-sm"
          >
            <option value="general">通用</option>
            <option value="code-review">代码审查</option>
            <option value="debug">调试</option>
            <option value="architecture">架构设计</option>
            <option value="writing">内容创作</option>
            <option value="brainstorm">头脑风暴</option>
            <option value="analysis">分析</option>
            <option value="translation">翻译</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-cyber-muted uppercase">描述</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述此模板的用途..."
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-cyber-muted uppercase">模板内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入 Prompt 模板内容...使用 {{VAR}} 表示变量"
            className="w-full mt-1 p-3 min-h-32 border border-cyber-cyan/40 bg-cyber-black text-cyber-text text-sm font-mono"
          />
        </div>
      </div>
    </Dialog>
  );
}
