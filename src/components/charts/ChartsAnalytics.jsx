// ChartsAnalytics.jsx
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

/* Palette from your screenshot */
const COLORS = [
  "#6CC04A",
  "#7DCA64",
  "#8ED47D",
  "#9EDD97",
  "#AEE7B0",
  "#BEF1CA",
  "#CEFAE3",
  "#DEFFE0",
  "#EEFFED",
];

const GREEN = "#6CC04A";
const DARK_GREEN = "#5BA63E";
const GREEN_GRID = "#6CC04A22";
const AXIS = "#2d2d2d";
const RED = "#ef4444";
const BLUE = "#3b82f6";

/* Enhanced tooltip with better styling */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="p-3 rounded-lg shadow-lg bg-white border border-gray-200 text-sm">
      <div className="font-bold text-gray-900 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-700">
          <div style={{ width: 10, height: 10, background: p.color, borderRadius: "2px" }} />
          <div>{p.name}: <span className="font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span></div>
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

  if (!chartData.length) return <div className="p-4 text-gray-500">No classification data available</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="acceptedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.9} />
            <stop offset="100%" stopColor={DARK_GREEN} stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RED} stopOpacity={0.9} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={false} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="accepted" stackId="a" name="✓ Accepted" fill="url(#acceptedGrad)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="rejected" stackId="a" name="✗ Rejected" fill="url(#rejectedGrad)" radius={[6, 6, 0, 0]} />
        <Line type="monotone" dataKey="accuracy" stroke={BLUE} strokeWidth={2} name="Accuracy %" dot={{ r: 4 }} yAxisId="right" />
        <YAxis yAxisId="right" stroke={BLUE} tick={{ fontSize: 12 }} unit="%" orientation="right" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/* -------------------------------------------------------------------------- */
/* Avg Confidence By Item — enhanced with gradient colors and trends         */
/* -------------------------------------------------------------------------- */
export const AvgConfidenceByItemChart = ({ data = [] }) => {
  const chartData = (data || [])
    .map((d) => ({
      item: d.item || "Unknown",
      avg_conf: Math.min(100, Math.max(0, (d.avg_conf ?? d.avg_confidence ?? 0) * 100)),
      status: (d.avg_conf ?? d.avg_confidence ?? 0) * 100 >= 80 ? "High" : 
              (d.avg_conf ?? d.avg_confidence ?? 0) * 100 >= 60 ? "Good" : "Low",
    }))
    .sort((a, b) => b.avg_conf - a.avg_conf);

  if (!chartData.length) return <div className="p-4 text-gray-500">No confidence data available</div>;

  // Color based on confidence level
  const getColor = (value) => {
    if (value >= 80) return "#6CC04A"; // bright green
    if (value >= 60) return "#8ED47D"; // light green
    if (value >= 40) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <defs>
          <linearGradient id="confGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6CC04A" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#5BA63E" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="confGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#65a30d" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_GRID} vertical={false} />
        <XAxis dataKey="item" stroke={AXIS} tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke={AXIS} tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value) => `${value.toFixed(2)}%`}
        />
        <Bar dataKey="avg_conf" name="Confidence Level (%)" radius={[6, 6, 0, 0]} animationDuration={800}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.avg_conf)} />
          ))}
        </Bar>
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
        <YAxis yAxisId="right" orientation="right" stroke={BLUE} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="count" yAxisId="left" name="Prediction Count" fill={GREEN} radius={[6, 6, 0, 0]} />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="percent" 
          stroke={RED} 
          strokeWidth={2.5} 
          name="Usage %" 
          dot={{ r: 4, fill: RED }}
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
/* Brands Pie Chart — enhanced with better labels and interactivity          */
/* -------------------------------------------------------------------------- */
export const BrandsPieChart = ({ data = [], top = 8 }) => {
  if (!data?.length) return <div className="p-4 text-gray-500">No brand data available</div>;

  // Sort & take top N
  const sorted = data.slice().sort((a, b) => b.total - a.total).slice(0, top);

  // Total for percentage calculation
  const total = sorted.reduce((acc, item) => acc + (item.total || 0), 0) || 1;

  // Prepare pie data
  const chartData = sorted.map((b) => ({
    name: b.brand,
    value: b.total,
    percent: ((b.total / total) * 100).toFixed(1),
  }));

  const renderCustomLabel = ({ name, percent }) => {
    return `${name} ${percent}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
          innerRadius={50}
          paddingAngle={3}
          label={renderCustomLabel}
          labelLine={true}
          animationDuration={800}
        >
          {chartData.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Legend 
          verticalAlign="bottom" 
          height={32} 
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value, entry) => `${value} (${entry.payload.percent}%)`}
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
        <Radar name="Volume (norm)" dataKey="volume" stroke={BLUE} fillOpacity={0.3} />
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


