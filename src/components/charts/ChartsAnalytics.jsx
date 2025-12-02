// src/components/charts/ChartsAnalytics.jsx
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

/* -------------------------------------------------------------------------- */
/* Color Palette                                                              */
/* -------------------------------------------------------------------------- */
const COLORS = [
  "#14532D", "#166534", "#17863F", "#1FA64A", "#28C556",
  "#4ADE80", "#86EFAC", "#BBF7D0", "#DCFCE7",
];
const GREEN = "#28C556";
const DARK_GREEN = "#14532D";
const GREEN_GRID = "#28C55622";
const AXIS = "#2d2d2d";

/* -------------------------------------------------------------------------- */
/* Reusable Tooltip                                                           */
/* -------------------------------------------------------------------------- */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-2 rounded shadow bg-white border border-gray-100 text-sm">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div style={{ width: 10, height: 10, background: p.color }} />
          <div>{p.name}: <span className="font-medium">{p.value}</span></div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Accuracy By Class Chart (Stacked)                                          */
/* -------------------------------------------------------------------------- */
export const AccuracyByClassChart = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const chartData = data.map(d => ({
    item: d.item || "Unknown",
    accepted: d.accepted || 0,
    rejected: d.rejected || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="accepted" stackId="a" fill={GREEN} />
        <Bar dataKey="rejected" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence By Item                                                     */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceByItemChart = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const chartData = data.map(d => ({
    item: d.item || "Unknown",
    avg_conf: (d.avg_conf ?? d.avg_confidence ?? 0) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} />
        <YAxis stroke={AXIS} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_conf">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence Histogram                                                   */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceHistogram = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const buckets = [
    { name: "0-19%", count: 0 },
    { name: "20-39%", count: 0 },
    { name: "40-59%", count: 0 },
    { name: "60-79%", count: 0 },
    { name: "80-100%", count: 0 },
  ];

  data.forEach(d => {
    const conf = (d.avg_conf ?? d.avg_confidence ?? 0) * 100;
    if (conf >= 80) buckets[4].count++;
    else if (conf >= 60) buckets[3].count++;
    else if (conf >= 40) buckets[2].count++;
    else if (conf >= 20) buckets[1].count++;
    else buckets[0].count++;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={buckets}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="name" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {buckets.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Flag Frequency Chart                                                       */
/* -------------------------------------------------------------------------- */
export const FlagFrequencyChart = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const chartData = data.map(d => ({ flag: d.flag, count: d.count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="flag" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Model Compare Chart                                                        */
/* -------------------------------------------------------------------------- */
export const ModelCompareChart = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const chartData = data.map(d => ({
    model: d.model_used || "Unknown",
    count: d.count || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="model" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Decision Duration Chart (Line)                                             */
/* -------------------------------------------------------------------------- */
export const DecisionDurationChart = ({ data = [] }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const chartData = data.map(d => ({
    item: d.item || "Unknown",
    time: d.avg_time || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="time" stroke={GREEN} strokeWidth={3} dot />
      </LineChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Brands Pie Chart                                                           */
/* -------------------------------------------------------------------------- */
export const BrandsPieChart = ({ data = [], top = 8 }) => {
  if (!data.length) return <div className="p-4">No data</div>;

  const sorted = data.slice().sort((a, b) => b.total - a.total).slice(0, top);
  const total = sorted.reduce((sum, b) => sum + (b.total || 0), 0) || 1;

  const chartData = sorted.map(b => ({
    name: b.brand || "Unknown",
    value: b.total || 0,
    percent: ((b.total / total) * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={130}
          label
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
