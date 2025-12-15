// AnalyticsTab.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  AccuracyByClassChart,
  AvgConfidenceByItemChart,
  AvgConfidenceHistogram,
  BrandsPieChart,
  FlagFrequencyChart,
  ModelCompareChart,
  DecisionDurationChart,
} from "../../charts/ChartsAnalytics";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle, Clock, Activity, Star, Zap, AlertTriangle } from "lucide-react";
import { COLORS } from "@/constants/colors";

const API_BASE = import.meta.env.VITE_API_URL || "https://web-ai-dashboard.up.railway.app";

/* Card wrapper */
const Card = ({ title, subtitle, children, headerBg = "#F2F7F2", actions }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <div style={{ background: headerBg }} className="px-4 py-3 flex justify-between items-center">
      <div>
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>

      {/* Right-side action buttons */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/* Stat Card */
const StatCard = ({ icon: Icon, title, value, subtitle, color = "green" }) => {
  let bgColorStyle, textColorStyle, borderColorStyle;
  if (color === "green") {
    bgColorStyle = { backgroundColor: COLORS.TINT_10 };
    textColorStyle = { color: COLORS.PRIMARY };
    borderColorStyle = { borderColor: `${COLORS.PRIMARY}30` };
  } else if (color === "red") {
    bgColorStyle = { backgroundColor: "#fef2f2" };
    textColorStyle = { color: "#b91c1c" };
    borderColorStyle = { borderColor: "#fecaca" };
  } else {
    bgColorStyle = { backgroundColor: "#f0f9ff" };
    textColorStyle = { color: "#1e40af" };
    borderColorStyle = { borderColor: "#bfdbfe" };
  }

  const combinedStyle = {
    ...bgColorStyle,
    ...borderColorStyle,
    border: `1px solid`,
    borderRadius: "0.5rem",
    padding: "1rem",
  };

  return (
    <div style={combinedStyle}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">{title}</div>
          <div className="text-3xl font-bold" style={textColorStyle}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        <Icon className="h-6 w-6" style={textColorStyle} />
      </div>
    </div>
  );
};

export default function AnalyticsTab({
  accuracyByClass = [],
  avgConfByItem = [],
  brandsSummary = [],
  modelCompare = [],
  flagFrequency = [],
  decisionDuration = [],
  histogram = [],
}) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real-time trends data
  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      let retries = 0;
      const maxRetries = 2;

      const attemptFetch = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const res = await fetch(`${API_BASE}/ai_dashboard/processing-trends/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (res.status === 404) {
            // Endpoint not available, skip
            setTrends([]);
            return;
          }
          if (res.ok) {
            const data = await res.json();
            setTrends(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          if (err.name === "AbortError") {
            console.warn("Trends fetch timeout");
            if (retries < maxRetries) {
              retries++;
              console.log(`Retrying trends fetch (${retries}/${maxRetries})...`);
              return attemptFetch();
            }
            console.error("Request timeout after retries");
          } else {
            console.error("Error fetching trends:", err);
          }
          setError(err.message);
          setTrends([]);
        }
      };

      await attemptFetch();
      setLoading(false);
    };
    fetchTrends();
  }, []);

  // Calculate insights
  const insights = useMemo(() => {
    const total = (accuracyByClass || []).reduce((s, c) => s + (c.total || 0), 0) || 0;
    const accepted = (accuracyByClass || []).reduce((s, c) => s + (c.accepted || 0), 0) || 0;
    const rejected = (accuracyByClass || []).reduce((s, c) => s + (c.rejected || 0), 0) || 0;
    const flagged = (flagFrequency || []).reduce((s, c) => s + (c.count || 0), 0) || 0;
    const avgConf = (avgConfByItem || []).length > 0
      ? (avgConfByItem.reduce((s, c) => s + (c.avg_conf ?? c.avg_confidence ?? 0), 0) / avgConfByItem.length * 100).toFixed(1)
      : 0;
    const topBrand = (brandsSummary || []).sort((a, b) => b.total - a.total)[0];
    const topModel = (modelCompare || []).sort((a, b) => b.count - a.count)[0];
    const accuracy = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;

    return {
      total,
      accepted,
      rejected,
      flagged,
      avgConf,
      topBrand,
      topModel,
      accuracy,
    };
  }, [accuracyByClass, avgConfByItem, flagFrequency, brandsSummary, modelCompare]);
  
  // -------- EXPORT BUTTON LOGIC ----------
  const exportBrands = () => {
    const header = "brand,last_seen,total\n";

    const rows = brandsSummary
      .map(
        (b) =>
          `${b.brand},${new Date(b.last_seen).toISOString()},${b.total}`
      )
      .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "brands_export.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 font-semibold mb-2">Error Loading Analytics</div>
        <div className="text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model & Mode Information Row */}
      <Card title="Active Configuration" subtitle="Current model and processing mode">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-blue-600 mb-1">MODE USED</div>
            <div className="text-lg font-bold text-blue-900">{insights.topModel?.model_used || "N/A"}</div>
            <div className="text-xs text-blue-700 mt-1">e.g., yolo+classifier</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-purple-600 mb-1">MODEL USED</div>
            <div className="text-lg font-bold text-purple-900">{insights.topModel?.model_used || "N/A"}</div>
            <div className="text-xs text-purple-700 mt-1">Current active model</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-indigo-600 mb-1">PREDICTIONS COUNT</div>
            <div className="text-lg font-bold text-indigo-900">{insights.topModel?.count || 0}</div>
            <div className="text-xs text-indigo-700 mt-1">Total predictions made</div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={CheckCircle}
          title="Overall Accuracy"
          value={`${insights.accuracy}%`}
          subtitle={`${insights.accepted} accepted`}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          title="Flagged Items"
          value={insights.flagged}
          subtitle={`${((insights.flagged / insights.total) * 100).toFixed(1)}% of total`}
          color={insights.flagged > 100 ? "red" : "green"}
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Confidence"
          value={`${insights.avgConf}%`}
          subtitle="Model confidence level"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Total Processed"
          value={insights.total.toLocaleString()}
          subtitle={`${insights.accepted} ✓ ${insights.rejected} ✗`}
          color="blue"
        />
        <StatCard
          icon={Zap}
          title="Acceptance Rate"
          value={`${insights.accuracy}%`}
          subtitle="Success rate"
          color="green"
        />
      </div>

      {/* Processing Trends */}
      {trends.length > 0 && (
        <Card title="Processing Trends" subtitle="Items processed over time">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.PRIMARY} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.TINT_20} />
                <XAxis dataKey="timestamp" stroke="#2d2d2d" tick={{ fontSize: 12 }} />
                <YAxis stroke="#2d2d2d" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.PRIMARY}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Items Processed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Charts for Classes Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Class vs Acceptance Rate" subtitle="Acceptance rate breakdown by item class">
          <div style={{ height: 320 }}>
            <AccuracyByClassChart data={accuracyByClass} />
          </div>
        </Card>

        <Card title="Class vs Average Confidence" subtitle="Average confidence by item class (Plastic, Aluminum, Other, Hand)">
          <div style={{ height: 320 }}>
            <AvgConfidenceByItemChart data={avgConfByItem} />
          </div>
        </Card>
      </div>

      {/* Additional Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Class Prediction vs Verified Accuracy" subtitle="Predicted class vs verified accuracy from flagged items">
          <div style={{ height: 320 }}>
            <AccuracyByClassChart data={accuracyByClass} />
          </div>
        </Card>

        <Card title="Classes vs Flag Type Frequency" subtitle="Flag types by class (Low Confidence, FP, FN)">
          <div style={{ height: 320 }}>
            <FlagFrequencyChart data={flagFrequency} />
          </div>
        </Card>
      </div>

      {/* Brand Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Brand Distribution"
            subtitle={`Top ${Math.min(8, brandsSummary.length)} detected brands`}
            actions={
              <button
                onClick={exportBrands}
                className="px-3 py-1 text-xs text-white rounded transition"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                Export CSV
              </button>
            }
          >
            <div className="flex gap-6">
              {/* Pie Chart */}
              <div style={{ width: "60%" }}>
                <div style={{ height: 360 }}>
                  <BrandsPieChart data={brandsSummary} top={8} />
                </div>
              </div>

              {/* Scrollable List */}
              <div
                style={{ width: "40%", maxHeight: 360 }}
                className="overflow-y-auto pr-2"
              >
                <div className="space-y-3">
                  {(brandsSummary || []).slice(0, 10).map((b, i) => (
                    <div
                      key={b.brand + i}
                      className="flex items-center justify-between border rounded p-3 hover:shadow-sm transition"
                      style={{ background: `linear-gradient(to right, ${COLORS.TINT_10}, white)` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: COLORS.PRIMARY }}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{b.brand}</div>
                          <div className="text-xs text-gray-500">
                            last: {b.last_seen ? new Date(b.last_seen).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                      </div>
                      <Badge className="font-bold" style={{ backgroundColor: COLORS.TINT_10, color: COLORS.PRIMARY }}>{b.total}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Flag Analysis */}
        <div>
          <Card title="Flag Analysis" subtitle="Top flagged issues">
            <div style={{ height: 360 }}>
              <FlagFrequencyChart data={flagFrequency} />
            </div>
          </Card>
        </div>
      </div>

      {/* Model Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Verified Accuracy - Mode Comparison" subtitle="Comparison between yolo only, classifier only, and yolo+classifier">
          <div style={{ height: 300 }}>
            <ModelCompareChart data={modelCompare} />
          </div>
        </Card>

        <Card title="YOLO Model - Verified Accuracy Comparison" subtitle="Current YOLO model vs previous versions">
          <div style={{ height: 300 }}>
            <ModelCompareChart data={modelCompare} />
          </div>
        </Card>

        <Card title="Classifier Model - Verified Accuracy Comparison" subtitle="Current classifier model vs previous versions">
          <div style={{ height: 300 }}>
            <ModelCompareChart data={modelCompare} />
          </div>
        </Card>
      </div>

      {/* Model Performance & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Model Usage Distribution" subtitle="Predictions by model version">
          <div style={{ height: 280 }}>
            <ModelCompareChart data={modelCompare} />
          </div>
        </Card>

        <Card title="Confidence Distribution" subtitle="Bucketed by confidence ranges">
          <div style={{ height: 280 }}>
            <AvgConfidenceHistogram data={avgConfByItem || histogram} />
          </div>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card title="Key Insights" subtitle="Performance summary and recommendations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-blue-600" />
              <div className="font-semibold text-blue-900">Processing Volume</div>
            </div>
            <div className="text-sm text-blue-800">
              Total items processed: <strong>{insights.total.toLocaleString()}</strong>
              {insights.total > 0 && (
                <>
                  <br />
                  Acceptance rate: <strong>{insights.accuracy}%</strong>
                </>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-green-600" />
              <div className="font-semibold text-green-900">Top Performer</div>
            </div>
            <div className="text-sm text-green-800">
              Brand: <strong>{insights.topBrand?.brand || "N/A"}</strong>
              {insights.topBrand && (
                <>
                  <br />
                  Detections: <strong>{insights.topBrand.total}</strong>
                </>
              )}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-purple-600" />
              <div className="font-semibold text-purple-900">Model Status</div>
            </div>
            <div className="text-sm text-purple-800">
              Most used: <strong>{insights.topModel?.model_used || "N/A"}</strong>
              {insights.topModel && (
                <>
                  <br />
                  Predictions: <strong>{insights.topModel.count}</strong>
                </>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-orange-600" />
              <div className="font-semibold text-orange-900">Quality Metrics</div>
            </div>
            <div className="text-sm text-orange-800">
              Avg confidence: <strong>{insights.avgConf}%</strong>
              <br />
              Flagged rate: <strong>{((insights.flagged / insights.total) * 100 || 0).toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}