// AnalyticsTab.jsx
import React, { useState, useEffect } from "react";
import {
  AccuracyByClassChart,
  AvgConfidenceByItemChart,
  AvgConfidenceHistogram,
  BrandsPieChart,
  FlagFrequencyChart,
  ModelCompareChart,
  DecisionDurationChart,
} from "../../charts/ChartsAnalytics";

/* Card wrapper */
const Card = ({ title, subtitle, children, headerBg = "#F2F7F2", actions }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <div style={{ background: headerBg }} className="px-4 py-3 flex justify-between items-center">
      <div>
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default function AnalyticsTab({
  accuracyByClass = [],
  avgConfByItem = [],
  modelCompare = [],
  flagFrequency = [],
  decisionDuration = [],
  histogram = [],
}) {
  const [brandsSummary, setBrandsSummary] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsError, setBrandsError] = useState(null);

  // Fetch brands summary
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("https://web-ai-dashboard.up.railway.app/ai_dashboard/brand-predictions/");
        const data = await res.json();
        setBrandsSummary(data);
      } catch (err) {
        console.error("Brands fetch error:", err);
        setBrandsError(err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Export CSV
  const exportBrands = () => {
    if (!brandsSummary || brandsSummary.length === 0) return;
    const header = "brand,last_seen,total\n";
    const rows = brandsSummary
      .map(b => `${b.brand},${new Date(b.last_seen).toISOString()},${b.total}`)
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

  return (
    <div className="space-y-6">

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Classification Distribution" subtitle="Breakdown by class">
          <div style={{ height: 320 }}>
            <AccuracyByClassChart data={accuracyByClass} />
          </div>
        </Card>

        <Card title="Avg Confidence by Item" subtitle="Model confidence per item">
          <div style={{ height: 320 }}>
            <AvgConfidenceByItemChart data={avgConfByItem} />
          </div>
        </Card>
      </div>

      {/* Brand Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Brand Summary"
            subtitle="Top detected brands (last seen)"
            actions={
              <button
                onClick={exportBrands}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            }
          >
            {loadingBrands ? (
              <div className="text-gray-500 text-center py-20">Loading brands...</div>
            ) : brandsError ? (
              <div className="text-red-500 text-center py-20">Failed to load brands</div>
            ) : brandsSummary.length === 0 ? (
              <div className="text-gray-500 text-center py-20">No brand data</div>
            ) : (
              <div className="flex gap-6">
                {/* Pie Chart */}
                <div style={{ width: "60%" }}>
                  <div style={{ height: 360 }}>
                    <BrandsPieChart data={brandsSummary} top={8} />
                  </div>
                </div>

                {/* Scrollable List */}
                <div style={{ width: "40%", maxHeight: 360 }} className="overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {brandsSummary.map((b, i) => (
                      <div key={b.brand + i} className="flex items-center justify-between bg-white border rounded p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-green-700 font-semibold">
                            {String(b.brand).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{b.brand}</div>
                            <div className="text-xs text-gray-400">
                              last seen: {new Date(b.last_seen).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">{b.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Flag Frequency */}
        <div>
          <Card title="Flag Frequency" subtitle="Top flags">
            <div style={{ height: 320 }}>
              <FlagFrequencyChart data={flagFrequency} />
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card title="Model Compare">
            <div style={{ height: 280 }}>
              <ModelCompareChart data={modelCompare} />
            </div>
          </Card>
        </div>

        <div>
          <Card title="Confidence Score Distribution">
            <div style={{ height: 280 }}>
              <AvgConfidenceHistogram data={histogram} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Decision Duration by Item">
          <div style={{ height: 260 }}>
            <DecisionDurationChart data={decisionDuration} />
          </div>
        </Card>

        <Card title="Accuracy by Class (compact)">
          <div style={{ height: 260 }}>
            <AccuracyByClassChart data={accuracyByClass} />
          </div>
        </Card>
      </div>
    </div>
  );
}
