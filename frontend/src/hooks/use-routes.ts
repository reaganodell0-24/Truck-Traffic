"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";
import { useAppStore } from "@/stores/app-store";

export function useRoutes() {
  const { companyFilter, statusFilter, corridorFilter } = useAppStore();
  const key = ["routes", companyFilter, statusFilter, corridorFilter];
  return useSWR(key, () =>
    api.routes.list({
      company: companyFilter,
      status: statusFilter,
      corridor: corridorFilter,
    })
  );
}

export function useRoute(id: string | null) {
  return useSWR(id ? ["route", id] : null, () => api.routes.get(id!));
}

export function useRouteVolume(id: string | null) {
  return useSWR(id ? ["route-volume", id] : null, () => api.routes.volume(id!));
}
