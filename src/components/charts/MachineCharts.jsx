// MachineCharts.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// -----------------------------------------------------
//  FIX FOR VERCEL: always use FULL backend URL
// -----------------------------------------------------
const BASE_URL = "https://web-ai-dashboard.up.railway.app";

const buildUrl = (path) => {
  if (path.startsWith("http")) return path;
  return BASE_URL + path;
};

// API hook
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    const fullUrl = buildUrl(url);

    fetch(fullUrl, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((j) => setData(j))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [url]);

  return { data, loading, error };
};

// -----------------------------------------------------
//  MACHINE PERFORMANCE CHART
// -----------------------------------------------------
export const MachinesPerformanceChart = () => {
  const { data, loading, error } = useApi("/ai_dashboard/dashboard-admin/machines/");

  const results = data || [];

  const chartData = results.map((m) => ({
    machine: m.machine_name || m.name || "Unknown Machine",
    accepted: m.accepted ?? 0,
    rejected: m.rejected ?? 0,
    total: m.total ?? (m.accepted ?? 0) + (m.rejected ?? 0)
  }));

  if (loading) return <div className="p-4">Loading machine performance…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="machine" />
        <YAxis />

        <Tooltip />
        <Legend />

        <Bar dataKey="total" fill="#3B82F6" name="Total" />
        <Bar dataKey="accepted" fill="#16A34A" name="Accepted" />
        <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// -----------------------------------------------------
//  MACHINE STATUS LIST
// -----------------------------------------------------
export const MachinesStatusList = () => {
  const { data, loading, error } = useApi("/ai_dashboard/dashboard-admin/machines/");

  if (loading) return <div className="p-4">Loading machines…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const results = data || [];

  return (
    <div className="space-y-2">
      {results.map((m) => (
        <div
          key={m.machine_name || m.name}
          className="p-2 border rounded flex items-center justify-between hover:bg-gray-50"
        >
          <div>
            <div className="font-medium">{m.machine_name || m.name || "Unknown Machine"}</div>
            <div className="text-xs text-gray-500">
              Last seen: {m.last_seen || "No data"}
            </div>
          </div>

          <div className="flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                m.online ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
