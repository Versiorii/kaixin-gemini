import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  return <button className={cn(
    "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-sm font-black uppercase tracking-[.11em] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-45",
    "active:translate-y-px active:scale-[.975] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-black",
    "hover:brightness-125 hover:[text-shadow:2px_0_rgba(55,247,255,.55),-2px_0_rgba(255,79,216,.55)]",
    variant === "primary" && "border-cyber-green/75 bg-cyber-green/10 text-cyber-amber shadow-green hover:border-cyber-cyan/80 hover:bg-cyber-green/20 hover:text-cyber-text hover:shadow-[0_0_30px_rgba(255,79,216,.48),0_0_18px_rgba(55,247,255,.22)]",
    variant === "ghost" && "border-cyber-cyan/40 bg-cyber-panel/50 text-cyber-cyan shadow-glow hover:border-cyber-green/75 hover:bg-cyber-cyan/10 hover:text-cyber-amber",
    variant === "outline" && "border-cyber-violet/60 bg-cyber-black/30 text-cyber-text shadow-violet hover:border-cyber-cyan hover:bg-cyber-violet/20 hover:text-cyber-cyan",
    className
  )} {...props} />;
}
