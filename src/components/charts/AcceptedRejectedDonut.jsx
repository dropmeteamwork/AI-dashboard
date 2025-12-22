import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import NoData from "../dashboard/NoData";

// Blue and Pink colors like RVM image
const BLUE = "#60A5FA";
const PINK = "#EC4899";

// Custom tooltip matching RVM style
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      padding: "12px 16px",
      borderRadius: "12px",
      background: "white",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "14px" }}>
        <div style={{ width: 10, height: 10, background: payload[0].payload.color, borderRadius: "4px" }} />
        <span>{payload[0].name}: <strong>{payload[0].value.toLocaleString()}</strong></span>
      </div>
    </div>
  );
};

export default function AcceptedRejectedDonut({ data }) {
  if (!data || data.length === 0) return <NoData text="No acceptance data" />;

  const accepted = data.reduce((sum, d) => sum + (d.accepted || 0), 0);
  const rejected = data.reduce((sum, d) => sum + (d.rejected || 0), 0);
  const total = accepted + rejected;

  if (total === 0) return <NoData text="No accepted/rejected data" />;

  const acceptedPercent = ((accepted / total) * 100).toFixed(2);
  const rejectedPercent = ((rejected / total) * 100).toFixed(2);

  const pieData = [
    { name: "Accepted", value: accepted, color: BLUE, percent: acceptedPercent },
    { name: "Rejected", value: rejected, color: PINK, percent: rejectedPercent },
  ];

  // Custom label with percentage outside
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent, fill }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={fill}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", fontWeight: "500" }}
      >
        {`${name}: ${percent}%`}
      </text>
    );
  };

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "16px", fontFamily: "'Outfit', sans-serif" }}
            formatter={(value) => <span style={{ color: "#374151", fontSize: "14px" }}>{value}</span>}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={0}
            outerRadius={90}
            paddingAngle={1}
            label={renderCustomLabel}
            labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
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
