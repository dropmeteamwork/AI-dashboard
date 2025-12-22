// BrandsAnalyticsTab.jsx - Brand Analytics Dashboard
import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { TrendingUp, Target, AlertTriangle, Eye, Filter } from "lucide-react";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

// Natural colors palette
const COLORS = ["#4CAF50", "#0EA5E9", "#F97316", "#EF4444", "#14B8A6", "#D97706", "#059669"];

// Gradient presets
const gradients = {
  blue: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
  green: "linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)",
  orange: "linear-gradient(135deg, #FFEDD5 0%, #FEF3C7 100%)",
  red: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
};

const borderColors = {
  blue: "#7DD3FC",
  green: "#86EFAC",
  orange: "#FDBA74",
  red: "#FCA5A5",
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, color = "green" }) => {
  const colorMap = {
    green: { bg: gradients.green, border: borderColors.green, value: "#4CAF50" },
    blue: { bg: gradients.blue, border: borderColors.blue, value: "#0EA5E9" },
    orange: { bg: gradients.orange, border: borderColors.orange, value: "#F97316" },
    red: { bg: gradients.red, border: borderColors.red, value: "#EF4444" },
  };
  const c = colorMap[color] || colorMap.green;
  
  return (
    <div className="card-responsive" style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color: c.value, marginBottom: "2px" }}>{value}</div>
      {subtitle && <div style={{ fontSize: "12px", color: "#6b7280" }}>{subtitle}</div>}
    </div>
  );
};

// Flagged Brand Card Component
const FlaggedBrandCard = ({ item }) => {
  const imageUrl = item.image_url || item.image || 
    (item.image_s3_key ? `https://ai-data-001.s3.eu-central-1.amazonaws.com/${item.image_s3_key}` : null);

  return (
    <div className="card-responsive" style={{
      background: "white",
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif",
      padding: 0,
    }}>
      {/* Image */}
      <div style={{ height: "140px", background: "#f3f4f6", position: "relative" }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.brand || "Brand"} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ 
            width: "100%", height: "100%", 
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#9ca3af"
          }}>
            <Eye style={{ width: 28, height: 28 }} />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
          {item.brand || item.best_match || "Unknown"}
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
          Confidence: {((item.confidence || 0) * 100).toFixed(1)}%
        </div>
        {item.flag && (
          <span style={{
            display: "inline-block",
            padding: "2px 6px",
            background: "#FEF3C7",
            color: "#D97706",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "500",
          }}>
            {item.flag}
          </span>
        )}
      </div>
    </div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontWeight: "600", marginBottom: "4px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: "13px" }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function BrandsAnalyticsTab() {
  const [brandPredictions, setBrandPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Fetch brand predictions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Same endpoint as BrandsTab
        const res = await fetch(`${API_BASE}/ai_dashboard/brand-predictions/`);
        console.log("BrandsAnalyticsTab - Response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        
        const data = await res.json();
        console.log("BrandsAnalyticsTab - Raw response type:", typeof data, Array.isArray(data));
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          items = data.data;
        }
        
        console.log("BrandsAnalyticsTab - Items count:", items.length);
        if (items.length > 0) {
          console.log("BrandsAnalyticsTab - Sample item keys:", Object.keys(items[0]));
        }
        
        setBrandPredictions(items);
      } catch (err) {
        console.error("BrandsAnalyticsTab - Error fetching brand predictions:", err);
        setBrandPredictions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!brandPredictions.length) return null;

    // Brand frequency
    const brandCounts = {};
    const flaggedItems = [];

    brandPredictions.forEach(item => {
      const brand = item.brand || item.best_match || "unknown";
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      
      // Use is_flagged from API
      if (item.is_flagged) {
        flaggedItems.push(item);
      }
    });

    // Brand frequency chart data
    const frequencyData = Object.entries(brandCounts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Verified accuracy (non-flagged / total)
    const nonFlagged = brandPredictions.filter(p => !p.is_flagged).length;
    const verifiedAccuracy = ((nonFlagged / brandPredictions.length) * 100).toFixed(1);

    // Accuracy by brand (based on flagged status)
    const accuracyByBrand = Object.entries(brandCounts).map(([brand, total]) => {
      const brandItems = brandPredictions.filter(p => p.brand === brand);
      const nonFlaggedBrand = brandItems.filter(p => !p.is_flagged).length;
      return {
        brand,
        accuracy: total > 0 ? ((nonFlaggedBrand / total) * 100) : 0,
      };
    }).sort((a, b) => b.accuracy - a.accuracy).slice(0, 10);

    return {
      totalPredictions: brandPredictions.length,
      uniqueBrands: Object.keys(brandCounts).length,
      verifiedAccuracy,
      flaggedCount: flaggedItems.length,
      flaggedItems,
      frequencyData,
      accuracyByBrand,
    };
  }, [brandPredictions]);

  // Filter flagged items
  const filteredFlagged = useMemo(() => {
    if (!analytics?.flaggedItems) return [];
    if (selectedFilter === "all") return analytics.flaggedItems;
    return analytics.flaggedItems.filter(item => 
      (item.brand || item.best_match || "").toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [analytics, selectedFilter]);

  // Get unique brands for filter (from all items, not just flagged)
  const uniqueBrands = useMemo(() => {
    if (!brandPredictions.length) return [];
    const brands = new Set(brandPredictions.map(i => i.brand || i.best_match || "unknown"));
    return Array.from(brands).slice(0, 20); // Limit to 20 for filter chips
  }, [brandPredictions]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#4CAF50", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          Loading brand analytics...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
        No brand data available
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Outfit', sans-serif" }}>
      {/* KPI Cards - Using responsive grid */}
      <div className="kpi-grid">
        <StatCard 
          title="Total Predictions" 
          value={analytics.totalPredictions.toLocaleString()} 
          subtitle="brand detections" 
          color="green" 
        />
        <StatCard 
          title="Unique Brands" 
          value={analytics.uniqueBrands} 
          subtitle="different brands" 
          color="blue" 
        />
        <StatCard 
          title="Verified Accuracy" 
          value={`${analytics.verifiedAccuracy}%`} 
          subtitle="non-flagged items" 
          color="green" 
        />
        <StatCard 
          title="Flagged Items" 
          value={analytics.flaggedCount} 
          subtitle="needs review" 
          color="orange" 
        />
      </div>

      {/* Charts Row - Responsive */}
      <div className="charts-grid">
        {/* Brand vs Frequency Chart */}
        <div className="card-responsive" style={{ background: "white", border: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Brand Prediction Frequency
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.frequencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis dataKey="brand" type="category" stroke="#6b7280" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4CAF50" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand vs Verified Accuracy Chart */}
        <div className="card-responsive" style={{ background: "white", border: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Brand Verified Accuracy
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.accuracyByBrand} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="brand" type="category" stroke="#6b7280" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" fill="#0EA5E9" radius={[0, 4, 4, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flagged Brands Section */}
      <div className="card-responsive" style={{ background: "white", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              Flagged Brands Overview
            </h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              Items that have been flagged for review
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter style={{ width: 16, height: 16, color: "#6b7280" }} />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
                color: "#374151",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredFlagged.length > 0 ? (
          <div className="cards-grid">
            {filteredFlagged.slice(0, 12).map((item, idx) => (
              <FlaggedBrandCard key={idx} item={item} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
            No flagged items found
          </div>
        )}
      </div>
    </div>
  );
}
