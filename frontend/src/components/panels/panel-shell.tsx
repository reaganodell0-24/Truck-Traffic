"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface PanelShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PanelShell({ open, onClose, title, wide = false, children, actions }: PanelShellProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full bg-card border-l border-border shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "flex flex-col",
          wide ? "w-[900px]" : "w-[400px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h2 className="font-mono text-sm uppercase tracking-wider text-foreground">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-4" style={{ height: "calc(100vh - 52px)" }}>
          <div className="space-y-4 pb-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
