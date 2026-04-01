"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export function MapView() {
  return (
    <div className="h-full w-full">
      <MapInner />
    </div>
  );
}
