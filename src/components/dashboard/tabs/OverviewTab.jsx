import React, { useState, useEffect, useMemo } from "react";
import { Activity, Filter, Clock, AlertTriangle, Cpu, Zap } from "lucide-react";
import KPI from "../KPI";
import ChartCard from "../ChartCard";
import StatCard from "../StatCard";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

const OverviewTab = ({ overview, topModel, machines = [] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [predictions, setPredictions] = useState([]);
  const [fetchedPredictions, setFetchedPredictions] = useState(false);

  // Fetch predictions data for additional metrics
  useEffect(() => {
    if (fetchedPredictions) return;
    const fetchPredictions = async () => {
      try {
        const res = await fetch(`${API_BASE}/ai_dashboard/predictions/?page_size=1000`);
        const data = await res.json();
        setPredictions(data.results || data || []);
        setFetchedPredictions(true);
      } catch (err) {
        console.error("Error fetching predictions:", err);
      }
    };
    fetchPredictions();
  }, [fetchedPredictions]);

  // Get unique machine names
  const machineNames = useMemo(() => {
    const names = new Set();
    predictions.forEach(p => {
      if (p.machine_name) names.add(p.machine_name);
    });
    machines.forEach(m => {
      if (m.machine_name) names.add(m.machine_name);
    });
    return Array.from(names);
  }, [predictions, machines]);

  // Filter predictions by selected machine
  const filteredPredictions = useMemo(() => {
    if (selectedMachine === "all") return predictions;
    return predictions.filter(p => p.machine_name === selectedMachine);
  }, [predictions, selectedMachine]);

  // Calculate stats based on filtered predictions
  const stats = useMemo(() => {
    // Use filtered predictions if available, otherwise use overview
    if (filteredPredictions.length > 0 && selectedMachine !== "all") {
      const total = filteredPredictions.length;
      const accepted = filteredPredictions.filter(p => p.decision === "ACCEPTED").length;
      const rejected = filteredPredictions.filter(p => p.decision === "REJECTED").length;
      const flagged = filteredPredictions.filter(p => p.flag_type || p.flagged).length;
      const avgConf = filteredPredictions.reduce((sum, p) => sum + (p.yolo_confidence || p.confidence || 0), 0) / total;
      
      // Calculate avg decision duration from metadata
      const durationsMs = filteredPredictions
        .filter(p => p.metadata?.timings?.total_ms)
        .map(p => p.metadata.timings.total_ms);
      const avgDuration = durationsMs.length > 0 
        ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length)
        : 0;

      // Count edge cases
      const edgeCases = filteredPredictions.filter(p => 
        p.flag_type === "edge_case" || p.flag_type === "edge case"
      ).length;

      // Get mode and model info
      const modes = {};
      const yoloModels = {};
      const classifierModels = {};
      filteredPredictions.forEach(p => {
        if (p.operation_mode) modes[p.operation_mode] = (modes[p.operation_mode] || 0) + 1;
        if (p.yolo_model) yoloModels[p.yolo_model] = (yoloModels[p.yolo_model] || 0) + 1;
        if (p.classifier_model) classifierModels[p.classifier_model] = (classifierModels[p.classifier_model] || 0) + 1;
      });
      const topMode = Object.entries(modes).sort((a, b) => b[1] - a[1])[0];
      const topYoloModel = Object.entries(yoloModels).sort((a, b) => b[1] - a[1])[0];
      const topClassifierModel = Object.entries(classifierModels).sort((a, b) => b[1] - a[1])[0];

      return {
        totalItems: total,
        accepted,
        rejected,
        flagged,
        avgConfidence: (avgConf * 100).toFixed(1),
        acceptanceRate: total > 0 ? ((accepted / total) * 100).toFixed(1) : 0,
        rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : 0,
        flagRate: total > 0 ? ((flagged / total) * 100).toFixed(1) : 0,
        avgDecisionDuration: avgDuration,
        edgeCases,
        modeUsed: topMode ? topMode[0] : "N/A",
        yoloModel: topYoloModel ? topYoloModel[0] : "N/A",
        classifierModel: topClassifierModel ? topClassifierModel[0] : "N/A",
      };
    }

    // Use overview data when "all" is selected
    if (!overview || !overview.total) return null;
    
    // Calculate additional metrics from all predictions
    const durationsMs = predictions
      .filter(p => p.metadata?.timings?.total_ms)
      .map(p => p.metadata.timings.total_ms);
    const avgDuration = durationsMs.length > 0 
      ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length)
      : 0;

    const edgeCases = predictions.filter(p => 
      p.flag_type === "edge_case" || p.flag_type === "edge case"
    ).length;

    // Get mode and model info
    const modes = {};
    const yoloModels = {};
    const classifierModels = {};
    predictions.forEach(p => {
      if (p.operation_mode) modes[p.operation_mode] = (modes[p.operation_mode] || 0) + 1;
      if (p.yolo_model) yoloModels[p.yolo_model] = (yoloModels[p.yolo_model] || 0) + 1;
      if (p.classifier_model) classifierModels[p.classifier_model] = (classifierModels[p.classifier_model] || 0) + 1;
    });
    const topMode = Object.entries(modes).sort((a, b) => b[1] - a[1])[0];
    const topYoloModel = Object.entries(yoloModels).sort((a, b) => b[1] - a[1])[0];
    const topClassifierModel = Object.entries(classifierModels).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalItems: overview.total || 0,
      accepted: overview.accepted || 0,
      rejected: overview.rejected || 0,
      flagged: overview.flagged || 0,
      avgConfidence: overview.avg_confidence || 0,
      acceptanceRate: overview.total > 0 
        ? ((overview.accepted / overview.total) * 100).toFixed(1)
        : 0,
      rejectionRate: overview.total > 0
        ? ((overview.rejected / overview.total) * 100).toFixed(1)
        : 0,
      flagRate: overview.total > 0
        ? ((overview.flagged / overview.total) * 100).toFixed(1)
        : 0,
      avgDecisionDuration: avgDuration,
      edgeCases,
      modeUsed: topMode ? topMode[0] : "N/A",
      yoloModel: topYoloModel ? topYoloModel[0] : "N/A",
      classifierModel: topClassifierModel ? topClassifierModel[0] : "N/A",
    };
  }, [overview, filteredPredictions, predictions, selectedMachine]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: "#4CAF50" }} />
          <p className="text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Machine Filter */}
      <div className="card-responsive scroll-x-mobile" style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        background: "white",
        border: "1px solid #E5E7EB",
        flexWrap: "wrap",
      }}>
        <Filter style={{ width: 18, height: 18, color: "#6b7280" }} />
        <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Filter by Machine:</span>
        <select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#374151",
            background: "white",
            cursor: "pointer",
            minWidth: "160px",
            flex: "1 1 auto",
            maxWidth: "250px",
          }}
        >
          <option value="all">All Machines</option>
          {machineNames.map(name => (
            <option key={name} value={name}>{name.replace(/_/g, " ")}</option>
          ))}
        </select>
        {selectedMachine !== "all" && (
          <span style={{ 
            padding: "4px 10px", 
            background: "#DCFCE7", 
            color: "#4CAF50", 
            borderRadius: "16px",
            fontSize: "11px",
            fontWeight: "500",
          }}>
            Filtered: {filteredPredictions.length}
          </span>
        )}
      </div>

      {/* Prediction Status Info Cards - Only show if data exists */}
      {(stats.modeUsed !== "N/A" || stats.yoloModel !== "N/A" || stats.classifierModel !== "N/A") && (
        <div className="card-responsive scroll-x-mobile" style={{ 
          display: "flex",
          gap: "16px",
          background: "white",
          border: "1px solid #E5E7EB",
          flexWrap: "wrap",
        }}>
          {stats.modeUsed !== "N/A" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", flex: "1 1 auto", minWidth: "120px" }}>
              <Cpu style={{ width: 16, height: 16, color: "#0EA5E9" }} />
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>Mode Used</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0EA5E9" }}>{stats.modeUsed}</div>
              </div>
            </div>
          )}
          {stats.yoloModel !== "N/A" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", flex: "1 1 auto", minWidth: "120px" }}>
              <Zap style={{ width: 16, height: 16, color: "#F97316" }} />
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>YOLO Model</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#F97316" }}>{stats.yoloModel}</div>
              </div>
            </div>
          )}
          {stats.classifierModel !== "N/A" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", flex: "1 1 auto", minWidth: "120px" }}>
              <Zap style={{ width: 16, height: 16, color: "#14B8A6" }} />
              <div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>Classifier Model</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#14B8A6" }}>{stats.classifierModel}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Row - Using responsive grid */}
      <div className="kpi-grid">
        <KPI
          title="Total Predictions"
          value={stats.totalItems.toLocaleString()}
          note="All predictions"
          color="green"
          valueColor="#4CAF50"
        />
        <KPI
          title="Accepted"
          value={stats.accepted.toLocaleString()}
          note={`${stats.acceptanceRate}% accepted`}
          color="green"
          valueColor="#4CAF50"
        />
        <KPI
          title="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          note="confidence score"
          color="blue"
          valueColor="#3B82F6"
        />
        {stats.avgDecisionDuration > 0 && (
          <KPI
            title="Avg Decision Duration"
            value={`${stats.avgDecisionDuration}ms`}
            note="processing time"
            color="orange"
            valueColor="#F97316"
          />
        )}
        <KPI
          title="Edge Cases"
          value={stats.edgeCases.toLocaleString()}
          note="needs review"
          color="pink"
          valueColor="#EF4444"
        />
        <KPI
          title="Status Breakdown"
          color="cyan"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#374151" }}>Accepted</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#4CAF50" }}>{stats.acceptanceRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#374151" }}>Rejected</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#EF4444" }}>{stats.rejectionRate}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#374151" }}>Flagged</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#F97316" }}>{stats.flagRate}%</span>
            </div>
          </div>
        </KPI>
      </div>

      {/* Charts Row - Responsive */}
      <div className="charts-grid">
        {/* Prediction Distribution Chart - RVM Style with Green */}
        <div className="card-responsive" style={{
          background: "white",
          border: "1px solid #E5E7EB",
          fontFamily: "'Outfit', sans-serif",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Prediction Distribution
          </h3>
          
          {/* Donut Chart with labels */}
          <div style={{ 
            height: "280px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            position: "relative",
          }}>
            <svg width="280" height="280" viewBox="0 0 280 280">
              {/* Calculate angles */}
              {(() => {
                const total = stats.accepted + stats.rejected + (stats.flagged || 0);
                const acceptedAngle = (stats.accepted / total) * 360;
                const rejectedAngle = (stats.rejected / total) * 360;
                
                const acceptedEnd = acceptedAngle;
                
                // Convert to radians and calculate path for donut
                const toRad = (deg) => (deg - 90) * Math.PI / 180;
                const cx = 140, cy = 140, outerR = 100, innerR = 50;
                
                const getDonutPath = (startAngle, endAngle) => {
                  const start = toRad(startAngle);
                  const end = toRad(endAngle);
                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                  
                  // Outer arc points
                  const x1 = cx + outerR * Math.cos(start);
                  const y1 = cy + outerR * Math.sin(start);
                  const x2 = cx + outerR * Math.cos(end);
                  const y2 = cy + outerR * Math.sin(end);
                  
                  // Inner arc points
                  const x3 = cx + innerR * Math.cos(end);
                  const y3 = cy + innerR * Math.sin(end);
                  const x4 = cx + innerR * Math.cos(start);
                  const y4 = cy + innerR * Math.sin(start);
                  
                  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
                };
                
                const acceptedPercent = ((stats.accepted / total) * 100).toFixed(2);
                const rejectedPercent = ((stats.rejected / total) * 100).toFixed(2);
                
                // Calculate label positions (middle of each slice)
                const acceptedMidAngle = acceptedAngle / 2;
                const rejectedMidAngle = acceptedEnd + rejectedAngle / 2;
                const labelRadius = 75; // Between inner and outer
                
                const acceptedLabelX = cx + labelRadius * Math.cos(toRad(acceptedMidAngle));
                const acceptedLabelY = cy + labelRadius * Math.sin(toRad(acceptedMidAngle));
                const rejectedLabelX = cx + labelRadius * Math.cos(toRad(rejectedMidAngle));
                const rejectedLabelY = cy + labelRadius * Math.sin(toRad(rejectedMidAngle));
                
                return (
                  <>
                    {/* Accepted slice - Green */}
                    <path d={getDonutPath(0, acceptedEnd)} fill="#4CAF50" />
                    {/* Rejected slice - Red */}
                    <path d={getDonutPath(acceptedEnd, acceptedEnd + rejectedAngle)} fill="#EF4444" />
                    
                    {/* Labels on slices with white text */}
                    <text 
                      x={acceptedLabelX} 
                      y={acceptedLabelY - 8} 
                      fill="white" 
                      textAnchor="middle"
                      style={{ fontSize: "11px", fontWeight: "600", fontFamily: "'Outfit', sans-serif" }}
                    >
                      Accepted
                    </text>
                    <text 
                      x={acceptedLabelX} 
                      y={acceptedLabelY + 8} 
                      fill="white" 
                      textAnchor="middle"
                      style={{ fontSize: "12px", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {acceptedPercent}%
                    </text>
                    
                    <text 
                      x={rejectedLabelX} 
                      y={rejectedLabelY - 8} 
                      fill="white" 
                      textAnchor="middle"
                      style={{ fontSize: "11px", fontWeight: "600", fontFamily: "'Outfit', sans-serif" }}
                    >
                      Rejected
                    </text>
                    <text 
                      x={rejectedLabelX} 
                      y={rejectedLabelY + 8} 
                      fill="white" 
                      textAnchor="middle"
                      style={{ fontSize: "12px", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {rejectedPercent}%
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: "#4CAF50" }} />
              <span style={{ fontSize: "14px", color: "#374151" }}>Accepted</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: "#EF4444" }} />
              <span style={{ fontSize: "14px", color: "#374151" }}>Rejected</span>
            </div>
          </div>

          {/* Stat cards below chart */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
            <div style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              padding: "16px",
              textAlign: "left",
            }}>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Accepted</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#4CAF50" }}>
                {stats.acceptanceRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                {stats.acceptanceRate}% of predictions
              </div>
            </div>
            <div style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              padding: "16px",
              textAlign: "left",
            }}>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Rejected</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#EF4444" }}>
                {stats.rejectionRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                {stats.rejectionRate}% of predictions
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Distribution Chart - Natural colors */}
        <div className="card-responsive" style={{
          background: "white",
          border: "1px solid #E5E7EB",
          fontFamily: "'Outfit', sans-serif",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
            Confidence Distribution
          </h3>
          
          {/* Bar Chart */}
          <div style={{ 
            height: "280px", 
            display: "flex", 
            alignItems: "flex-end", 
            justifyContent: "space-around",
            paddingBottom: "50px",
            borderLeft: "1px solid #E5E7EB",
            borderBottom: "1px solid #E5E7EB",
            marginLeft: "40px",
            position: "relative",
          }}>
            {/* Y-axis labels */}
            <div style={{ position: "absolute", left: "-35px", top: "0", height: "calc(100% - 50px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {[4, 3, 2, 1, 0].map(n => (
                <span key={n} style={{ fontSize: "12px", color: "#6b7280" }}>{n}</span>
              ))}
            </div>
            
            {/* Y-axis label */}
            <div style={{ 
              position: "absolute", 
              left: "-60px", 
              top: "50%", 
              transform: "rotate(-90deg) translateX(50%)",
              fontSize: "12px",
              color: "#6b7280",
              whiteSpace: "nowrap",
            }}>
              Confidence Count
            </div>
            
            {/* Bars */}
            {[
              { label: "High", height: 180, count: 4 },
              { label: "Med-High", height: 135, count: 3 },
              { label: "Medium", height: 135, count: 3 },
              { label: "Med-Low", height: 0, count: 0 },
              { label: "Low", height: 45, count: 1 },
              { label: "V.Low", height: 0, count: 0 },
            ].map((bar, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ 
                  width: "36px", 
                  height: `${bar.height}px`, 
                  background: "#0EA5E9", 
                  borderRadius: "4px 4px 0 0",
                  minHeight: bar.count > 0 ? "20px" : "0",
                }} />
                <span style={{ 
                  fontSize: "10px", 
                  color: "#6b7280", 
                  marginTop: "8px",
                  transform: "rotate(-45deg)",
                  transformOrigin: "center",
                  whiteSpace: "nowrap",
                }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: "#0EA5E9" }} />
              <span style={{ fontSize: "14px", color: "#0EA5E9" }}>User Count</span>
            </div>
          </div>

          {/* Stat cards below chart */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "20px" }}>
            {[
              { label: "High", value: "4", pct: "0.5%" },
              { label: "Medium", value: "3", pct: "0.4%" },
              { label: "Low", value: "1", pct: "0.1%" },
              { label: "V.Low", value: "0", pct: "0.0%" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                padding: "12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "12px", color: "#374151", marginBottom: "4px" }}>{stat.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0EA5E9" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{stat.pct}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Summary Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
        gap: "16px" 
      }}>
        <StatCard
          label="Accepted"
          value={stats.accepted.toLocaleString()}
          subtext={`${stats.acceptanceRate}% of total`}
          valueColor="#60A5FA"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected.toLocaleString()}
          subtext={`${stats.rejectionRate}% of total`}
          valueColor="#EC4899"
        />
        <StatCard
          label="Flagged"
          value={stats.flagged.toLocaleString()}
          subtext={`${stats.flagRate}% of total`}
          valueColor="#F59E0B"
        />
        <StatCard
          label="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          subtext="overall"
          valueColor="#0EA5E9"
        />
      </div>
    </div>
  );
};

export default OverviewTab;
