// src/components/charts/ModelsCharts.jsx
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { COLORS } from "@/constants/colors";

// BACKEND DOMAIN
const BASE_URL = "https://web-ai-dashboard.up.railway.app";

// -------------------------
// API Hook
// -------------------------
export const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let retries = 0;
    const maxRetries = 2;

    const fetchData = async () => {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 6000); // 6 second timeout

      try {
        if (!isMounted) return;
        setLoading(true);
        const url = `${BASE_URL}${endpoint}`;

        const response = await fetch(url, { signal: ac.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          // If 404, don't retry - endpoint doesn't exist
          if (response.status === 404) {
            if (isMounted) {
              setData(null);
              setLoading(false);
              setError(null);
            }
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        if (isMounted) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeout);
        
        if (err.name === "AbortError") {
          // Timeout - retry if we haven't exhausted retries
          if (retries < maxRetries) {
            retries++;
            console.log(`API timeout, retrying ${endpoint} (${retries}/${maxRetries})...`);
            // Wait before retrying to avoid hammering the server
            setTimeout(() => {
              if (isMounted) {
                fetchData();
              }
            }, 1000);
            return;
          }
          if (isMounted) {
            setError(new Error("Request timeout after retries"));
            setData(null);
            setLoading(false);
          }
        } else if (isMounted) {
          setError(err);
          setData(null);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, loading, error };
};

// -------------------------
// Model Performance Chart
// -------------------------
export const ModelPerformanceChart = ({ days = 30 }) => {
  const { data, loading, error } = useApi(
    `/ai_dashboard/model-performance/?days=${days}`
  );

  const series = data?.series || [];
  const chartData = series.map((s) => ({
    day: s.day,
    avg_confidence: +(s.avg_confidence || s.avg_conf || 0) * 100,
    accuracy: +(s.accuracy || 0) * 100,
    precision: +(s.precision || 0) * 100,
    recall: +(s.recall || 0) * 100,
  }));

  const stats = {
    avgConfidence: chartData.length > 0 
      ? (chartData.reduce((sum, d) => sum + d.avg_confidence, 0) / chartData.length).toFixed(1)
      : 0,
    maxConfidence: chartData.length > 0 ? Math.max(...chartData.map(d => d.avg_confidence)).toFixed(1) : 0,
    minConfidence: chartData.length > 0 ? Math.min(...chartData.map(d => d.avg_confidence)).toFixed(1) : 0,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-red-600">Error loading data: {error?.message}</p>
        </div>
      </div>
    );
  }

  if (loading || !chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{data.day}</p>
          <p className="text-xs text-blue-600">Confidence: {data.avg_confidence.toFixed(1)}%</p>
          {data.accuracy > 0 && <p className="text-xs text-purple-600">Accuracy: {data.accuracy.toFixed(1)}%</p>}
          {data.precision > 0 && <p className="text-xs text-emerald-600">Precision: {data.precision.toFixed(1)}%</p>}
          {data.recall > 0 && <p className="text-xs text-orange-600">Recall: {data.recall.toFixed(1)}%</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">Average Confidence</p>
          <p className="text-lg font-bold text-blue-700">{stats.avgConfidence}%</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Peak Performance</p>
          <p className="text-lg font-bold text-green-700">{stats.maxConfidence}%</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Low Point</p>
          <p className="text-lg font-bold text-red-700">{stats.minConfidence}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="#9ca3af"
            unit="%"
            domain={[0, 100]}
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="natural"
            dataKey="avg_confidence"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ fill: "#2563EB", r: 4 }}
            activeDot={{ r: 6, fill: "#1d4ed8" }}
            name="Avg Confidence (%)"
            isAnimationActive={true}
          />
          {series.some(s => s.accuracy) && (
            <Line
              type="natural"
              dataKey="accuracy"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name="Accuracy (%)"
              isAnimationActive={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// -------------------------
// Models Confidence Chart
// -------------------------
export const ModelsConfidenceChart = ({ modelData = null }) => {
  const { data, loading: apiLoading, error: apiError } = useApi(`/ai_dashboard/ai-models/`);

  // Use provided model data or fallback to API
  const models = modelData || data?.models || [];
  const chartData = models
    .map((m) => {
      // Check if avg_confidence is already a percentage (0-100) or a decimal (0-1)
      const conf = +(m.avg_confidence || 0);
      const confidenceValue = conf > 1 ? conf : conf * 100;
      return {
        model_used: m.model_used || "Unknown",
        avg_confidence: confidenceValue,
        count: m.count || 0,
        accuracy: +(m.accuracy || 0) > 1 ? +(m.accuracy || 0) : +(m.accuracy || 0) * 100,
      };
    })
    .sort((a, b) => b.avg_confidence - a.avg_confidence);

  const loading = modelData ? false : apiLoading;
  const error = modelData ? null : apiError;

  const topModel = chartData.length > 0 ? chartData[0] : null;

  if (error && !chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-red-600">Error loading models</p>
        </div>
      </div>
    );
  }

  if (loading || !chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return COLORS.PRIMARY; // green
    if (confidence >= 75) return "#3b82f6"; // blue
    if (confidence >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{data.model_used}</p>
          <p className="text-xs text-purple-600">Confidence: {data.avg_confidence.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">Predictions: {data.count.toLocaleString()}</p>
          {data.accuracy > 0 && <p className="text-xs text-blue-600">Accuracy: {data.accuracy.toFixed(1)}%</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Model Stats */}
      {topModel && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Top Performing Model</p>
          <p className="text-lg font-bold text-purple-700">{topModel.model_used}</p>
          <p className="text-sm text-gray-600 mt-2">
            Confidence: <span className="font-semibold text-purple-600">{topModel.avg_confidence.toFixed(1)}%</span> • 
            Predictions: <span className="font-semibold text-gray-700">{topModel.count.toLocaleString()}</span>
          </p>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="model_used" 
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="#9ca3af"
            unit="%"
            domain={[0, 100]}
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="avg_confidence" 
            fill="#8B5CF6"
            name="Avg Confidence (%)"
            isAnimationActive={true}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Model Count Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {chartData.map((model, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getConfidenceColor(model.avg_confidence) }}
            ></div>
            <span className="text-gray-700">{model.model_used}: {model.avg_confidence.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
