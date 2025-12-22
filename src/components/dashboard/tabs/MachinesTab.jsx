import { useEffect, useState } from "react";
import { MachinesPerformanceChart, MachinesStatusList, MachinesKPIs } from "@/components/charts/MachineCharts";
import { Loader2, AlertCircle, Server, FileDown } from "lucide-react";
import { exportToCSV } from "@/utils/exportCsv";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

const MachinesTab = ({ data = null }) => {
  const [machines, setMachines] = useState(data || []);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If data is provided as prop, don't fetch
    if (data) {
      setMachines(data);
      setLoading(false);
      return;
    }

    const fetchMachines = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/ai_dashboard/machines/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let machinesData = await res.json();
        
        // If machines is empty, try to get brands from predictions
        if (!machinesData || machinesData.length === 0) {
          try {
            const predsRes = await fetch(`${API_BASE}/ai_dashboard/predictions/`);
            if (predsRes.ok) {
              const predsData = await predsRes.json();
              // Extract unique brands/machine names from predictions
              const uniqueMachines = {};
              if (Array.isArray(predsData)) {
                predsData.forEach(pred => {
                  const machineName = pred.machine_name || pred.brand || "unknown";
                  if (!uniqueMachines[machineName]) {
                    uniqueMachines[machineName] = {
                      machine_id: machineName,
                      machine_name: machineName,
                      total_predictions: 0,
                      avg_confidence: 0,
                      status: "active",
                      last_seen: new Date().toISOString(),
                      online: true,
                      accepted: 0,
                      rejected: 0,
                      total: 0
                    };
                  }
                  uniqueMachines[machineName].total_predictions += 1;
                  uniqueMachines[machineName].total += 1;
                  if (pred.confidence) {
                    uniqueMachines[machineName].avg_confidence = 
                      (uniqueMachines[machineName].avg_confidence * (uniqueMachines[machineName].total_predictions - 1) + pred.confidence) 
                      / uniqueMachines[machineName].total_predictions;
                  }
                });
              }
              machinesData = Object.values(uniqueMachines);
            }
          } catch (err) {
            console.warn("Could not fetch predictions as fallback:", err);
          }
        }
        
        setMachines(machinesData || []);
      } catch (err) {
        console.error("Failed to fetch machines:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: 32, height: 32, color: "#8B5CF6", margin: "0 auto 8px", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>Loading machine data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: 48, height: 48, color: "#EF4444", margin: "0 auto 8px" }} />
          <p style={{ color: "#111827", fontWeight: "600", fontFamily: "'Outfit', sans-serif" }}>Failed to load machines</p>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>{error.message}</p>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportToCSV(machines, "machines_report", [
      { key: "machine_id", label: "Machine ID" },
      { key: "machine_name", label: "Machine Name" },
      { key: "total_predictions", label: "Total Predictions" },
      { key: "avg_confidence", label: "Avg Confidence" },
      { key: "status", label: "Status" },
      { key: "last_seen", label: "Last Seen" },
    ]);
  };

  // Check if no machines available
  if (machines.length === 0 && !loading && !error) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "8px", background: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)", borderRadius: "12px" }}>
              <Server style={{ width: 24, height: 24, color: "#8B5CF6" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", fontFamily: "'Outfit', sans-serif" }}>Machine Monitoring</h2>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>Track and monitor all connected machines and their performance</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <Server style={{ width: 48, height: 48, color: "#9ca3af", margin: "0 auto 8px" }} />
            <p style={{ color: "#6b7280", fontWeight: "600", fontFamily: "'Outfit', sans-serif" }}>No machines available</p>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>No connected machines found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", fontFamily: "'Outfit', sans-serif" }}>Machine Monitoring</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Track and monitor all connected machines</p>
        </div>
        <button
          onClick={handleExportCSV}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <FileDown style={{ width: 16, height: 16 }} />
          Export CSV
        </button>
      </div>

      {/* KPIs Section */}
      {machines.length > 0 && (
        <MachinesKPIs data={machines} />
      )}

      {/* Performance Chart Section */}
      <div 
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>Performance Overview</h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Machine performance metrics and trends</p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ minHeight: 500, width: "100%" }}>
            <MachinesPerformanceChart data={machines} />
          </div>
        </div>
      </div>

      {/* Status List Section */}
      <div 
        style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>Machine Status</h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Current status of all connected machines</p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ overflowX: "auto" }}>
            <MachinesStatusList data={machines} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachinesTab;
