"use client";

import { useEffect } from "react";

interface PanelShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PanelShell({ open, onClose, title, wide = false, children, actions }: PanelShellProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 9999,
          width: wide ? 900 : 400,
          height: "100vh",
          backgroundColor: "var(--card, #1a2234)",
          borderLeft: "1px solid var(--border, #1e293b)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          color: "var(--foreground, #f1f5f9)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border, #1e293b)",
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            {title}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {actions}
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: "none",
                background: "transparent",
                color: "var(--muted-foreground, #94a3b8)",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 32 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
