"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({
  data,
  height = 220,
  innerRadius = 60,
  outerRadius = 90,
  showLegend = false,
  centerLabel: _centerLabel,
  centerValue: _centerValue,
}: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>

        {/* Center text via foreignObject trick isn't needed — we use absolute overlay */}

        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#131f33" : "#ffffff",
            border: `1px solid ${isDark ? "#1e2d45" : "#e2e8f0"}`,
            borderRadius: "12px",
            fontSize: 12,
          }}
          itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: 600 }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
        />

        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
