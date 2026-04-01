import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function parseAADT(aadtStr: string | null): { low: number; high: number; mid: number } | null {
  if (!aadtStr) return null;
  const parts = aadtStr.replace(/,/g, "").split("-");
  const low = parseInt(parts[0], 10);
  const high = parseInt(parts[1] || parts[0], 10);
  return { low, high, mid: Math.round((low + high) / 2) };
}
