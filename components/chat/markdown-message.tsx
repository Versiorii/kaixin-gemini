"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useEffect, useState } from "react";

type KatexModule = {
  default: {
    renderToString: (content: string, options: { throwOnError: boolean; displayMode?: boolean }) => string;
  };
};

function MathText({ text }: { text: string }) {
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    let mounted = true;
    import("katex").then((katex: KatexModule) => {
      const rendered = text.replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, (_, block: string, inline: string) => {
        const content = block || inline;
        return katex.default.renderToString(content, { throwOnError: false, displayMode: Boolean(block) });
      });
      if (mounted) setHtml(rendered);
    }).catch(() => setHtml(text));
    return () => { mounted = false; };
  }, [text]);

  if (!html) return <>{text}</>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MarkdownMessage({ content }: { content: string }) {
  useEffect(() => {
    import("mermaid").then(({ default: mermaid }) => mermaid.initialize({ startOnLoad: false, theme: "dark" }));
  }, [content]);

  return (
    <div className="prose prose-invert max-w-none prose-pre:p-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p({ children }) {
            const text = children?.toString() || "";
            return <p><MathText text={text} /></p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
