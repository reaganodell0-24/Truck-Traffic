"use client";

import { COMPANY_COLORS, COMPANY_NAMES } from "@/lib/constants";
import type { Company } from "@/lib/types";

const companies: Company[] = ["aurora", "kodiak", "gatik", "waabi", "bot-auto"];

export function MapLegend() {
  return (
    <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-xs space-y-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Legend
      </div>
      <div className="space-y-1">
        {companies.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: COMPANY_COLORS[c] }} />
            <span className="text-foreground">{COMPANY_NAMES[c]}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-1.5 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-muted-foreground" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: "2px dashed var(--muted-foreground)" }} />
          <span>Pilot / Planned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4aa] terminal-pulse" />
          <span>Terminal</span>
        </div>
      </div>
    </div>
  );
}
