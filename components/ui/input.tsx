import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(
    "h-12 border border-cyber-cyan/30 bg-cyber-black/75 px-3 text-sm font-semibold text-cyber-text caret-cyber-green outline-none shadow-[inset_0_0_18px_rgba(255,79,216,.08),0_0_14px_rgba(55,247,255,.08)] transition duration-200 placeholder:text-cyber-muted/50",
    "focus:border-cyber-green/80 focus:bg-cyber-void/95 focus:shadow-[0_0_20px_rgba(255,79,216,.26),0_0_26px_rgba(55,247,255,.16),inset_0_0_20px_rgba(255,240,166,.05)]",
    className
  )} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(
    "min-h-24 border border-cyber-cyan/30 bg-cyber-black/80 p-3 text-sm font-semibold leading-7 text-cyber-text caret-cyber-green outline-none shadow-[inset_0_0_18px_rgba(255,79,216,.08),0_0_14px_rgba(55,247,255,.08)] transition duration-200 placeholder:text-cyber-muted/50",
    "focus:border-cyber-green/80 focus:bg-cyber-void/95 focus:shadow-[0_0_20px_rgba(255,79,216,.26),0_0_26px_rgba(55,247,255,.16),inset_0_0_20px_rgba(255,240,166,.05)]",
    className
  )} {...props} />;
}
