"use client";

import { useRoutes } from "@/hooks/use-routes";
import { useAppStore } from "@/stores/app-store";
import { StatBlock } from "@/components/shared/stat-block";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import type { PanelType } from "@/lib/types";

const panelButtons: { panel: PanelType; label: string }[] = [
  { panel: "faf5", label: "FAF5 Freight" },
  { panel: "transborder", label: "Border Data" },
  { panel: "av-penetration", label: "AV Analytics" },
  { panel: "ev-feasibility", label: "EV Calculator" },
  { panel: "corridor-dive", label: "Corridor Dive" },
  { panel: "industry", label: "Industry" },
];

export function Header() {
  const { data: routes } = useRoutes();
  const { activePanel, openPanel, closePanel } = useAppStore();

  const routeCount = routes?.length ?? 0;
  const activeCount = routes?.filter((r) => r.status === "active").length ?? 0;
  const operators = routes ? new Set(routes.map((r) => r.company)).size : 0;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-bold font-mono tracking-tight text-foreground">
            TX AUTONOMOUS ROUTE DB
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Commercial &amp; Planned Driverless Freight Corridors
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1">
          {panelButtons.map(({ panel, label }) => (
            <Button
              key={panel}
              variant={activePanel === panel ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                activePanel === panel ? closePanel() : openPanel(panel)
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <StatBlock value={routeCount} label="Routes" />
          <StatBlock value={activeCount} label="Active" />
          <StatBlock value={operators} label="Operators" />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
