"use client";

import { useAppStore } from "@/stores/app-store";
import { useEVFeasibility } from "@/hooks/use-analytics";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { EVComparisonChart } from "@/components/charts/ev-comparison-chart";
import { TRUCK_TYPES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function EVFeasibilityPanel() {
  const { activePanel, closePanel, truckType, setTruckType } = useAppStore();
  const { data } = useEVFeasibility(truckType || "semi-lr");

  const open = activePanel === "ev-feasibility";
  const selectedType = truckType || "semi-lr";

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="EV Feasibility Calculator"
      wide
      actions={data ? <ExportButton data={data} filename={`ev-feasibility-${selectedType}`} /> : undefined}
    >
      {/* Truck type selector */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Truck Type</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {TRUCK_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTruckType(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                selectedType === t.id
                  ? "bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {t.name} ({t.range} mi)
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Charging Stops Needed per Route
        </div>
        <EVComparisonChart data={data ?? []} />
      </div>

      {/* Table */}
      {data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Route</TableHead>
              <TableHead className="text-xs text-right">Distance</TableHead>
              <TableHead className="text-xs text-right">Direct?</TableHead>
              <TableHead className="text-xs text-right">Stops</TableHead>
              <TableHead className="text-xs text-right">Added Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.route_id}>
                <TableCell className="text-xs">{row.route_name}</TableCell>
                <TableCell className="text-xs text-right font-mono">{row.distance_miles} mi</TableCell>
                <TableCell className="text-xs text-right">{row.can_complete_direct ? "✅" : "—"}</TableCell>
                <TableCell className="text-xs text-right font-mono">{row.charging_stops_needed}</TableCell>
                <TableCell className="text-xs text-right font-mono">
                  {row.added_charge_time_min > 0 ? `${row.added_charge_time_min} min` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PanelShell>
  );
}
