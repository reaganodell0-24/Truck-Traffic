"use client";

import { useState, useMemo, useCallback } from "react";
import type { Company, Route, Status } from "@/lib/types";
import { routes as allRoutes } from "@/data/routes";

export function useRoutes() {
  const [selectedCompanies, setSelectedCompanies] = useState<Set<Company>>(
    new Set()
  );
  const [selectedStatuses, setSelectedStatuses] = useState<Set<Status>>(
    new Set()
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      if (selectedCompanies.size > 0 && !selectedCompanies.has(r.company))
        return false;
      if (selectedStatuses.size > 0 && !selectedStatuses.has(r.status))
        return false;
      return true;
    });
  }, [selectedCompanies, selectedStatuses]);

  const selectedRoute = useMemo<Route | null>(() => {
    if (!selectedRouteId) return null;
    return allRoutes.find((r) => r.id === selectedRouteId) ?? null;
  }, [selectedRouteId]);

  const toggleCompany = useCallback((c: Company) => {
    setSelectedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }, []);

  const toggleStatus = useCallback((s: Status) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }, []);

  const selectRoute = useCallback((id: string | null) => {
    setSelectedRouteId(id);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCompanies(new Set());
    setSelectedStatuses(new Set());
  }, []);

  return {
    routes: allRoutes,
    filteredRoutes,
    selectedCompanies,
    selectedStatuses,
    selectedRouteId,
    selectedRoute,
    toggleCompany,
    toggleStatus,
    selectRoute,
    clearFilters,
  };
}
