"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { EVFeasibilityResult } from "@/lib/types";

export function EVComparisonChart({ data }: { data: EVFeasibilityResult[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No feasibility data</div>;

  const chartData = data
    .filter((d) => d.distance_miles)
    .map((d) => ({
      name: d.route_name.length > 20 ? d.route_name.slice(0, 18) + "…" : d.route_name,
      stops: d.charging_stops_needed,
      direct: d.can_complete_direct,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={10}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [String(value), "Stops Needed"]}
        />
        <Bar dataKey="stops" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.direct ? "#22c55e" : "#06b6d4"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
