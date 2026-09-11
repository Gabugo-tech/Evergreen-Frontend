"use client";

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  currency?: string;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
}

export default function AreaChart({
  data,
  color = "#2563eb",
  currency = "USD",
  height = 220,
  showGrid = false,
  showAxes = true,
}: AreaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e2d45" : "#e2e8f0";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`areaGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        )}

        {showAxes && (
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
        )}

        {showAxes && (
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
            width={60}
          />
        )}

        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#131f33" : "#ffffff",
            border: `1px solid ${isDark ? "#1e2d45" : "#e2e8f0"}`,
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            fontSize: 12,
          }}
          labelStyle={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: 4 }}
          itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: 600 }}
          formatter={(value: number) => [formatCurrency(value, currency), "Value"]}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#areaGrad-${color.replace("#", "")})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: isDark ? "#131f33" : "#fff", strokeWidth: 2 }}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
