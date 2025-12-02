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

// API hook
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();

    fetch(url, { signal: ac.signal })
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

// ✔ Machine Performance (Bar Chart)
export const MachinesPerformanceChart = () => {
  const { data, loading, error } = useApi("/api/machines/");

  const chartData = (data || []).map((m) => ({
    machine: m.machine_name,
    accepted: m.accepted || 0,
    rejected: m.rejected || 0,
    total: m.total || 0
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

// ✔ Machine Status List
export const MachinesStatusList = () => {
  const { data, loading, error } = useApi("/api/machines/");

  if (loading) return <div className="p-4">Loading machines…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-2">
      {(data || []).map((m) => (
        <div
          key={m.machine_name}
          className="p-2 border rounded flex items-center justify-between hover:bg-gray-50"
        >
          <div>
            <div className="font-medium">{m.machine_name}</div>
            <div className="text-xs text-gray-500">Last seen: {m.last_seen}</div>
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
