"use client";

import { useAppStore } from "@/stores/app-store";
import { useTransborderMonthly, useTransborderCommodities, useTransborderCrossings } from "@/hooks/use-transborder";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { TransborderTrendChart } from "@/components/charts/transborder-trend-chart";
import { BORDER_PORTS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TransborderPanel() {
  const { activePanel, closePanel, transborderPort, setTransborderPort } = useAppStore();
  const { data: monthly } = useTransborderMonthly(transborderPort);
  const { data: commodities } = useTransborderCommodities(transborderPort);
  const { data: crossings } = useTransborderCrossings(transborderPort);

  const open = activePanel === "transborder";

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="TransBorder Freight"
      wide
      actions={commodities ? <ExportButton data={commodities} filename={`transborder-${transborderPort}`} /> : undefined}
    >
      {/* Port selector */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Border Port</label>
        <select
          value={transborderPort}
          onChange={(e) => setTransborderPort(e.target.value)}
          className="mt-1 block w-48 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          {BORDER_PORTS.map((port) => (
            <option key={port} value={port}>{port}</option>
          ))}
        </select>
      </div>

      {/* Monthly trend */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Monthly Freight Value
        </div>
        <TransborderTrendChart data={monthly ?? []} />
      </div>

      <Separator />

      {/* Crossings */}
      {crossings && crossings.length > 0 && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Truck Crossings
          </div>
          <div className="text-sm text-foreground">
            {crossings.length} records found
          </div>
        </div>
      )}

      <Separator />

      {/* Top commodities table */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Top Commodities by Value
        </div>
        {commodities && commodities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Commodity</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commodities.slice(0, 15).map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{String(c.commodity2 || c.commodity || "—")}</TableCell>
                  <TableCell className="text-xs text-right font-mono">
                    {c.total_value ? `$${Number(c.total_value).toLocaleString()}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-sm text-muted-foreground">No commodity data available</div>
        )}
      </div>
    </PanelShell>
  );
}
