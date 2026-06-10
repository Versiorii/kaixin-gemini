import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Trebuchet MS", "Gill Sans", "PingFang SC", "Microsoft YaHei", "system-ui", "sans-serif"],
        mono: ["Courier New", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        cyber: {
          void: "#080014",
          black: "#120022",
          panel: "#1d0837",
          metal: "#35115e",
          green: "#ff4fd8",
          cyan: "#37f7ff",
          violet: "#9d5cff",
          amber: "#fff0a6",
          red: "#ff3d7f",
          text: "#fff7cf",
          muted: "#c6a9ff"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(55, 247, 255, .28), inset 0 0 22px rgba(255, 79, 216, .1)",
        green: "0 0 20px rgba(255, 79, 216, .34)",
        cyan: "0 0 22px rgba(55, 247, 255, .34)",
        violet: "0 0 24px rgba(157, 92, 255, .34)",
        danger: "0 0 20px rgba(255, 61, 127, .38)"
      },
      animation: {
        scan: "cyber-scan 9s linear infinite",
        rain: "cyber-rain 20s linear infinite",
        blink: "terminal-blink 1.15s steps(2, start) infinite",
        breathe: "cyber-breathe 2.2s ease-in-out infinite",
        pulsebar: "cyber-pulsebar 1.8s ease-in-out infinite",
        glitch: "glitch-shift 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
