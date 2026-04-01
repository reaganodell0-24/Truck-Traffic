"use client";

import { useRoutes } from "@/hooks/use-routes";
import { useAppStore } from "@/stores/app-store";
import { RouteCard } from "./route-card";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteList() {
  const { data: routes, isLoading } = useRoutes();
  const { selectedRouteId, selectRoute } = useAppStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No routes match filters
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          selected={selectedRouteId === route.id}
          onClick={() => selectRoute(selectedRouteId === route.id ? null : route.id)}
        />
      ))}
    </div>
  );
}
