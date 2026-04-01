"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";

export function useFAF5Flows(origin: string, dest: string, mode = "Truck", year = 2024) {
  return useSWR(
    origin && dest ? ["faf5-flows", origin, dest, mode, year] : null,
    () => api.faf5.flows({ origin, dest, mode, year })
  );
}

export function useFAF5Commodities(origin: string, dest: string, year = 2024) {
  return useSWR(
    origin && dest ? ["faf5-commodities", origin, dest, year] : null,
    () => api.faf5.commodities({ origin, dest, year })
  );
}

export function useFAF5Forecast(origin: string, dest: string, mode = "Truck") {
  return useSWR(
    origin && dest ? ["faf5-forecast", origin, dest, mode] : null,
    () => api.faf5.forecast({ origin, dest, mode })
  );
}
