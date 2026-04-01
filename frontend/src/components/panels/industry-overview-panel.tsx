"use client";

import { useAppStore } from "@/stores/app-store";
import { useRoutes } from "@/hooks/use-routes";
import { useAVPenetration } from "@/hooks/use-analytics";
import { PanelShell } from "./panel-shell";
import { Separator } from "@/components/ui/separator";

export function IndustryOverviewPanel() {
  const { activePanel, closePanel } = useAppStore();
  const { data: routes } = useRoutes();
  const { data: avData } = useAVPenetration();

  const open = activePanel === "industry";

  const activeRoutes = routes?.filter((r) => r.status === "active").length ?? 0;
  const operators = routes ? new Set(routes.map((r) => r.company)).size : 0;
  const avgPenetration = avData && avData.length > 0
    ? (avData.reduce((s, d) => s + d.av_penetration_pct, 0) / avData.length).toFixed(4)
    : "—";

  return (
    <PanelShell open={open} onClose={closePanel} title="Industry Overview" wide>
      {/* TX Trucking Market */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Texas Trucking Market
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard value="$180B+" label="TX Freight Economy" />
          <StatCard value="500K+" label="Registered Trucks in TX" />
          <StatCard value="83%" label="MX-TX Trade by Truck" />
        </div>
      </div>

      <Separator />

      {/* Top Conventional Carriers */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Top Conventional Carriers (TX Corridors)
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Werner Enterprises", fleet: "8,000+ trucks", note: "Aurora partner" },
            { name: "Schneider National", fleet: "9,500+ trucks", note: "Aurora partner" },
            { name: "J.B. Hunt", fleet: "12,000+ trucks", note: "Kodiak & Bot Auto partner" },
            { name: "FedEx Freight", fleet: "30,000+ trucks", note: "Aurora partner" },
            { name: "Hirschbach Motor Lines", fleet: "3,000+ trucks", note: "Aurora first customer" },
            { name: "Ryan Transportation", fleet: "Regional carrier", note: "Bot Auto partner" },
          ].map((c) => (
            <div key={c.name} className="rounded border border-border p-2.5">
              <div className="text-sm font-medium text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.fleet}</div>
              <div className="text-[10px] text-aurora mt-0.5">{c.note}</div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* AV Market Share */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Autonomous Vehicle Market Position
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={String(operators)} label="AV Operators in TX" />
          <StatCard value={String(activeRoutes)} label="Active AV Routes" />
          <StatCard value={`${avgPenetration}%`} label="Avg AV Penetration" />
        </div>
        <div className="mt-3 p-3 rounded-lg bg-secondary text-sm text-muted-foreground">
          Current AV penetration is &lt;0.1% on most corridors. The growth projection from 0.1% → 5% → 15%
          over the next decade is where the investment thesis for terminal real estate, charging infrastructure,
          and corridor development lives.
        </div>
      </div>

      <Separator />

      {/* Growth Projections */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Growth Projections
        </div>
        <div className="space-y-2">
          {[
            { year: "2025", milestone: "~50 autonomous trucks on TX roads", av: "<0.1%" },
            { year: "2026", milestone: "200+ trucks (Aurora alone), Kodiak highway launch", av: "~0.1%" },
            { year: "2028", milestone: "1,000+ AV trucks projected across operators", av: "~0.5%" },
            { year: "2030", milestone: "Major carrier fleet conversions begin", av: "~2-5%" },
            { year: "2035", milestone: "Hub-to-hub network mature, EV Semi at scale", av: "~10-15%" },
          ].map((p) => (
            <div key={p.year} className="flex items-center gap-3 rounded border border-border p-2.5">
              <div className="text-sm font-mono font-bold text-foreground w-12">{p.year}</div>
              <div className="flex-1 text-xs text-muted-foreground">{p.milestone}</div>
              <div className="text-xs font-mono text-aurora">{p.av}</div>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3 text-center">
      <div className="text-xl font-mono font-bold text-foreground">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
