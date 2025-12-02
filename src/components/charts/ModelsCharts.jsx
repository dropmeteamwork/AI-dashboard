import React from "react";
import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
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

export const ModelPerformanceChart = ({ days = 30 }) => {
  const { data, loading, error } = useApi(`/api/model-performance/?days=${days}`);
  const series = data?.series || [];
  const chartData = series.map((s) => ({ day: s.day, avg_confidence: +(s.avg_confidence || s.avg_conf || 0) * 100 }));

  if (loading) return <div className="p-4">Loading model performance…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#666" />
        <YAxis stroke="#666" unit="%" />
        <Tooltip />
        <Line type="monotone" dataKey="avg_confidence" stroke="#2563EB" name="Avg Confidence (%)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ModelsConfidenceChart = () => {
  const { data, loading, error } = useApi("/api/ai-models/");
  const models = data?.models || [];
  const chartData = models.map((m) => ({ model: m.model_used, avg_confidence: +(m.avg_confidence || 0) * 100 }));

  if (loading) return <div className="p-4">Loading models…</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!chartData.length) return <div className="p-4">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="model" stroke="#666" />
        <YAxis stroke="#666" unit="%" />
        <Tooltip />
        <Bar dataKey="avg_confidence" fill="#8B5CF6" name="Avg Confidence (%)" />
      </BarChart>
    </ResponsiveContainer>
  );
};