// BrandsChart.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/**
 * Global Backend URL
 */
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
 * Brands Summary Chart
 */
export const BrandsSummaryChart = () => {
  const { data, loading, error } = useApi("/api/analytics/");
  const brands = data?.brands_summary || [];

  const chartData = brands.map((b) => ({
    brand: b.brand,
    total: b.total,
  }));

  if (loading) return <div className="p-4">Loading brands…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4">No brand data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="brand"
          interval={0}
          angle={-30}
          textAnchor="end"
          height={70}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#F59E0B" />
      </BarChart>
    </ResponsiveContainer>
  );
};
