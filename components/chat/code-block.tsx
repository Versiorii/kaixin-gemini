"use client";

import React, { useState } from 'react';
import { Copy, Download, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hljs from 'highlight.js';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  editable?: boolean;
  onCodeChange?: (code: string) => void;
}

export function CodeBlock({
  code: initialCode,
  language = 'javascript',
  showLineNumbers = true,
  editable = false,
  onCodeChange,
}: CodeBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // 高亮代码
  const highlighted = React.useMemo(() => {
    try {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch {
      return code;
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleRun = () => {
    if (language === 'javascript' || language === 'typescript') {
      try {
        // eslint-disable-next-line no-eval
        eval(code);
        console.log('代码执行完成');
      } catch (err) {
        console.error('执行错误:', err);
      }
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`
    );
    element.setAttribute('download', `code.${language}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isEditing && editable) {
    return (
      <div className="space-y-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 border border-cyber-cyan/40 bg-cyber-black text-cyber-text font-mono text-xs min-h-40"
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-xs"
          >
            取消
          </Button>
          <Button
            onClick={() => {
              onCodeChange?.(code);
              setIsEditing(false);
            }}
            className="px-3 py-1 text-xs"
          >
            保存
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between bg-cyber-metal px-4 py-2 border border-cyber-cyan/25 border-b-0">
        <span className="text-xs font-bold text-cyber-muted uppercase">{language}</span>
        <div className="flex gap-1">
          <Button
            onClick={handleCopy}
            variant="ghost"
            className="px-2 py-1 h-auto text-xs"
            title={copied ? '已복사' : '복사'}
          >
            <Copy size={14} />
          </Button>

          {editable && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              className="px-2 py-1 h-auto text-xs"
              title="编辑"
            >
              <Settings size={14} />
            </Button>
          )}

          {(language === 'javascript' || language === 'typescript') && (
            <Button
              onClick={handleRun}
              variant="ghost"
              className="px-2 py-1 h-auto text-xs"
              title="运行"
            >
              <Play size={14} />
            </Button>
          )}

          <Button
            onClick={handleDownload}
            variant="ghost"
            className="px-2 py-1 h-auto text-xs"
            title="下载"
          >
            <Download size={14} />
          </Button>
        </div>
      </div>

      {/* 代码体 */}
      <div className="bg-cyber-black border border-cyber-cyan/25 border-t-0 overflow-x-auto">
        <pre className="p-4">
          <code
            className={`language-${language} text-xs font-mono text-cyber-text`}
            dangerouslySetInnerHTML={{
              __html: highlighted,
            }}
          />
        </pre>

        {/* 行号 */}
        {showLineNumbers && (
          <div className="absolute left-0 top-0 ml-2 text-right text-xs text-cyber-muted/50 font-mono pointer-events-none">
            {code.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
        )}
      </div>

      {/* 状态反馈 */}
      {copied && (
        <div className="text-xs text-cyber-green bg-cyber-green/10 px-4 py-2 border border-cyber-cyan/25 border-t-0">
          ✓ 已复制到剪贴板
        </div>
      )}
    </div>
  );
}

// 代码对比组件
interface CodeDiffProps {
  before: string;
  after: string;
  language?: string;
}

export function CodeDiff({ before, after, language = 'javascript' }: CodeDiffProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-xs font-bold text-cyber-red uppercase mb-2">修改前</p>
        <CodeBlock code={before} language={language} />
      </div>
      <div>
        <p className="text-xs font-bold text-cyber-green uppercase mb-2">修改后</p>
        <CodeBlock code={after} language={language} />
      </div>
    </div>
  );
}
