"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { MapView } from "@/components/map/map-container";
import { RouteDetailPanel } from "@/components/panels/route-detail-panel";
import { FAF5Panel } from "@/components/panels/faf5-panel";
import { TransborderPanel } from "@/components/panels/transborder-panel";
import { AVPenetrationPanel } from "@/components/panels/av-penetration-panel";
import { EVFeasibilityPanel } from "@/components/panels/ev-feasibility-panel";
import { CorridorDeepDivePanel } from "@/components/panels/corridor-deep-dive-panel";
import { IndustryOverviewPanel } from "@/components/panels/industry-overview-panel";

export default function Home() {
  return (
    <>
      <MainLayout>
        <MapView />
      </MainLayout>

      {/* Panels render outside MainLayout so they're not clipped by overflow-hidden */}
      <RouteDetailPanel />
      <FAF5Panel />
      <TransborderPanel />
      <AVPenetrationPanel />
      <EVFeasibilityPanel />
      <CorridorDeepDivePanel />
      <IndustryOverviewPanel />
    </>
  );
}
