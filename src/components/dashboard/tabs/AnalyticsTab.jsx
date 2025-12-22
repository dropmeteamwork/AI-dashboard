// AnalyticsTab.jsx - Matching RVM Dashboard Style
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
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertCircle, CheckCircle, Clock, Activity, Star, Zap, AlertTriangle } from "lucide-react";
import { COLORS } from "@/constants/colors";
import ChartCard from "../ChartCard";

const API_BASE = import.meta.env.VITE_API_URL || "https://web-ai-dashboard.up.railway.app";

// Gradient presets - Mixed colors like RVM dashboard
const gradients = {
  blue: "linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)",
  green: "linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)",
  purple: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)",
  pink: "linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)",
  orange: "linear-gradient(135deg, #FFEDD5 0%, #FEF3C7 100%)",
  cyan: "linear-gradient(135deg, #CFFAFE 0%, #E0F7FA 100%)",
};

const borderColors = {
  blue: "#93C5FD",
  green: "#86EFAC",
  purple: "#C4B5FD",
  pink: "#F9A8D4",
  orange: "#FDBA74",
  cyan: "#67E8F9",
};

/* Card wrapper - Matching RVM Dashboard Style */
const Card = ({ title, subtitle, children, headerBg = "transparent", actions }) => (
  <div 
    style={{
      background: "white",
      border: "1px solid #E5E7EB",
      borderRadius: "16px",
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    <div style={{ 
      padding: "20px 24px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      borderBottom: "1px solid #F3F4F6",
    }}>
      <div>
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{actions}</div>}
    </div>
    <div style={{ padding: "24px" }}>{children}</div>
  </div>
);

/* Stat Card - Mixed colors KPI Style */
const StatCard = ({ icon: Icon, title, value, subtitle, color = "green", trend, trendValue }) => {
  const colorMap = {
    green: { bg: "green", value: "#4CAF50" },
    red: { bg: "pink", value: "#EF4444" },
    blue: { bg: "blue", value: "#3B82F6" },
    purple: { bg: "purple", value: "#8B5CF6" },
    orange: { bg: "orange", value: "#F59E0B" },
  };
  
  const colorConfig = colorMap[color] || colorMap.green;
  
  return (
    <div 
      style={{
        background: gradients[colorConfig.bg],
        border: `1px solid ${borderColors[colorConfig.bg]}`,
        borderRadius: "16px",
        padding: "20px 24px",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px" }}>
        {title}
      </div>
      <div style={{ fontSize: "32px", fontWeight: "700", color: colorConfig.value, marginBottom: "8px" }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: "13px", color: "#6b7280" }}>{subtitle}</div>
      )}
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
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/ai_dashboard/processing-trends/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        console.error("Error fetching trends:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
      <div style={{ padding: "24px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px" }}>
        <div style={{ color: "#991B1B", fontWeight: "600", marginBottom: "8px" }}>Error Loading Analytics</div>
        <div style={{ color: "#B91C1C", fontSize: "14px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Key Metrics Row - Responsive */}
      <div className="kpi-grid">
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
          color={insights.flagged > 100 ? "red" : "orange"}
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
      </div>

      {/* Processing Trends */}
      {trends.length > 0 && (
        <Card title="Processing Trends" subtitle="Items processed over time">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="timestamp" stroke="#6b7280" tick={{ fontSize: 11, fontFamily: "'Outfit', sans-serif" }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11, fontFamily: "'Outfit', sans-serif" }} />
                <Tooltip 
                  contentStyle={{ 
                    background: "#fff", 
                    border: "1px solid #E5E7EB", 
                    borderRadius: "12px",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4CAF50"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Items Processed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top row - Responsive charts grid */}
      <div className="charts-grid">
        <Card title="Classification Distribution" subtitle="Accepted vs Rejected by item class">
          <div className="chart-container">
            <AccuracyByClassChart data={accuracyByClass} />
          </div>
        </Card>

        <Card title="Model Confidence by Item" subtitle="Average confidence score per item">
          <div className="chart-container">
            <AvgConfidenceByItemChart data={avgConfByItem} />
          </div>
        </Card>
      </div>

      {/* Brand Summary - Responsive */}
      <div className="charts-grid">
        <Card
          title="Brand Distribution"
          subtitle={`Top ${Math.min(8, brandsSummary.length)} detected brands`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Pie Chart */}
            <div className="chart-container">
              <BrandsPieChart data={brandsSummary} top={8} />
            </div>
          </div>
        </Card>

        {/* Scrollable List - Now in separate card */}
        <Card title="Top Brands" subtitle="Brand ranking by count">
          <div style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(brandsSummary || []).slice(0, 10).map((b, i) => (
                <div
                  key={b.brand + i}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      color: "white", 
                      fontWeight: "700", 
                      fontSize: "12px",
                      backgroundColor: "#4CAF50",
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{b.brand}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        last: {b.last_seen ? new Date(b.last_seen).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: "#E8F5E9", 
                    color: "#4CAF50", 
                    padding: "3px 10px", 
                    borderRadius: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}>
                    {b.total}
                  </div>
                </div>
                ))}
              </div>
            </div>
          </Card>

        {/* Flag Analysis */}
        <Card title="Flag Analysis" subtitle="Top flagged issues">
          <div className="chart-container">
            <FlagFrequencyChart data={flagFrequency} />
          </div>
        </Card>
      </div>

      {/* Model Performance - Responsive */}
      <div className="charts-grid">
        <Card title="Model Usage" subtitle="Predictions by model version">
          <div className="chart-container">
            <ModelCompareChart data={modelCompare} />
          </div>
        </Card>

        <Card title="Confidence Distribution" subtitle="Bucketed by confidence ranges">
          <div className="chart-container">
            <AvgConfidenceHistogram data={histogram} />
          </div>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card title="Key Insights" subtitle="Performance summary and recommendations">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div style={{ 
            background: gradients.blue, 
            border: `1px solid ${borderColors.blue}`, 
            borderRadius: "12px", 
            padding: "16px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Activity size={18} style={{ color: "#4CAF50" }} />
              <div style={{ fontWeight: "600", color: "#2E7D32" }}>Processing Volume</div>
            </div>
            <div style={{ fontSize: "14px", color: "#1B5E20" }}>
              Total items processed: <strong>{insights.total.toLocaleString()}</strong>
              {insights.total > 0 && (
                <>
                  <br />
                  Acceptance rate: <strong>{insights.accuracy}%</strong>
                </>
              )}
            </div>
          </div>

          <div style={{ 
            background: gradients.green, 
            border: `1px solid ${borderColors.green}`, 
            borderRadius: "12px", 
            padding: "16px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Star size={18} style={{ color: "#4CAF50" }} />
              <div style={{ fontWeight: "600", color: "#166534" }}>Top Performer</div>
            </div>
            <div style={{ fontSize: "14px", color: "#14532D" }}>
              Brand: <strong>{insights.topBrand?.brand || "N/A"}</strong>
              {insights.topBrand && (
                <>
                  <br />
                  Detections: <strong>{insights.topBrand.total}</strong>
                </>
              )}
            </div>
          </div>

          <div style={{ 
            background: gradients.purple, 
            border: `1px solid ${borderColors.purple}`, 
            borderRadius: "12px", 
            padding: "16px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Zap size={18} style={{ color: "#4CAF50" }} />
              <div style={{ fontWeight: "600", color: "#2E7D32" }}>Model Status</div>
            </div>
            <div style={{ fontSize: "14px", color: "#1B5E20" }}>
              Most used: <strong>{insights.topModel?.model_used || "N/A"}</strong>
              {insights.topModel && (
                <>
                  <br />
                  Predictions: <strong>{insights.topModel.count}</strong>
                </>
              )}
            </div>
          </div>

          <div style={{ 
            background: gradients.orange, 
            border: `1px solid ${borderColors.orange}`, 
            borderRadius: "12px", 
            padding: "16px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <AlertTriangle size={18} style={{ color: "#4CAF50" }} />
              <div style={{ fontWeight: "600", color: "#2E7D32" }}>Quality Metrics</div>
            </div>
            <div style={{ fontSize: "14px", color: "#1B5E20" }}>
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