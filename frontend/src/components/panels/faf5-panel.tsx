"use client";

import { useAppStore } from "@/stores/app-store";
import { useFAF5Flows, useFAF5Forecast } from "@/hooks/use-faf5";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { TonnageForecastChart } from "@/components/charts/tonnage-forecast-chart";
import { CommodityBarChart } from "@/components/charts/commodity-bar-chart";
import { FAF_ZONES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function FAF5Panel() {
  const { activePanel, closePanel, faf5Origin, faf5Dest, setFaf5Origin, setFaf5Dest } = useAppStore();
  const { data: flows } = useFAF5Flows(faf5Origin, faf5Dest);
  const { data: forecast } = useFAF5Forecast(faf5Origin, faf5Dest);

  const open = activePanel === "faf5";

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="FAF5 Freight Flows"
      wide
      actions={flows ? <ExportButton data={flows} filename={`faf5-${faf5Origin}-${faf5Dest}`} /> : undefined}
    >
      {/* Zone selectors */}
      <div className="flex items-center gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Origin</label>
          <select
            value={faf5Origin}
            onChange={(e) => setFaf5Origin(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {Object.entries(FAF_ZONES).map(([code, name]) => (
              <option key={code} value={code}>{code} — {name}</option>
            ))}
          </select>
        </div>
        <div className="pt-5 text-muted-foreground">→</div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Destination</label>
          <select
            value={faf5Dest}
            onChange={(e) => setFaf5Dest(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {Object.entries(FAF_ZONES).map(([code, name]) => (
              <option key={code} value={code}>{code} — {name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Commodity breakdown */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Top Commodities by Tonnage (Truck Mode)
        </div>
        <CommodityBarChart data={flows ?? []} />
      </div>

      <Separator />

      {/* Tonnage forecast */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Tonnage Forecast 2017–2050
        </div>
        <TonnageForecastChart data={forecast ?? []} />
      </div>
    </PanelShell>
  );
}
