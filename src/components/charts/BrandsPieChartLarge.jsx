import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { THEME, GREEN_PALETTE } from "../dashboard/theme";
import NoData from "../dashboard/NoData";

export default function BrandsPieChartLarge({ data }) {
  if (!data || data.length === 0) return <NoData text="No brand summary" />;

  const formatted = data.map((d, i) => ({
    name: d.brand || d.name,
    value: d.total || d.count || 0,
    color: GREEN_PALETTE[i % GREEN_PALETTE.length],
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie data={formatted} dataKey="value" nameKey="name" outerRadius={120}>
            {formatted.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
