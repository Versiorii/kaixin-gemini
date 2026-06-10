"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setError("");
    const body = Object.fromEntries(formData.entries());
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) location.href = "/";
    else { const data = await res.json() as { error?: string }; setError(data.error || "操作失败"); }
  }

  const Icon = mode === "login" ? Lock : UserPlus;

  return (
    <form action={submit} className="cyber-panel vapor-sun relative w-full max-w-md overflow-hidden p-6 md:p-8">
      <div className="absolute inset-x-0 top-0 h-px animate-scan bg-cyber-green/75 shadow-green" />
      <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center border border-cyber-green/70 bg-cyber-green/10 text-cyber-amber shadow-green"><Icon size={22} /></div>
        <span className="cyber-chip px-3 py-1 text-[10px]"><span className="cyber-led" /> arcade gate</span>
      </div>
      <div className="relative z-10 mb-6">
        <h1 className="cyber-title text-4xl animate-glitch">{mode === "login" ? "ACCESS ARCADE" : "JOIN SIGNAL"}</h1>
        <p className="mt-3 border-l border-cyber-cyan/45 bg-cyber-black/45 pl-3 text-sm leading-6 text-cyber-muted">{mode === "login" ? "验证身份后进入 Kaixin Gemini 霓虹控制台。" : "注册新的操作员身份，加入 199X 复古信号频道。"}</p>
      </div>
      <div className="relative z-10 space-y-4">
        {mode === "register" && <Input name="username" placeholder="PLAYER NAME" required minLength={2} />}
        <Input name="email" type="email" placeholder="EMAIL SIGNAL" required />
        <Input name="password" type="password" placeholder="SECRET TAPE KEY" required minLength={8} />
      </div>
      {error && <p className="relative z-10 mt-4 border border-cyber-red/60 bg-cyber-red/10 px-3 py-2 text-sm text-cyber-red shadow-danger">{error}</p>}
      <Button className="relative z-10 mt-5 w-full">{mode === "login" ? "Enter The Lounge" : "Create Player"}</Button>
      <Link href={mode === "login" ? "/register" : "/login"} className="relative z-10 mt-5 flex items-center justify-center gap-2 text-center text-sm uppercase tracking-[.1em] text-cyber-muted transition hover:text-cyber-amber hover:[text-shadow:2px_0_rgba(55,247,255,.5),-2px_0_rgba(255,79,216,.5)]"><ShieldCheck size={15} />{mode === "login" ? "No signal / register" : "Signal exists / login"}</Link>
    </form>
  );
}
