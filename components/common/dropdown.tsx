"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, options, onSelect, align = 'left', className = '' }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        {trigger}
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className={`absolute top-full mt-2 w-48 bg-cyber-black border border-cyber-cyan/40 shadow-lg z-50
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {options.map((option, idx) => (
            <React.Fragment key={idx}>
              {option.divider && <div className="border-t border-cyber-cyan/25 my-1" />}
              <button
                onClick={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-cyber-cyan/10 transition text-cyber-text hover:text-cyber-amber"
              >
                {option.icon && <span>{option.icon}</span>}
                {option.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 border-b border-cyber-cyan/25">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition
            ${activeTab === tab.id
              ? 'border-cyber-green text-cyber-amber'
              : 'border-transparent text-cyber-muted hover:text-cyber-cyan'
            }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
