"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { useFAF5Flows, useFAF5Forecast } from "@/hooks/use-faf5";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { TonnageForecastChart } from "@/components/charts/tonnage-forecast-chart";
import { CommodityBarChart } from "@/components/charts/commodity-bar-chart";
import { FAF_ZONES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SCENARIO_PRESETS = [
  { label: "FHWA Baseline", value: 0 },
  { label: "AV Adoption (+3%)", value: 3 },
  { label: "High Growth (+5%)", value: 5 },
  { label: "Recession (-2%)", value: -2 },
] as const;

export function FAF5Panel() {
  const { activePanel, closePanel, faf5Origin, faf5Dest, setFaf5Origin, setFaf5Dest } = useAppStore();
  const { data: flows, isLoading: flowsLoading, error: flowsError } = useFAF5Flows(faf5Origin, faf5Dest);
  const { data: forecast, isLoading: forecastLoading } = useFAF5Forecast(faf5Origin, faf5Dest);
  const [growthPct, setGrowthPct] = useState(0);

  const open = activePanel === "faf5";

  const hasError = flowsError || (flows && flows.length > 0 && "error" in flows[0]);
  const hasData = flows && flows.length > 0 && !("error" in flows[0]);

  // Calculate adjusted 2050 tonnage for display
  const baseline2050 = forecast?.find((d) => d.year === 2050)?.total_tons;
  const adjusted2050 = baseline2050 && growthPct !== 0
    ? baseline2050 * Math.pow(1 + growthPct / 100, 2050 - 2024)
    : null;

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="FAF5 Freight Flows"
      wide
      actions={hasData ? <ExportButton data={flows} filename={`faf5-${faf5Origin}-${faf5Dest}`} /> : undefined}
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
        <div className="pt-5 text-muted-foreground">-&gt;</div>
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

      {hasError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-sm font-medium text-amber-400">FAF5 Database Not Set Up</div>
          <div className="mt-1 text-xs text-muted-foreground">
            The FAF5 freight flow database needs to be downloaded and built. Run this command in your terminal:
          </div>
          <code className="mt-2 block rounded bg-secondary p-2 text-xs font-mono">
            python scripts/setup_faf5.py
          </code>
          <div className="mt-2 text-xs text-muted-foreground">
            This downloads ~100MB of FHWA freight data and creates a local SQLite database.
            Once complete, restart the API server and this panel will show commodity flows and tonnage forecasts.
          </div>
        </div>
      ) : flowsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      ) : (
        <>
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
              Tonnage Forecast 2017-2050
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Solid cyan = actuals (FHWA). Dashed amber = FHWA baseline forecast.
              {growthPct !== 0 && " Dashed purple = your adjusted scenario."}
            </div>
            {forecastLoading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <TonnageForecastChart data={forecast ?? []} growthPct={growthPct} />
            )}
          </div>

          <Separator />

          {/* Growth assumptions */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Growth Assumptions
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Apply an annual growth adjustment on top of the FHWA baseline forecast.
              Positive values model tailwinds (AV adoption, nearshoring). Negative values model headwinds (recession, trade disruption).
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setGrowthPct(preset.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border ${
                    growthPct === preset.value
                      ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#8b5cf6]"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Annual Growth Adjustment (%)
                </label>
                <input
                  type="number"
                  value={growthPct}
                  onChange={(e) => setGrowthPct(parseFloat(e.target.value) || 0)}
                  step="0.5"
                  className="mt-1 block w-32 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono"
                  placeholder="0"
                />
              </div>

              {/* Show projected impact */}
              {baseline2050 && (
                <div className="flex-1 grid grid-cols-2 gap-3 ml-4">
                  <div className="rounded-lg bg-secondary p-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      FHWA 2050 Baseline
                    </div>
                    <div className="text-lg font-mono font-bold" style={{ color: "#f59e0b" }}>
                      {baseline2050.toLocaleString(undefined, { maximumFractionDigits: 0 })}K tons
                    </div>
                  </div>
                  {adjusted2050 && (
                    <div className="rounded-lg bg-secondary p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Your Scenario 2050
                      </div>
                      <div className="text-lg font-mono font-bold" style={{ color: "#8b5cf6" }}>
                        {adjusted2050.toLocaleString(undefined, { maximumFractionDigits: 0 })}K tons
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {adjusted2050 > baseline2050 ? "+" : ""}
                        {((adjusted2050 / baseline2050 - 1) * 100).toFixed(1)}% vs baseline
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PanelShell>
  );
}
