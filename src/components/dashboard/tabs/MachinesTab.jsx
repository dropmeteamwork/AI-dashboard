import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
          <p className="text-gray-600">Loading machine data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
          <p className="text-gray-900 font-semibold">Failed to load machines</p>
          <p className="text-sm text-gray-600">{error.message}</p>
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
      <div className="w-full">
        <div className="machines-header mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Machine Monitoring</h2>
                <p className="text-gray-600 text-sm">Track and monitor all connected machines and their performance</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">No machines available</p>
            <p className="text-sm text-gray-500 mt-1">No connected machines found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="machines-header mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Machine Monitoring</h2>
              <p className="text-gray-600 text-sm">Track and monitor all connected machines and their performance</p>
            </div>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPIs Section */}
      {machines.length > 0 && (
        <div className="mb-8">
          <MachinesKPIs data={machines} />
        </div>
      )}

      {/* Performance Chart Section */}
      <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Machine performance metrics and trends</p>
        </div>
        <div className="p-6">
          <div style={{ minHeight: 600 }} className="w-full">
            <MachinesPerformanceChart data={machines} />
          </div>
        </div>
      </div>

      {/* Status List Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Machine Status</h3>
          <p className="text-sm text-gray-500 mt-1">Current status of all connected machines</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <MachinesStatusList data={machines} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachinesTab;
