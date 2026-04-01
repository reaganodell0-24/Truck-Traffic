"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTerminals } from "@/hooks/use-terminals";
import { COMPANY_COLORS } from "@/lib/constants";
import type { Company } from "@/lib/types";

function createTerminalIcon(operators: string[]) {
  const color = operators.length > 0
    ? COMPANY_COLORS[operators[0] as Company] || "#00d4aa"
    : "#00d4aa";

  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `
      <div style="position:relative;width:16px;height:16px;">
        <div class="terminal-pulse" style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;"></div>
        <div style="position:absolute;top:4px;left:4px;width:8px;height:8px;border-radius:50%;background:${color};"></div>
      </div>
    `,
  });
}

export function TerminalMarkers() {
  const { data: terminals } = useTerminals();

  if (!terminals) return null;

  return (
    <>
      {terminals.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={createTerminalIcon(t.operators)}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{t.name}</div>
              <div className="text-muted-foreground">{t.city}</div>
              <div className="mt-1 text-xs">
                {t.capabilities.join(" · ")}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
