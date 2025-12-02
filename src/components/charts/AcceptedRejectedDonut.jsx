import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { THEME } from "../dashboard/theme";
import NoData from "../dashboard/NoData";

export default function AcceptedRejectedDonut({ data }) {
  if (!data || data.length === 0) return <NoData text="No acceptance data" />;

  const accepted = data.reduce((sum, d) => sum + (d.accepted || 0), 0);
  const rejected = data.reduce((sum, d) => sum + (d.rejected || 0), 0);

  if (accepted + rejected === 0) return <NoData text="No accepted/rejected data" />;

  const pieData = [
    { name: "Accepted", value: accepted, color: THEME.primary },
    { name: "Rejected", value: rejected, color: THEME.danger },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
