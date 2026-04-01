"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";

export function useAVPenetration() {
  return useSWR("av-penetration", () => api.analytics.avPenetration());
}

export function useEVFeasibility(truckType: string | null) {
  return useSWR(
    truckType ? ["ev-feasibility", truckType] : null,
    () => api.analytics.evFeasibility(truckType!)
  );
}
