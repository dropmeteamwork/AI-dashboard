import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { THEME } from "../dashboard/theme";
import NoData from "../dashboard/NoData";

export default function AccuracyByClassChart({ data }) {
  if (!data || data.length === 0) return <NoData text="No accuracy data" />;

  const chartData = data.map((d) => ({
    name: d.item || d.class || d.label,
    accepted: d.accepted || 0,
    rejected: d.rejected || 0,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="accepted" stackId="a" fill={THEME.primary} />
          <Bar dataKey="rejected" stackId="a" fill={THEME.danger} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
