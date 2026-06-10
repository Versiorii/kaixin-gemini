import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

export const metadata: Metadata = {
  title: "Kaixin Gemini Neon Arcade",
  description: "运行在 Cloudflare 上的 Vaporwave AI 对话控制台。",
  keywords: ["AI Chat", "Gemini", "Vaporwave", "Cloudflare", "Workers", "D1"],
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#120022" },
    { media: "(prefers-color-scheme: dark)", color: "#080014" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
