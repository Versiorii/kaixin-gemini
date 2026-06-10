"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Activity, Cpu, Database, KeyRound, Settings, Shield, SlidersHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Tab = "dashboard" | "users" | "models" | "api" | "settings";
type AdminUser = { id: string; username: string; email: string; role: "admin" | "user"; status: "active" | "disabled" };
type AdminModel = { id: string; name: string; description: string; enabled: number; sort_order: number; is_default: number };
type AdminData = {
  users?: number | AdminUser[];
  conversations?: number;
  tokens?: number;
  requests?: number;
  models?: AdminModel[];
  config?: { apiBaseUrl?: string; apiKey?: string; defaultModel?: string };
  settings?: Record<string, string>;
};

const tabs: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
  { id: "dashboard", label: "Arcade HUD", icon: Activity },
  { id: "users", label: "Players", icon: Users },
  { id: "models", label: "Synths", icon: Cpu },
  { id: "api", label: "Signal Key", icon: KeyRound },
  { id: "settings", label: "VHS Setup", icon: Settings }
];

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: number | string | undefined; icon: typeof Activity; tone: string }) {
  return <div className="cyber-panel p-4">
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[10px] uppercase tracking-[.2em] text-cyber-muted">{label}</p>
      <Icon size={18} className={tone} />
    </div>
    <p className="text-3xl font-black text-cyber-text">{value ?? 0}</p>
    <div className="mt-4 h-1.5 bg-cyber-metal"><div className="h-full animate-pulsebar bg-cyber-green shadow-green" style={{ width: "72%" }} /></div>
  </div>;
}

function StatusChip({ active, label }: { active: boolean; label: string }) {
  return <span className={`inline-flex items-center gap-2 border px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] ${active ? "border-cyber-green/40 bg-cyber-green/10 text-cyber-green" : "border-cyber-red/40 bg-cyber-red/10 text-cyber-red"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-cyber-green shadow-green" : "bg-cyber-red shadow-danger"}`} />{label}</span>;
}

