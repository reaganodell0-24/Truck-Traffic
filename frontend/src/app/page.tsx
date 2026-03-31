"use client";

import { useState } from "react";
import { useRoutes } from "@/hooks/useRoutes";
import MapWrapper from "@/components/map/MapContainer";
import MapLegend from "@/components/map/MapLegend";
import RouteSidebar from "@/components/routes/RouteSidebar";
import RouteDetail from "@/components/routes/RouteDetail";
import { terminals, chargingStops } from "@/data/routes";

export default function Home() {
  const {
    routes,
    filteredRoutes,
    selectedCompanies,
    selectedStatuses,
    selectedRouteId,
    selectedRoute,
    toggleCompany,
    toggleStatus,
    selectRoute,
    clearFilters,
  } = useRoutes();

  const [showTerminals, setShowTerminals] = useState(true);
  const [showCharging, setShowCharging] = useState(true);

  return (
    <div className="grid h-screen grid-cols-[340px_1fr]">
      <RouteSidebar
        routes={routes}
        filteredRoutes={filteredRoutes}
        selectedCompanies={selectedCompanies}
        selectedStatuses={selectedStatuses}
        selectedRouteId={selectedRouteId}
        onToggleCompany={toggleCompany}
        onToggleStatus={toggleStatus}
        onClearFilters={clearFilters}
        onSelectRoute={selectRoute}
        showTerminals={showTerminals}
        showCharging={showCharging}
        onToggleTerminals={() => setShowTerminals((v) => !v)}
        onToggleCharging={() => setShowCharging((v) => !v)}
      />

      <div className="relative h-full">
        <MapWrapper
          routes={filteredRoutes}
          terminals={terminals}
          chargingStops={chargingStops}
          showTerminals={showTerminals}
          showCharging={showCharging}
          selectedRouteId={selectedRouteId}
          onSelectRoute={selectRoute}
        />
        <MapLegend />
        {selectedRoute && (
          <RouteDetail
            route={selectedRoute}
            onClose={() => selectRoute(null)}
          />
        )}
      </div>
    </div>
  );
}
