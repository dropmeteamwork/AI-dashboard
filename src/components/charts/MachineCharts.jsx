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
//  Universal Backend URL (Vercel/Railway-safe)
// -----------------------------------------------------
const API_BASE = import.meta.env.VITE_API_URL;

// -----------------------------------------------------
//  Universal API hook with debug
// -----------------------------------------------------
const useApi = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    fetch(url, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text(); // log raw response for debugging
          console.warn(`API call failed: ${url}`, text);
          throw new Error(`${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [path]);

  return { data, loading, error };
};

// -----------------------------------------------------
//  MACHINE PERFORMANCE CHART
// -----------------------------------------------------
export const MachinesPerformanceChart = () => {
  //  Use the correct deployed path
  const { data, loading, error } = useApi("/ai_dashboard/machines/");

  const results = data || [];

  const chartData = results.map((m) => ({
    machine: m.machine_name || m.name || "Unknown Machine",
    accepted: m.accepted ?? 0,
    rejected: m.rejected ?? 0,
    total: m.total ?? ((m.accepted ?? 0) + (m.rejected ?? 0))
  }));

  if (loading) return <div className="p-4">Loading machine performance…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4 text-gray-500">No machine data</div>;

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="machine" interval={0} angle={-30} textAnchor="end" height={70} />
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
  const { data, loading, error } = useApi("/ai_dashboard/machines/");
  const results = data || [];

  if (loading) return <div className="p-4">Loading machines…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!results.length) return <div className="p-4 text-gray-500">No machines available</div>;

  return (
    <div className="space-y-2">
      {results.map((m) => (
        <div
          key={m.id || m.machine_name || m.name}
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
