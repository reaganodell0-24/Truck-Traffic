"use client";

import { useAppStore } from "@/stores/app-store";
import { useAVPenetration } from "@/hooks/use-analytics";
import { PanelShell } from "./panel-shell";
import { ExportButton } from "@/components/shared/export-button";
import { AVPenetrationChart } from "@/components/charts/av-penetration-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyBadge } from "@/components/shared/company-badge";
import type { Company } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function AVPenetrationPanel() {
  const { activePanel, closePanel } = useAppStore();
  const { data, isLoading } = useAVPenetration();

  const open = activePanel === "av-penetration";

  return (
    <PanelShell
      open={open}
      onClose={closePanel}
      title="AV Penetration Analytics"
      wide
      actions={data ? <ExportButton data={data} filename="av-penetration" /> : undefined}
    >
      <div className="text-sm text-muted-foreground">
        Autonomous vehicle loads as a percentage of total corridor truck traffic.
        AV penetration is currently &lt;0.1% on most corridors.
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
      <AVPenetrationChart data={data ?? []} />
      )}

      {!isLoading && data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Route</TableHead>
              <TableHead className="text-xs">Operator</TableHead>
              <TableHead className="text-xs text-right">AV Loads/Week</TableHead>
              <TableHead className="text-xs text-right">Total/Week</TableHead>
              <TableHead className="text-xs text-right">AV %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.route_id}>
                <TableCell className="text-xs">{row.route_name}</TableCell>
                <TableCell><CompanyBadge company={row.company as Company} /></TableCell>
                <TableCell className="text-xs text-right font-mono">{row.av_loads_per_week.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-right font-mono">{Math.round(row.total_loads_per_week).toLocaleString()}</TableCell>
                <TableCell className="text-xs text-right font-mono">{row.av_penetration_pct.toFixed(4)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PanelShell>
  );
}
