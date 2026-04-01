"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { FAF5Flow } from "@/lib/types";

export function CommodityBarChart({ data }: { data: FAF5Flow[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No commodity data</div>;

  const chartData = data.slice(0, 10).map((d) => ({
    name: d.commodity_name?.length > 18 ? d.commodity_name.slice(0, 16) + "…" : d.commodity_name,
    tons: d.total_tons,
    value: d.total_value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()}K`} />
        <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={80} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${Number(value).toLocaleString()} thousand tons`, "Tonnage"]}
        />
        <Bar dataKey="tons" fill="#00d4aa" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
