// ChartsAnalytics.jsx
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

/* Palette from your screenshot */
const COLORS = [
  "#14532D",
  "#166534",
  "#17863F",
  "#1FA64A",
  "#28C556",
  "#4ADE80",
  "#86EFAC",
  "#BBF7D0",
  "#DCFCE7",
];

const GREEN = "#28C556";
const DARK_GREEN = "#14532D";
const GREEN_GRID = "#28C55622";
const AXIS = "#2d2d2d";

/* Small reusable tooltip (clean white box) */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="p-2 rounded shadow bg-white border border-gray-100 text-sm">
      <div className="font-semibold text-sm mb-1">{label}</div>
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
/* Classification Distribution — stacked Accepted (green) / Rejected (red)    */
/* -------------------------------------------------------------------------- */
export const AccuracyByClassChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    item: d.item,
    accepted: d.accepted || 0,
    rejected: d.rejected || 0,
    total: d.total || (d.accepted || 0) + (d.rejected || 0),
  }));

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} />
        {/* accepted green bottom stack */}
        <Bar dataKey="accepted" stackId="a" name="Accepted" fill={GREEN} radius={[6, 6, 0, 0]} />
        {/* rejected red on top */}
        <Bar dataKey="rejected" stackId="a" name="Rejected" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence By Item — show avg_conf * 100 as percent bars               */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceByItemChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    item: d.item,
    avg_conf: (d.avg_conf ?? d.avg_confidence ?? 0) * 100,
  }));

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avg_conf" name="Avg Confidence (%)" animationDuration={900}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence Histogram (buckets 0-9 => 0-9%)                              */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceHistogram = ({ data = [] }) => {
  // Accepts same avg_confidence_by_item array
  if (!data?.length) return <div className="p-4">No data</div>;

  // create 5 buckets: 0-19,20-39,40-59,60-79,80-100
  const buckets = [
    { name: "0-19%", count: 0 },
    { name: "20-39%", count: 0 },
    { name: "40-59%", count: 0 },
    { name: "60-79%", count: 0 },
    { name: "80-100%", count: 0 },
  ];

  data.forEach((d) => {
    const conf = (d.avg_conf ?? d.avg_confidence ?? 0) * 100;
    let idx = 0;
    if (conf >= 80) idx = 4;
    else if (conf >= 60) idx = 3;
    else if (conf >= 40) idx = 2;
    else if (conf >= 20) idx = 1;
    else idx = 0;
    buckets[idx].count += 1;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={buckets} margin={{ top: 10, right: 20, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="name" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Items" animationDuration={900}>
          {buckets.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Flag Frequency (bars)                                                      */
/* -------------------------------------------------------------------------- */
export const FlagFrequencyChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    flag: d.flag,
    count: d.count,
  }));

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 12, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="flag" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Count" animationDuration={900}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Model Compare (simple bar)                                                 */
/* -------------------------------------------------------------------------- */
export const ModelCompareChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    model: d.model_used,
    count: d.count,
  }));

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 12, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="model" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Predictions" animationDuration={900}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Decision Duration (line)                                                   */
/* -------------------------------------------------------------------------- */
export const DecisionDurationChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    item: d.item,
    time: d.avg_time ?? 0,
  }));

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 12, left: 8, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="time" stroke={GREEN} strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// /* -------------------------------------------------------------------------- */
// /* Brands Summary (vertical horizontal list + big pie)                        */
// /* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Brands Summary — Scrollable List + Counts                                   */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Brands Summary — Scrollable List Behind Pie Chart                          */
/* -------------------------------------------------------------------------- */
export const BrandsSummaryChart = ({ data = [] }) => {
  const chartData = (data || []).slice().sort((a, b) => b.total - a.total);

  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <div className="w-full h-[420px] overflow-y-auto pr-2 space-y-3">
      {chartData.map((brand, i) => (
        <div
          key={i}
          className="flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            {/* color dot */}
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />

            <div>
              <div className="text-sm font-semibold">{brand.brand}</div>
              <div className="text-xs text-gray-500">
                last seen: {brand.last_seen || "N/A"}
              </div>
            </div>
          </div>

          <div className="text-lg font-bold">{brand.total}</div>
        </div>
      ))}
    </div>
  );
};










/* -------------------------------------------------------------------------- */
/* Brands Pie Chart                                                           */
/* -------------------------------------------------------------------------- */
export const BrandsPieChart = ({ data = [], top = 8 }) => {
  if (!data?.length) return <div className="p-4">No data</div>;

  // Sort & take top N
  const sorted = data.slice().sort((a, b) => b.total - a.total).slice(0, top);

  // Total for percentage calculation
  const total = sorted.reduce((acc, item) => acc + (item.total || 0), 0) || 1;

  // Prepare pie data
  const chartData = sorted.map((b) => ({
    name: b.brand,
    value: b.total,
    percent: ((b.total / total) * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={130}
          innerRadius={60}
          paddingAngle={2}
          label={({ name, percent }) => `${name} (${percent}%)`}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Legend verticalAlign="bottom" height={32} />
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};


