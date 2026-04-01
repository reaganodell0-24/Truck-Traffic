"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COMPANY_COLORS } from "@/lib/constants";
import type { AVPenetrationResult, Company } from "@/lib/types";

export function AVPenetrationChart({ data }: { data: AVPenetrationResult[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No penetration data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="route_name"
          stroke="var(--muted-foreground)"
          fontSize={10}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${Number(value).toFixed(4)}%`, "AV Penetration"]}
        />
        <Bar dataKey="av_penetration_pct" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={COMPANY_COLORS[entry.company as Company] || "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
