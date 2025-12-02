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
/* Global API Hook                                                            */
/* -------------------------------------------------------------------------- */
const API_BASE = import.meta.env.VITE_API_URL || "https://web-ai-dashboard.up.railway.app";

const useApi = (endpoint) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    fetch(`${API_BASE}${endpoint}`, { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [endpoint]);

  return { data, loading, error };
};

/* -------------------------------------------------------------------------- */
/* Custom Tooltip                                                             */
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
/* Accuracy By Class Chart                                                     */
/* -------------------------------------------------------------------------- */
export const AccuracyByClassChart = () => {
  const { data, loading, error } = useApi("/ai_dashboard/accuracy-by-class/");

  const chartData = (data || []).map(d => ({
    item: d.item || "Unknown",
    accepted: d.accepted || 0,
    rejected: d.rejected || 0,
  }));

  if (loading) return <div className="p-4">Loading accuracy…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4">No data</div>;

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
export const AvgConfidenceByItemChart = () => {
  const { data, loading, error } = useApi("/ai_dashboard/avg-confidence-by-item/");

  const chartData = (data || []).map(d => ({
    item: d.item || "Unknown",
    avg_conf: (d.avg_conf ?? d.avg_confidence ?? 0) * 100,
  }));

  if (loading) return <div className="p-4">Loading avg confidence…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4">No data</div>;

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
export const AvgConfidenceHistogram = () => {
  const { data, loading, error } = useApi("/ai_dashboard/avg-confidence-by-item/");

  if (loading) return <div className="p-4">Loading histogram…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.length) return <div className="p-4">No data</div>;

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
/* Brands Summary Chart                                                       */
/* -------------------------------------------------------------------------- */
export const BrandsSummaryChart = () => {
  const { data, loading, error } = useApi("/ai_dashboard/brands-summary/");

  if (loading) return <div className="p-4">Loading brands…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.length) return <div className="p-4">No data</div>;

  const chartData = data.slice().sort((a, b) => b.total - a.total);

  return (
    <div className="w-full h-[420px] overflow-y-auto pr-2 space-y-3">
      {chartData.map((b, i) => (
        <div
          key={i}
          className="flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <div>
              <div className="text-sm font-semibold">{b.brand || "Unknown"}</div>
              <div className="text-xs text-gray-500">Last seen: {b.last_seen || "N/A"}</div>
            </div>
          </div>
          <div className="text-lg font-bold">{b.total || 0}</div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Brands Pie Chart                                                           */
/* -------------------------------------------------------------------------- */
export const BrandsPieChart = ({ top = 8 }) => {
  const { data, loading, error } = useApi("/ai_dashboard/brands-summary/");

  if (loading) return <div className="p-4">Loading brands…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!data?.length) return <div className="p-4">No data</div>;

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

/* -------------------------------------------------------------------------- */
/* Recent Predictions Timeline                                                */
/* -------------------------------------------------------------------------- */
export const RecentPredictionsTimeline = () => {
  const { data, loading, error } = useApi("/ai_dashboard/recent-activity/?page_size=200");

  const results = data?.results || data || [];

  const map = new Map();
  results.forEach((r) => {
    const t = r.created_at || r.timestamp || r.last_seen;
    if (!t) return;
    const key = t.slice(0, 16); // round per minute
    map.set(key, (map.get(key) || 0) + 1);
  });

  const chartData = Array.from(map.entries())
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => (a.time > b.time ? 1 : -1));

  if (loading) return <div className="p-4">Loading timeline…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4 text-gray-500">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="time" stroke={AXIS} />
        <YAxis stroke={AXIS} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
