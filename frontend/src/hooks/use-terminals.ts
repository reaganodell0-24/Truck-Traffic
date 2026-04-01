"use client";

import useSWR from "swr";
import { api } from "@/lib/api-client";

export function useTerminals(operator?: string | null) {
  return useSWR(["terminals", operator], () => api.terminals.list({ operator }));
}
