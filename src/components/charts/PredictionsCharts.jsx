// ChartsAnalytics.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// FRIENDS GREEN PALETTE
const themeColors = {
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  primaryLight: "#81C784",
  accent: "#A5D6A7",
  soft: "#C8E6C9",
  danger: "#EF5350",
};

// GLOBAL BACKEND URL
const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Universal API hook
 */
const useApi = (path) => {
  const url = `${API_BASE}${path}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    fetch(url, { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [url]);

  return { data, loading, error };
};

/**
 * PredictionsConfidenceDistributionChart
 */
export const PredictionsConfidenceDistributionChart = ({ limit = 1000 }) => {
  const { data, loading, error } = useApi(`/ai_dashboard/predictions/?page_size=${limit}`);
  const results = data?.results || [];

  const buckets = {
    "90-100%": 0,
    "80-89%": 0,
    "70-79%": 0,
    "60-69%": 0,
    "<60%": 0,
  };

  results.forEach((r) => {
    const c = Math.round((r.confidence ?? 0) * 100);
    if (c >= 90) buckets["90-100%"]++;
    else if (c >= 80) buckets["80-89%"]++;
    else if (c >= 70) buckets["70-79%"]++;
    else if (c >= 60) buckets["60-69%"]++;
    else buckets["<60%"]++;
  });

  const chartData = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  if (loading) return <div className="p-4">Loading prediction confidences…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4 text-gray-500">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="range" stroke="#4b5563" />
        <YAxis stroke="#4b5563" />
        <Tooltip />
        <Bar dataKey="count" fill={themeColors.primary} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * AcceptedRejectedChart
 */
export const AcceptedRejectedChart = ({ limit = 1000 }) => {
  const { data, loading, error } = useApi(`/ai_dashboard/predictions/?page_size=${limit}`);
  const results = data?.results || [];

  let accepted = 0;
  let rejected = 0;

  results.forEach((r) => {
    const status = (r.status || "").toLowerCase();
    if (status.includes("accept")) accepted++;
    else if (status.includes("reject")) rejected++;
  });

  const chartData = [
    { key: "Accepted", value: accepted },
    { key: "Rejected", value: rejected },
  ];

  if (loading) return <div className="p-4">Loading accept/reject…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4 text-gray-500">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="key"
          innerRadius={45}
          outerRadius={85}
          label
        >
          <Cell fill={themeColors.primary} />
          <Cell fill={themeColors.danger} />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * RecentPredictionsTimeline
 */
export const RecentPredictionsTimeline = ({ limit = 200 }) => {
  const { data, loading, error } = useApi(`/ai_dashboard/recent-activity/?page_size=${limit}`);
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#4b5563" />
        <YAxis stroke="#4b5563" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke={themeColors.primaryDark} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
