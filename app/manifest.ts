import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaixin Gemini Neon Arcade",
    short_name: "Kaixin Gemini",
    description: "Vaporwave 风格 AI 对话控制台，运行在 Cloudflare 上。",
    start_url: "/",
    display: "standalone",
    background_color: "#080014",
    theme_color: "#120022",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