export function AdminApp() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminData>({});
  const [message, setMessage] = useState("");

  const load = useCallback(async (next = tab) => {
    const map: Record<Tab, string> = { dashboard: "/api/admin/dashboard", users: "/api/admin/users", models: "/api/admin/models", api: "/api/admin/api-config", settings: "/api/admin/settings" };
    const res = await fetch(map[next]);
    if (res.status === 401) location.href = "/login";
    if (res.ok) setData(await res.json() as AdminData);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function saveApi(form: FormData) {
    await fetch("/api/admin/api-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    setMessage("API 配置已保存");
    load("api");
  }

  async function saveSettings(form: FormData) {
    await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    setMessage("系统设置已保存");
    load("settings");
  }

  async function updateUser(id: string, patch: Partial<Pick<AdminUser, "role" | "status">>) {
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    load("users");
  }

  async function updateModel(id: string, patch: Partial<Pick<AdminModel, "enabled" | "sort_order" | "is_default">>) {
    await fetch(`/api/admin/models/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    load("models");
  }

  async function createModel(form: FormData) {
    await fetch("/api/admin/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    (document.getElementById("model-form") as HTMLFormElement)?.reset();
    load("models");
  }

  const users = Array.isArray(data.users) ? data.users : [];
  const userCount = typeof data.users === "number" ? data.users : users.length;

  return (
    <main className="cyber-shell min-h-screen text-foreground">
      <header className="border-b border-cyber-cyan/20 bg-cyber-black/75 px-5 py-5 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2"><span className="cyber-led" /><span className="text-[10px] uppercase tracking-[.22em] text-cyber-green">vapor control online</span></div>
            <h1 className="cyber-title text-4xl md:text-5xl animate-glitch">VAPORWAVE CONTROL ROOM</h1>
            <p className="mt-2 text-sm text-cyber-muted">模型、玩家、API 与站点信号的霓虹管理面板。</p>
          </div>
          <Link href="/" className="border border-cyber-cyan/50 bg-cyber-cyan/10 px-4 py-2 text-sm font-bold uppercase tracking-[.1em] text-cyber-cyan shadow-cyan transition hover:bg-cyber-green/20 hover:text-cyber-amber">Return Lounge</Link>
        </div>
      </header>

      <div className="grid gap-5 p-5 md:p-8 lg:grid-cols-[260px_1fr]">
        <nav className="cyber-panel h-fit p-3">
          <p className="mb-3 px-2 text-[10px] uppercase tracking-[.2em] text-cyber-muted">arcade modules</p>
          <div className="space-y-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 border px-3 py-3 text-left text-sm font-bold uppercase tracking-[.08em] transition ${tab === item.id ? "border-cyber-green/75 bg-cyber-green/10 text-cyber-green shadow-green" : "border-cyber-cyan/20 bg-cyber-black/40 text-cyber-muted hover:border-cyber-cyan/50 hover:text-cyber-cyan"}`}><Icon size={17} />{item.label}</button>;
            })}
          </div>
          <div className="mt-5 border border-cyber-violet/25 bg-cyber-violet/10 p-3 text-xs leading-5 text-cyber-muted">
            <p className="mb-2 flex items-center gap-2 uppercase tracking-[.16em] text-cyber-violet"><Shield size={14} /> signal guard</p>
            Routes stay locked. Unknown players return to the arcade gate.
          </div>
        </nav>

        <section className="cyber-panel min-w-0 p-4 md:p-6">
          {message && <p className="mb-5 border border-cyber-green/25 bg-cyber-green/10 px-3 py-2 text-sm text-cyber-green shadow-green">{message}</p>}

          {tab === "dashboard" && <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard label="players" value={userCount} icon={Users} tone="text-cyber-green" />
              <MetricCard label="tapes" value={data.conversations} icon={Database} tone="text-cyber-cyan" />
              <MetricCard label="tokens" value={data.tokens} icon={Cpu} tone="text-cyber-violet" />
              <MetricCard label="signals" value={data.requests} icon={Activity} tone="text-cyber-amber" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="border border-cyber-cyan/20 bg-cyber-black/50 p-4">
                <p className="mb-4 text-xs uppercase tracking-[.2em] text-cyber-cyan">neon spectrum</p>
                {[["CRT LOAD", 68], ["D1 CASSETTE", 54], ["SYNTH BUS", 82], ["GATE LOCK", 91]].map(([label, width]) => <div key={String(label)} className="mb-4 last:mb-0">
                  <div className="mb-2 flex justify-between text-xs uppercase tracking-[.14em] text-cyber-muted"><span>{label}</span><span>{width}%</span></div>
                  <div className="h-2 bg-cyber-metal"><div className="h-full bg-cyber-cyan shadow-cyan" style={{ width: `${width}%` }} /></div>
                </div>)}
              </div>
              <div className="border border-cyber-green/20 bg-cyber-green/5 p-4">
                <p className="mb-4 text-xs uppercase tracking-[.2em] text-cyber-green">vhs timeline</p>
                {["Admin signal synced", "Synth registry scanned", "Player access clean", "VHS settings stable"].map((item) => <div key={item} className="mb-4 flex gap-3 text-sm text-cyber-muted last:mb-0"><span className="mt-1.5 h-2 w-2 rounded-full bg-cyber-green shadow-green" /><span>{item}</span></div>)}
              </div>
            </div>
          </div>}

          {tab === "users" && <div className="space-y-3">
            {users.map((u) => <div key={u.id} className="grid gap-3 border border-cyber-cyan/20 bg-cyber-black/50 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div><div className="mb-2 flex flex-wrap items-center gap-2"><p className="font-bold text-cyber-text">{u.username}</p><StatusChip active={u.status === "active"} label={u.status} /><span className="cyber-chip px-2 py-1 text-[10px]">{u.role}</span></div><p className="text-sm text-cyber-muted">{u.email}</p></div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => updateUser(u.id, { role: u.role === "admin" ? "user" : "admin" })}>切换权限</Button><Button variant="outline" onClick={() => updateUser(u.id, { status: u.status === "active" ? "disabled" : "active" })}>{u.status === "active" ? "禁用" : "启用"}</Button></div>
            </div>)}
          </div>}

          {tab === "models" && <div className="space-y-4">
            <form id="model-form" action={createModel} className="grid gap-3 md:grid-cols-4"><Input name="id" placeholder="MODEL ID" /><Input name="name" placeholder="MODEL NAME" required /><Input name="description" placeholder="DESCRIPTION" /><Button>添加模型</Button></form>
            {(data.models || []).map((m) => <div key={m.id} className="grid gap-3 border border-cyber-cyan/20 bg-cyber-black/50 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div><div className="mb-2 flex flex-wrap items-center gap-2"><p className="font-bold text-cyber-text">{m.name}</p><StatusChip active={Boolean(m.enabled)} label={m.enabled ? "enabled" : "disabled"} />{Boolean(m.is_default) && <span className="cyber-chip px-2 py-1 text-[10px]">default</span>}</div><p className="text-sm text-cyber-muted">{m.description}</p></div>
              <Input type="number" defaultValue={m.sort_order} onBlur={(e) => updateModel(m.id, { sort_order: Number(e.target.value) })} className="w-24" />
              <Button variant="outline" onClick={() => updateModel(m.id, { enabled: m.enabled ? 0 : 1 })}>{m.enabled ? "禁用" : "启用"}</Button>
              <Button variant="outline" onClick={() => updateModel(m.id, { is_default: 1 })}>{m.is_default ? "默认" : "设默认"}</Button>
            </div>)}
          </div>}

          {tab === "api" && <form action={saveApi} className="max-w-2xl space-y-4"><div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-cyber-cyan"><KeyRound size={15} /> signal key channel</div><Input name="apiBaseUrl" placeholder="API BASE URL" defaultValue={data.config?.apiBaseUrl || ""} /><Input name="apiKey" placeholder="API KEY" defaultValue={data.config?.apiKey || ""} /><Input name="defaultModel" placeholder="DEFAULT SYNTH" defaultValue={data.config?.defaultModel || ""} /><Button>保存 API 配置</Button></form>}

          {tab === "settings" && <form action={saveSettings} className="max-w-2xl space-y-4"><div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[.18em] text-cyber-violet"><SlidersHorizontal size={15} /> vhs preferences</div><Input name="site_name" placeholder="网站名称" defaultValue={data.settings?.site_name || ""} /><Input name="logo_url" placeholder="Logo URL" defaultValue={data.settings?.logo_url || ""} /><Textarea name="announcement" placeholder="公告" defaultValue={data.settings?.announcement || ""} /><Input name="seo_title" placeholder="SEO 标题" defaultValue={data.settings?.seo_title || ""} /><Textarea name="seo_description" placeholder="SEO 描述" defaultValue={data.settings?.seo_description || ""} /><Input name="seo_keywords" placeholder="SEO 关键词" defaultValue={data.settings?.seo_keywords || ""} /><Button>保存系统设置</Button></form>}
        </section>
      </div>
    </main>
  );
}
