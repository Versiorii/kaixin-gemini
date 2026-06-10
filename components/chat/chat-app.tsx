"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Cpu, Database, Lock, Moon, Plus, Radio, Search, Send, Shield, Square, Sun, Terminal, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MarkdownMessage } from "./markdown-message";

type Model = { id: string; name: string; description: string; enabled: number; is_default: number };
type Conversation = { id: string; title: string; model: string; updated_at: string };
type Message = { role: "user" | "assistant" | "system"; content: string };

export function ChatApp({ initialModels }: { initialModels: Model[] }) {
  const [model, setModel] = useState(initialModels.find((m) => m.is_default)?.id || initialModels[0]?.id || "gemini-3.5-flash");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const filtered = useMemo(() => conversations.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [conversations, query]);
  const activeModel = initialModels.find((item) => item.id === model);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    async function loadConversations() {
      const res = await fetch("/api/conversations");
      const data = res.ok ? await res.json() as { conversations?: Conversation[] } : { conversations: [] };
      setConversations(data.conversations || []);
    }
    loadConversations();
  }, []);

  async function openConversation(id: string) {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const data = await res.json() as { conversation: Conversation; messages: Array<{ role: Message["role"]; content: string }> };
    setConversationId(id);
    setMessages((data.messages || []).map((m) => ({ role: m.role, content: m.content })));
    setModel(data.conversation.model);
  }

  function newChat() {
    setConversationId(undefined);
    setMessages([]);
    setInput("");
  }

  async function send(regenerate = false) {
    const content = regenerate ? messages.filter((m) => m.role === "user").at(-1)?.content : input.trim();
    if (!content || loading) return;
    const nextMessages = regenerate ? messages.filter((m) => m.role !== "assistant") : [...messages, { role: "user" as const, content }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, model, stream: true, messages: nextMessages }),
      signal: controller.signal
    }).catch(() => null);
    if (!res || !res.body) {
      setLoading(false);
      return;
    }
    const id = res.headers.get("X-Conversation-Id");
    if (id) setConversationId(id);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistant = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const data = JSON.parse(payload);
          assistant += data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || "";
        } catch {}
      }
      setMessages([...nextMessages, { role: "assistant", content: assistant }]);
    }
    setLoading(false);
  }

  const telemetry = [
    { label: "SIGNAL", value: loading ? "LIVE" : "IDLE", icon: Activity, color: "text-cyber-green" },
    { label: "SYNTHS", value: String(initialModels.length), icon: Cpu, color: "text-cyber-cyan" },
    { label: "TAPES", value: String(conversations.length), icon: Database, color: "text-cyber-violet" },
    { label: "GATE", value: "LOCKED", icon: Shield, color: "text-cyber-amber" }
  ];

  return (
    <main className="cyber-shell relative z-10 flex min-h-screen text-foreground">
      <aside className="hidden w-80 shrink-0 border-r border-cyber-cyan/25 bg-cyber-black/95 p-4 shadow-[0_0_36px_rgba(255,79,216,.14)] md:flex md:flex-col">
        <div className="cyber-panel vapor-sun mb-4 overflow-hidden p-4">
          <div className="relative z-10 mb-4 flex items-center justify-between">
            <div className="grid h-12 w-12 place-items-center border border-cyber-green/70 bg-cyber-green/10 text-xl font-black text-cyber-amber shadow-green">KG</div>
            <span className="cyber-chip px-2 py-1 text-[10px]"><span className="cyber-led" /> vhs link</span>
          </div>
          <h1 className="cyber-title relative z-10 text-4xl animate-glitch">VAPOR<br />NODE</h1>
          <p className="relative z-10 mt-4 border-l border-cyber-cyan/50 bg-cyber-black/45 pl-3 text-xs uppercase leading-5 tracking-[.14em] text-cyber-muted">Kaixin Gemini retro signal lounge / neon coast channel 199X</p>
          <div className="vapor-pixels"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
        </div>

        <Button onClick={newChat} className="mb-4 w-full"><Plus size={18} /> New Tape</Button>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-cyber-cyan/80" size={18} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SEARCH VHS ARCHIVE" className="w-full pl-10" />
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[.12em] text-cyber-muted">
          <div className="cyber-panel p-2"><p className="text-cyber-green">{conversations.length}</p><p>tapes</p></div>
          <div className="cyber-panel p-2"><p className="text-cyber-cyan">{initialModels.length}</p><p>synths</p></div>
          <div className="cyber-panel p-2"><p className="text-cyber-violet">199X</p><p>era</p></div>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 && <div className="cyber-panel p-3 text-xs uppercase leading-5 tracking-[.12em] text-cyber-muted">No cassette signal in this archive lane.</div>}
          {filtered.map((item) => (
            <button key={item.id} onClick={() => openConversation(item.id)} className={`group w-full border px-3 py-3 text-left transition duration-200 ${conversationId === item.id ? "border-cyber-green/75 bg-cyber-green/10 shadow-green" : "border-cyber-cyan/25 bg-cyber-panel/40 hover:border-cyber-green/60 hover:bg-cyber-green/10"}`}>
              <span className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-cyber-muted"><Radio size={12} className="text-cyber-green" /> cassette packet</span>
              <span className="line-clamp-2 text-sm font-semibold text-cyber-text group-hover:text-cyber-amber">{item.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-cyber-cyan/25 bg-cyber-black/75 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:hidden">
              <div className="grid h-10 w-10 place-items-center border border-cyber-green/70 bg-cyber-green/10 font-black text-cyber-amber">KG</div>
              <span className="cyber-chip px-2 py-1 text-[10px]"><span className="cyber-led" /> online</span>
            </div>
            <label className="flex min-w-0 flex-1 flex-col gap-1 md:max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-cyber-muted">Model synth / dream channel</span>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="h-11 max-w-full border border-cyber-cyan/40 bg-cyber-black/90 px-3 text-sm font-bold uppercase tracking-[.06em] text-cyber-text outline-none shadow-glow transition focus:border-cyber-green/75">
                {initialModels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setDark(!dark)} className="min-h-10 px-3">{dark ? <Sun size={16} /> : <Moon size={16} />}</Button>
              <Link href="/admin" className="inline-flex min-h-10 items-center justify-center border border-cyber-violet/60 bg-cyber-violet/10 px-4 py-2 text-sm font-bold uppercase tracking-[.08em] text-cyber-text shadow-violet transition hover:border-cyber-cyan hover:text-cyber-cyan active:translate-y-px">Admin</Link>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            {telemetry.map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="cyber-panel flex items-center gap-3 px-3 py-2">
                <Icon size={16} className={item.color} />
                <div><p className="text-[10px] uppercase tracking-[.18em] text-cyber-muted">{item.label}</p><p className="text-sm font-black text-cyber-text">{item.value}</p></div>
              </div>;
            })}
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 md:px-6">
          <div className="flex-1 space-y-5 py-6 md:py-8">
            {messages.length === 0 && <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
              <section className="cyber-panel cyber-grid vapor-sun relative min-h-[31rem] overflow-hidden p-5 md:p-8">
                <div className="absolute inset-x-0 top-0 h-px animate-scan bg-cyber-green/75 shadow-green" />
                <div className="relative z-10 mb-6 flex flex-wrap items-center gap-2">
                  <span className="cyber-chip px-3 py-1 text-xs"><span className="cyber-led" /> neon shore online</span>
                  <span className="cyber-chip border-cyber-cyan/40 bg-cyber-cyan/10 px-3 py-1 text-xs text-cyber-cyan">{activeModel?.name || model}</span>
                </div>
                <h2 className="cyber-title terminal-cursor relative z-10 max-w-3xl text-5xl md:text-7xl">NEON<br />DREAM<br />ARCADE</h2>
                <p className="relative z-10 mt-6 max-w-2xl bg-cyber-black/45 p-3 text-sm leading-7 text-cyber-text md:text-base">把问题写入复古磁带轨道，模型会沿着粉紫天际线与青蓝网格返回响应。界面保留长文本阅读的清晰度，同时呈现 VHS 封面与老街机开场动画的氛围。</p>
                <div className="relative z-10 mt-8 grid gap-3 md:grid-cols-3">
                  {["PALM GRID", "STATUE BUFFER", "PIXEL SIGNAL"].map((label, index) => <div key={label} className="border border-cyber-cyan/25 bg-cyber-black/70 p-3">
                    <p className="text-[10px] uppercase tracking-[.18em] text-cyber-muted">{label}</p>
                    <div className="mt-3 h-2 bg-cyber-metal"><div className="h-full animate-pulsebar bg-cyber-green shadow-green" style={{ width: `${72 + index * 8}%` }} /></div>
                  </div>)}
                </div>
                <div className="vapor-statue" />
              </section>
              <aside className="space-y-4">
                <div className="cyber-panel p-4">
                  <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-cyber-cyan"><Zap size={14} /> arcade timeline</p>
                  <div className="space-y-4">
                    {["Sunset channel tuned", "CRT shimmer calibrated", "Awaiting first tape input"].map((item) => <div key={item} className="flex gap-3 text-sm text-cyber-muted"><span className="mt-1.5 h-2 w-2 rounded-full bg-cyber-green shadow-green" /><span>{item}</span></div>)}
                  </div>
                </div>
                <div className="cyber-panel p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-cyber-violet"><Lock size={14} /> signal guard</p>
                  <div className="grid grid-cols-2 gap-2 text-xs uppercase tracking-[.12em]">
                    <span className="border border-cyber-green/30 bg-cyber-green/10 p-2 text-cyber-green">vhs</span>
                    <span className="border border-cyber-cyan/30 bg-cyber-cyan/10 p-2 text-cyber-cyan">grid</span>
                    <span className="border border-cyber-amber/30 bg-cyber-amber/10 p-2 text-cyber-amber">sun</span>
                    <span className="border border-cyber-violet/30 bg-cyber-violet/10 p-2 text-cyber-violet">199X</span>
                  </div>
                </div>
              </aside>
            </div>}

            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "ml-auto max-w-[92%] border border-cyber-green/45 bg-cyber-green/10 p-4 shadow-green md:max-w-[74%]" : "cyber-panel max-w-none p-5"}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-cyber-muted">
                    {message.role === "user" ? <Terminal size={14} className="text-cyber-green" /> : <Cpu size={14} className="text-cyber-cyan" />}
                    {message.role === "user" ? "operator tape" : "synth response"}
                  </div>
                  <span className="text-[10px] uppercase tracking-[.16em] text-cyber-muted">#{String(index + 1).padStart(3, "0")}</span>
                </div>
                {message.role === "assistant" ? <MarkdownMessage content={message.content || "正在生成…"} /> : <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-cyber-text">{message.content}</p>}
                {loading && index === messages.length - 1 && message.role === "assistant" && <p className="terminal-cursor mt-3 text-xs uppercase tracking-[.18em] text-cyber-amber">streaming on tape</p>}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-gradient-to-t from-cyber-void via-cyber-void/95 to-transparent pb-5 pt-4">
            <div className="cyber-panel p-3 md:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="cyber-chip px-3 py-1 text-[10px]"><span className="cyber-led" /> cassette input deck</span>
                <span className="text-[10px] uppercase tracking-[.16em] text-cyber-muted">Enter sends / Shift+Enter newline</span>
              </div>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="TYPE A DREAM SIGNAL INTO THE VHS CORE..." className="min-h-24 w-full" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" className="gap-2"><Upload size={16} /> Upload</Button>
                <div className="flex flex-wrap gap-2">
                  {messages.some((m) => m.role === "assistant") && <Button variant="outline" onClick={() => send(true)} disabled={loading}>Rewind</Button>}
                  {loading ? <Button onClick={() => { abortRef.current?.abort(); setLoading(false); }} variant="outline" className="gap-2"><Square size={15} /> Stop</Button> : <Button onClick={() => send()} className="gap-2"><Send size={15} /> Send</Button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
