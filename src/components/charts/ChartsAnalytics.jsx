// ChartsAnalytics.jsx - Matching RVM Dashboard Style
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
  ComposedChart,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";

/* Palette - Natural colors without purple */
const COLORS = [
  "#0EA5E9", // Ocean Blue
  "#4CAF50", // Green
  "#F97316", // Coral/Orange
  "#14B8A6", // Teal
  "#EF4444", // Red
  "#D97706", // Sand/Amber
  "#059669", // Forest/Emerald
  "#0891B2", // Cyan
  "#EA580C", // Deep Coral
];

const GREEN = "#4CAF50";
const DARK_GREEN = "#2E7D32";
const GREEN_GRID = "#E5E7EB";
const AXIS = "#6b7280";
const OCEAN_BLUE = "#0EA5E9";
const CORAL = "#F97316";
const BLUE = "#0EA5E9";

/* Enhanced tooltip with RVM styling */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      padding: "12px 16px",
      borderRadius: "12px",
      background: "white",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontWeight: "600", color: "#111827", marginBottom: "8px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#374151", fontSize: "14px", marginBottom: "4px" }}>
          <div style={{ width: 10, height: 10, background: p.color, borderRadius: "4px" }} />
          <div>{p.name}: <span style={{ fontWeight: "600" }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span></div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Classification Distribution — enhanced stacked chart with percentages      */
/* -------------------------------------------------------------------------- */
export const AccuracyByClassChart = ({ data = [] }) => {
  const chartData = (data || []).map((d) => ({
    item: d.item || "Unknown",
    accepted: d.accepted || 0,
    rejected: d.rejected || 0,
    total: d.total || (d.accepted || 0) + (d.rejected || 0),
    accuracy: d.total > 0 ? ((d.accepted || 0) / d.total * 100).toFixed(1) : 0,
  })).sort((a, b) => b.total - a.total);

  if (!chartData.length) return <div style={{ padding: "16px", color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>No classification data available</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="acceptedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.9} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={false} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 11, fontFamily: "'Outfit', sans-serif" }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px", fontFamily: "'Outfit', sans-serif" }} />
        <Bar dataKey="accepted" stackId="a" name="✓ Accepted" fill="url(#acceptedGrad)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="rejected" stackId="a" name="✗ Rejected" fill="url(#rejectedGrad)" radius={[6, 6, 0, 0]} />
        <Line type="monotone" dataKey="accuracy" stroke={BLUE} strokeWidth={2} name="Accuracy %" dot={{ r: 4 }} yAxisId="right" />
        <YAxis yAxisId="right" stroke={BLUE} tick={{ fontSize: 12 }} unit="%" orientation="right" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence By Item — Ocean Blue bars                                   */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceByItemChart = ({ data = [] }) => {
  const chartData = (data || [])
    .map((d) => ({
      item: d.item || "Unknown",
      avg_conf: Math.min(100, Math.max(0, (d.avg_conf ?? d.avg_confidence ?? 0) * 100)),
    }))
    .sort((a, b) => b.avg_conf - a.avg_conf);

  if (!chartData.length) return <div style={{ padding: "16px", color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>No confidence data available</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis 
          dataKey="item" 
          stroke="#6b7280" 
          tick={{ fontSize: 11, fontFamily: "'Outfit', sans-serif" }} 
          angle={-45} 
          textAnchor="end" 
          height={80} 
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }} 
          domain={[0, 100]} 
          label={{ 
            value: 'Confidence %', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontFamily: "'Outfit', sans-serif", fontSize: "12px", fill: "#6b7280" }
          }}
        />
        <Tooltip content={<CustomTooltip />} formatter={(value) => `${value.toFixed(2)}%`} />
        <Legend 
          wrapperStyle={{ paddingTop: "16px", fontFamily: "'Outfit', sans-serif" }}
          formatter={() => <span style={{ color: "#0EA5E9", fontSize: "14px" }}>Confidence Level</span>}
        />
        <Bar 
          dataKey="avg_conf" 
          name="Confidence Level (%)" 
          fill="#0EA5E9" 
          radius={[4, 4, 0, 0]} 
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence Histogram — enhanced area chart with risk levels            */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceHistogram = ({ data = [] }) => {
  if (!data?.length) return <div className="p-4 text-gray-500">No confidence data available</div>;

  // Create 5 buckets: 0-19, 20-39, 40-59, 60-79, 80-100
  const buckets = [
    { name: "0-19%\n(Very Low)", count: 0, risk: "Critical" },
    { name: "20-39%\n(Low)", count: 0, risk: "High" },
    { name: "40-59%\n(Medium)", count: 0, risk: "Medium" },
    { name: "60-79%\n(High)", count: 0, risk: "Low" },
    { name: "80-100%\n(Very High)", count: 0, risk: "Excellent" },
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

  const bucketColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={buckets} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.8} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={false} />
        <XAxis dataKey="name" stroke={AXIS} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={GREEN}
          fill="url(#areaGrad)"
          strokeWidth={3}
          dot={{ r: 5, fill: GREEN }}
          name="Items Count"
        />
        <Bar dataKey="count" name="Count" fill={GREEN} opacity={0.6} radius={[6, 6, 0, 0]}>
          {buckets.map((_, i) => (
            <Cell key={i} fill={bucketColors[i]} />
          ))}
        </Bar>
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Flag Frequency — enhanced horizontal bar chart with top priorities         */
/* -------------------------------------------------------------------------- */
export const FlagFrequencyChart = ({ data = [] }) => {
  const chartData = (data || [])
    .map((d) => ({
      flag: d.flag || "Unknown",
      count: d.count || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (!chartData.length) return <div className="p-4 text-gray-500">No flag data available</div>;

  // High to low severity colors
  const total = chartData.reduce((s, c) => s + c.count, 0);
  const flagColors = chartData.map((_, i) => {
    const severity = i / chartData.length;
    if (severity < 0.3) return "#dc2626"; // red - high priority
    if (severity < 0.6) return "#f97316"; // orange - medium
    return "#eab308"; // yellow - low
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 100, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={true} />
        <XAxis type="number" stroke={AXIS} tick={{ fontSize: 12 }} />
        <YAxis dataKey="flag" type="category" stroke={AXIS} tick={{ fontSize: 11 }} width={95} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Flag Count" radius={[0, 6, 6, 0]} animationDuration={800}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={flagColors[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Model Compare — enhanced with usage % and performance ranking              */
/* -------------------------------------------------------------------------- */
export const ModelCompareChart = ({ data = [] }) => {
  const chartData = (data || [])
    .map((d) => ({
      model: d.model_used || "Unknown",
      count: d.count || 0,
    }))
    .sort((a, b) => b.count - a.count);

  if (!chartData.length) return <div className="p-4 text-gray-500">No model data available</div>;

  const total = chartData.reduce((s, c) => s + c.count, 0);
  const dataWithPercent = chartData.map((d) => ({
    ...d,
    percent: total > 0 ? ((d.count / total) * 100).toFixed(1) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={dataWithPercent} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={false} />
        <XAxis dataKey="model" stroke={AXIS} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" stroke={DARK_GREEN} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="count" yAxisId="left" name="Prediction Count" fill={GREEN} radius={[6, 6, 0, 0]} />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="percent" 
          stroke={DARK_GREEN} 
          strokeWidth={2.5} 
          name="Usage %" 
          dot={{ r: 4, fill: DARK_GREEN }}
        />
      </ComposedChart>
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
/* Brands Pie Chart — RVM Style with Blue/Pink colors and outside labels     */
/* -------------------------------------------------------------------------- */
export const BrandsPieChart = ({ data = [], top = 8 }) => {
  if (!data?.length) return <div style={{ padding: "16px", color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>No brand data available</div>;

  // Sort & take top N
  const sorted = data.slice().sort((a, b) => b.total - a.total).slice(0, top);

  // Total for percentage calculation
  const total = sorted.reduce((acc, item) => acc + (item.total || 0), 0) || 1;

  // Natural colors for pie charts (no purple)
  const RVM_COLORS = ["#0EA5E9", "#4CAF50", "#F97316", "#14B8A6", "#EF4444", "#D97706", "#059669", "#0891B2"];

  // Prepare pie data
  const chartData = sorted.map((b) => ({
    name: b.brand,
    value: b.total,
    percent: ((b.total / total) * 100).toFixed(2),
  }));

  // Custom label with color and percentage outside the pie
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent, fill }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={fill}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontFamily: "'Outfit', sans-serif", fontSize: "13px", fontWeight: "500" }}
      >
        {`${name}: ${percent}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={0}
          paddingAngle={1}
          label={renderCustomLabel}
          labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
          animationDuration={800}
        >
          {chartData.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={RVM_COLORS[i % RVM_COLORS.length]} />
          ))}
        </Pie>

        <Legend 
          verticalAlign="bottom" 
          height={40} 
          wrapperStyle={{ paddingTop: "20px", fontFamily: "'Outfit', sans-serif" }}
          formatter={(value) => <span style={{ color: "#374151", fontSize: "14px" }}>{value}</span>}
        />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => [`${value} items`, "Count"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Ocean Blue Bar Chart with clean styling                                    */
/* -------------------------------------------------------------------------- */
export const RVMBarChart = ({ data = [], dataKey = "value", xKey = "name", title = "" }) => {
  if (!data?.length) return <div style={{ padding: "16px", color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} horizontal={true} />
        <XAxis 
          dataKey={xKey} 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }} 
          axisLine={{ stroke: "#E5E7EB" }}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }}
          axisLine={{ stroke: "#E5E7EB" }}
          label={{ 
            value: title, 
            angle: -90, 
            position: 'insideLeft',
            style: { fontFamily: "'Outfit', sans-serif", fontSize: "12px", fill: "#6b7280" }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: "16px", fontFamily: "'Outfit', sans-serif" }}
          formatter={(value) => <span style={{ color: "#0EA5E9", fontSize: "14px" }}>{value}</span>}
        />
        <Bar 
          dataKey={dataKey} 
          name={title || dataKey}
          fill="#0EA5E9" 
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Performance Radar Chart — multi-dimensional analysis                       */
/* -------------------------------------------------------------------------- */
export const PerformanceRadarChart = ({ data = [] }) => {
  if (!data?.length) return <div className="p-4 text-gray-500">No performance data available</div>;

  const chartData = (data || []).map((d) => ({
    category: d.item || "Unknown",
    accuracy: d.accepted && d.total ? ((d.accepted / d.total) * 100).toFixed(0) : 0,
    volume: Math.min(100, (d.total || 0) / 10),
    confidence: d.avg_confidence ? Math.min(100, d.avg_confidence * 100) : 0,
  })).slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={chartData} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
        <PolarGrid stroke={GREEN_GRID} />
        <PolarAngleAxis dataKey="category" stroke={AXIS} tick={{ fontSize: 11 }} />
        <PolarRadiusAxis stroke={AXIS} tick={{ fontSize: 11 }} angle={90} domain={[0, 100]} />
        <Radar name="Accuracy %" dataKey="accuracy" stroke={GREEN} fill={GREEN} fillOpacity={0.5} />
        <Radar name="Volume (norm)" dataKey="volume" stroke={DARK_GREEN} fillOpacity={0.3} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Quality Score Matrix — scatter plot for detailed analysis                  */
/* -------------------------------------------------------------------------- */
export const QualityScoreMatrix = ({ data = [] }) => {
  if (!data?.length) return <div className="p-4 text-gray-500">No quality data available</div>;

  const chartData = (data || []).map((d) => ({
    name: d.item || "Unknown",
    confidence: d.avg_confidence ? d.avg_confidence * 100 : 0,
    volume: d.total || 0,
    accuracy: d.total > 0 ? ((d.accepted || 0) / d.total * 100) : 0,
  })).slice(0, 15);

  const maxVolume = Math.max(...chartData.map(d => d.volume), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} />
        <XAxis dataKey="confidence" name="Confidence %" stroke={AXIS} tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
        <YAxis dataKey="accuracy" name="Accuracy %" stroke={AXIS} tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Scatter 
          name="Items" 
          data={chartData} 
          fill={GREEN}
          fillOpacity={0.7}
          onClick={(data) => console.log("Clicked:", data)}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};


