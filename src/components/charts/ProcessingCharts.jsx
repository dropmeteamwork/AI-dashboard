import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [url]);

  return { data, loading, error };
};

/**
 * ProcessingTrendChart
 */
export const ProcessingTrendChart = ({ period = "hourly" }) => {
  const url = `/api/processing/?period=${period}`;
  const { data, loading, error } = useApi(url);

  const chartData = (data?.series || []).map((s) => ({
    label: s.hour ? new Date(s.hour).toLocaleString() : "Unknown",
    count: s.count || 0,
  }));

  if (loading) return <div className="p-6">Loading processing trend…</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-6 text-muted-foreground">No data</div>;

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#22C55E"
            strokeWidth={2}
            name="Detections"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * HourlyProcessingChart
 */
export const HourlyProcessingChart = () => (
  <ProcessingTrendChart period="hourly" />
);

/**
 * DailyProcessingChart
 */
export const DailyProcessingChart = () => (
  <ProcessingTrendChart period="daily" />
);

/**
 * RealTimeMetricsChart
 */
export const RealTimeMetricsChart = ({ points = 6 }) => {
  const { data, loading, error } = useApi(`/api/processing/?period=hourly`);
  const raw = data?.series || [];

  const slice = raw.slice(-points).map((s) => ({
    x: s.hour ? new Date(s.hour).toLocaleTimeString() : "Unknown",
    count: s.count || 0,
  }));

  if (loading) return <div className="p-4">Loading realtime metrics…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={slice}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#22C55E"
            fill="#DCFCE7"
            name="Items/Hour"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
