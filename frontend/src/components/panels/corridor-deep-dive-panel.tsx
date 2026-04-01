"use client";

import { useAppStore } from "@/stores/app-store";
import { useRoutes } from "@/hooks/use-routes";
import { useChargingStops } from "@/hooks/use-charging-stops";
import { PanelShell } from "./panel-shell";
import { CompanyBadge } from "@/components/shared/company-badge";
import { StatusDot } from "@/components/shared/status-dot";
import { CORRIDORS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { parseAADT } from "@/lib/utils";

export function CorridorDeepDivePanel() {
  const { activePanel, closePanel, corridorDiveTarget, setCorridorDiveTarget } = useAppStore();
  const { data: allRoutes } = useRoutes();
  const { data: chargers } = useChargingStops(corridorDiveTarget);

  const open = activePanel === "corridor-dive";

  // Filter routes for this corridor (broad match)
  const routes = allRoutes?.filter((r) =>
    r.corridor.toLowerCase().includes(corridorDiveTarget.toLowerCase())
  ) ?? [];

  const operators = [...new Set(routes.map((r) => r.company))];
  const totalAADT = routes.reduce((sum, r) => {
    const parsed = parseAADT(r.volume?.truck_aadt);
    return sum + (parsed?.mid ?? 0);
  }, 0);

  return (
    <PanelShell open={open} onClose={closePanel} title="Corridor Deep Dive" wide>
      {/* Corridor selector */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Corridor</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {CORRIDORS.map((c) => (
            <button
              key={c}
              onClick={() => setCorridorDiveTarget(c)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                corridorDiveTarget === c
                  ? "bg-primary/10 text-primary border border-primary/40"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-mono font-bold text-foreground">{routes.length}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Routes</div>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-foreground">{operators.length}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Operators</div>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-foreground">{totalAADT > 0 ? `${(totalAADT / 1000).toFixed(0)}K` : "—"}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Avg AADT</div>
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-foreground">{chargers?.length ?? 0}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Chargers</div>
        </div>
      </div>

      <Separator />

      {/* Routes on this corridor */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Routes on {corridorDiveTarget}
        </div>
        <div className="space-y-3">
          {routes.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{r.name}</div>
                <div className="flex items-center gap-2">
                  <CompanyBadge company={r.company} />
                  <StatusDot status={r.status} />
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {r.distance_miles ? `${r.distance_miles} mi` : ""} · {r.truck_count} · {r.launched}
              </div>
              {r.volume?.top_commodities?.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.volume.top_commodities.join(" · ")}
                </div>
              )}
            </div>
          ))}
          {routes.length === 0 && (
            <div className="text-sm text-muted-foreground">No routes on this corridor</div>
          )}
        </div>
      </div>

      {/* Chargers */}
      {chargers && chargers.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Charging Infrastructure
            </div>
            <div className="grid grid-cols-2 gap-2">
              {chargers.map((c) => (
                <div key={c.id} className="rounded border border-border p-2 text-xs">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted-foreground">{c.operator} · {c.power_kw ? `${c.power_kw} kW` : ""} · {c.status}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PanelShell>
  );
}
