import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { GREEN_PALETTE } from "../dashboard/theme";
import NoData from "../dashboard/NoData";

export default function ModelCompareChart({ data }) {
  // Defensive checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <NoData text="No model comparison data" />;
  }

  // Normalize data safely
  const formatted = data.map((d, i) => ({
    name: d.model_used || d.name || "Unknown Model",
    count:
      d.count !== undefined
        ? d.count
        : d.total !== undefined
        ? d.total
        : 0,
    color: GREEN_PALETTE[i % GREEN_PALETTE.length] || "#4ade80", // fallback green
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="count">
            {formatted.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
