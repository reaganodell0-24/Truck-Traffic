"use client";

import { useAppStore } from "@/stores/app-store";
import { useTransborderMonthly, useTransborderCommodities, useTransborderCrossings } from "@/hooks/use-transborder";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { TransborderTrendChart } from "@/components/charts/transborder-trend-chart";
import { BORDER_PORTS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TransborderPanel() {
  const { activePanel, closePanel, transborderPort, setTransborderPort } = useAppStore();
  const { data: monthly, isLoading: monthlyLoading, error: monthlyError } = useTransborderMonthly(transborderPort);
  const { data: commodities, isLoading: commoditiesLoading } = useTransborderCommodities(transborderPort);
  const { data: crossings } = useTransborderCrossings(transborderPort);

  const open = activePanel === "transborder";

  // Check for API errors
  const hasError = monthlyError ||
    (monthly && monthly.length > 0 && "error" in monthly[0]) ||
    (commodities && commodities.length > 0 && "error" in commodities[0]);

  const hasCommodityData = commodities && commodities.length > 0 && !("error" in commodities[0]);

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="TransBorder Freight"
      wide
      actions={hasCommodityData ? <ExportButton data={commodities} filename={`transborder-${transborderPort}`} /> : undefined}
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

      {hasError ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-sm font-medium text-amber-400">TransBorder Data Unavailable</div>
          <div className="mt-1 text-xs text-muted-foreground">
            The BTS TransBorder freight API is not responding. This can happen when:
          </div>
          <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-1">
            <li>The external BTS data.gov API is temporarily down</li>
            <li>The dataset ID has been updated by BTS</li>
            <li>Network connectivity issues</li>
          </ul>
          <div className="mt-2 text-xs text-muted-foreground">
            TransBorder data comes from the BTS Socrata API at data.bts.gov.
            Try again later, or check the API status at data.bts.gov/browse.
          </div>
        </div>
      ) : monthlyLoading || commoditiesLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[280px] w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {/* Monthly trend */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Monthly Freight Value
            </div>
            <TransborderTrendChart data={monthly ?? []} />
          </div>

          <Separator />

          {/* Crossings */}
          {crossings && crossings.length > 0 && !("error" in crossings[0]) && (
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
            {hasCommodityData ? (
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
        </>
      )}
    </PanelShell>
  );
}
