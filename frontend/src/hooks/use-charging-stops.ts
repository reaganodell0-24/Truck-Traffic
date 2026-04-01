"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";

export function useChargingStops(corridor?: string | null) {
  return useSWR(["charging-stops", corridor], () => api.chargingStops.list({ corridor }));
}
