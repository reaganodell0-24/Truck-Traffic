"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { FAF5Forecast } from "@/lib/types";

export function TonnageForecastChart({ data }: { data: FAF5Forecast[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No forecast data</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tonsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()}K`} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
          formatter={(value) => [`${Number(value).toLocaleString()} thousand tons`, "Tonnage"]}
        />
        <Area type="monotone" dataKey="total_tons" stroke="#00d4aa" fill="url(#tonsFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
