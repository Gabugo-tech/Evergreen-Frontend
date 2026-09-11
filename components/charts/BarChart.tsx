"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  currency?: string;
}

export default function BarChart({
  data,
  color = "#2563eb",
  height = 200,
  showGrid = false,
  currency = "USD",
}: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e2d45" : "#e2e8f0";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        )}
        <XAxis
          dataKey="label"
          tick={{ fill: textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat("en-US", {
              notation: "compact",
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(v)
          }
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#131f33" : "#ffffff",
            border: `1px solid ${isDark ? "#1e2d45" : "#e2e8f0"}`,
            borderRadius: "12px",
            fontSize: 12,
          }}
          itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: 600 }}
          cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", radius: 8 }}
          formatter={(value: number) => [
            new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value),
            "Amount",
          ]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || color} fillOpacity={0.9} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
