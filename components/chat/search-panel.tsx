"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchApi, type SearchFilter, type SearchResult } from '@/lib/api/endpoints/search';
import { Dialog } from '@/components/common/dialog';

interface SearchPanelProps {
  onResultSelect: (result: SearchResult) => void;
}

export function SearchPanel({ onResultSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 过滤条件
  const [filters, setFilters] = useState<SearchFilter>({
    query: '',
    dateFrom: '',
    dateTo: '',
    model: '',
    isUserMessage: undefined,
  });

  // 执行搜索
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const response = await searchApi.search({
      query,
      ...filters,
    });

    if (response.ok && response.data) {
      setResults(response.data.results);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="h-full flex flex-col">
      {/* 搜索框 */}
      <div className="border-b border-cyber-cyan/25 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-cyber-cyan/60" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索对话和消息..."
            className="pl-10 h-10"
          />
        </div>

        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="w-full gap-2 text-xs"
        >
          <Filter size={14} /> 高级过滤
        </Button>

        {/* 高级过滤 */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-cyber-cyan/25">
            <div>
              <label className="text-xs font-bold text-cyber-muted">日期范围</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-cyber-muted">模型</label>
              <Input
                value={filters.model || ''}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                placeholder="例如：gemini-3.5-flash"
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-cyber-muted">消息类型</label>
              <select
                value={filters.isUserMessage === undefined ? '' : filters.isUserMessage ? 'user' : 'assistant'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isUserMessage:
                      e.target.value === 'user' ? true : e.target.value === 'assistant' ? false : undefined,
                  })
                }
                className="w-full mt-1 px-2 py-1 border border-cyber-cyan/40 bg-cyber-black text-cyber-text text-xs"
              >
                <option value="">全部</option>
                <option value="user">用户消息</option>
                <option value="assistant">AI 回应</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 结果列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-cyber-muted text-sm py-4">搜索中...</div>
        ) : results.length === 0 ? (
          <div className="text-center text-cyber-muted text-sm py-4">
            {query ? '无结果' : '输入关键词开始搜索'}
          </div>
        ) : (
          results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => onResultSelect(result)}
              className="w-full text-left border border-cyber-cyan/25 bg-cyber-black/50 hover:bg-cyber-cyan/10 p-3 rounded transition space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-bold ${
                    result.role === 'user'
                      ? 'bg-cyber-green/20 text-cyber-green'
                      : 'bg-cyber-cyan/20 text-cyber-cyan'
                  }`}
                >
                  {result.role === 'user' ? '📝' : '🤖'} {result.role}
                </span>
                <span className="text-xs text-cyber-muted">
                  {new Date(result.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-cyber-text line-clamp-2">{result.content}</p>
            </button>
          ))
        )}
      </div>

      {results.length > 0 && (
        <div className="border-t border-cyber-cyan/25 p-3">
          <Button
            variant="outline"
            className="w-full gap-2 text-xs"
          >
            <Download size={14} /> 导出搜索结果
          </Button>
        </div>
      )}
    </div>
  );
}

// 分析面板
interface AnalyticsPanelProps {
  statistics?: {
    totalMessages: number;
    totalTokens: number;
    averageResponseTime: number;
    mostUsedModel: string;
  };
}

export function AnalyticsPanel({ statistics }: AnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: '总消息数', value: statistics?.totalMessages || 0, unit: 'messages' },
          { label: '总 Token', value: statistics?.totalTokens || 0, unit: 'tokens' },
          { label: '平均响应时间', value: statistics?.averageResponseTime || 0, unit: 'ms' },
          { label: '常用模型', value: statistics?.mostUsedModel || 'N/A', unit: '' },
        ].map((stat, idx) => (
          <div key={idx} className="border border-cyber-cyan/25 bg-cyber-black/50 p-3 rounded">
            <p className="text-xs text-cyber-muted font-bold uppercase">{stat.label}</p>
            <p className="text-lg font-bold text-cyber-text mt-1">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              <span className="text-xs text-cyber-cyan ml-1">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Token 趋势图（简化版） */}
      <div className="border border-cyber-cyan/25 bg-cyber-black/50 p-4 rounded">
        <p className="text-sm font-bold text-cyber-text mb-3">Token 用量趋势</p>
        <div className="h-24 flex items-end gap-1">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 bg-cyber-green/20 border border-cyber-green/40 rounded-t"
              style={{
                height: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-cyber-muted mt-2">
          <span>7天前</span>
          <span>今天</span>
        </div>
      </div>

      {/* 导出报告 */}
      <Button variant="outline" className="w-full gap-2">
        <Download size={14} /> 导出分析报告
      </Button>
    </div>
  );
}
