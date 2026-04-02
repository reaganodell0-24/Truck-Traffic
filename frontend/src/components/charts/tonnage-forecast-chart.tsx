"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { FAF5Forecast } from "@/lib/types";

interface TonnageForecastChartProps {
  data: FAF5Forecast[];
  growthPct?: number;
}

export function TonnageForecastChart({ data, growthPct = 0 }: TonnageForecastChartProps) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No forecast data</div>;

  // Split into actuals (<=2024) and forecasts (>2024)
  // Build chart data with three series: actuals, fhwa forecast, user adjusted
  const chartData = data.map((d) => {
    const isActual = d.year <= 2024;
    const yearsSince2024 = d.year - 2024;

    // User-adjusted: compound growth on top of FHWA forecast
    const adjusted = growthPct !== 0 && !isActual
      ? d.total_tons * Math.pow(1 + growthPct / 100, yearsSince2024)
      : null;

    return {
      year: d.year,
      actuals: isActual ? d.total_tons : null,
      forecast: !isActual ? d.total_tons : null,
      adjusted: adjusted,
      // Bridge: connect the last actual to first forecast
      bridge: d.year === 2024 ? d.total_tons : (!isActual ? d.total_tons : null),
      adjustedBridge: d.year === 2024 ? d.total_tons : adjusted,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="actualsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="adjustedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${Number(v).toLocaleString()}K`} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--foreground)" }}
          formatter={(value, name) => {
            if (value === null || value === undefined) return ["", ""];
            const labels: Record<string, string> = {
              actuals: "Actual",
              bridge: "FHWA Forecast",
              forecast: "FHWA Forecast",
              adjustedBridge: "Your Scenario",
              adjusted: "Your Scenario",
            };
            return [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}K tons`, labels[String(name)] || String(name)];
          }}
        />
        <ReferenceLine x={2024} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeOpacity={0.5} />

        {/* Actuals — solid cyan */}
        <Area
          type="monotone"
          dataKey="actuals"
          stroke="#00d4aa"
          fill="url(#actualsFill)"
          strokeWidth={2}
          connectNulls={false}
          dot={{ r: 3, fill: "#00d4aa" }}
        />

        {/* FHWA Forecast — dashed amber (bridge connects from 2024) */}
        <Area
          type="monotone"
          dataKey="bridge"
          stroke="#f59e0b"
          fill="url(#forecastFill)"
          strokeWidth={2}
          strokeDasharray="6 3"
          connectNulls
          dot={false}
        />

        {/* User adjusted — dashed purple (only when growthPct != 0) */}
        {growthPct !== 0 && (
          <Area
            type="monotone"
            dataKey="adjustedBridge"
            stroke="#8b5cf6"
            fill="url(#adjustedFill)"
            strokeWidth={2}
            strokeDasharray="4 2"
            connectNulls
            dot={false}
          />
        )}

        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value: string) => {
            const labels: Record<string, string> = {
              actuals: "Actuals (2017-2024)",
              bridge: "FHWA Forecast",
              adjustedBridge: `Your Scenario (${growthPct > 0 ? "+" : ""}${growthPct}%/yr)`,
            };
            return labels[value] || value;
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
