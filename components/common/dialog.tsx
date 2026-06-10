"use client";

import React from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: DialogProps) {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* 对话框 */}
      <div className={`relative z-10 w-full ${sizeClasses[size]} bg-cyber-black border border-cyber-cyan/40 shadow-lg`}>
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-cyber-cyan/25 p-4">
          <div>
            {title && <h2 className="text-lg font-bold text-cyber-text">{title}</h2>}
            {description && <p className="mt-1 text-sm text-cyber-muted">{description}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-cyber-cyan hover:text-cyber-amber transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {children}
        </div>

        {/* 底部 */}
        {footer && (
          <div className="border-t border-cyber-cyan/25 p-4 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const colors = {
    info: { border: 'border-cyber-cyan', bg: 'bg-cyber-cyan/10', text: 'text-cyber-cyan', icon: 'ⓘ' },
    success: { border: 'border-cyber-green', bg: 'bg-cyber-green/10', text: 'text-cyber-green', icon: '✓' },
    warning: { border: 'border-cyber-amber', bg: 'bg-cyber-amber/10', text: 'text-cyber-amber', icon: '⚠' },
    error: { border: 'border-cyber-red', bg: 'bg-cyber-red/10', text: 'text-cyber-red', icon: '✕' },
  };

  const color = colors[type];

  return (
    <div className={`border ${color.border} ${color.bg} ${color.text} p-3 rounded flex items-start gap-3`}>
      <span className="mt-0.5 font-bold">{color.icon}</span>
      <div className="flex-1">
        {title && <p className="font-bold text-sm">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-0.5 hover:opacity-70 transition"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export interface ToastProps {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan',
    success: 'border-cyber-green bg-cyber-green/10 text-cyber-green',
    error: 'border-cyber-red bg-cyber-red/10 text-cyber-red',
  };

  return (
    <div className={`border ${colors[type]} p-3 rounded mb-2 flex items-center justify-between`}>
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
}
