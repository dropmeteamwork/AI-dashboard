import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MachinesPerformanceChart, MachinesStatusList, MachinesKPIs } from "@/components/charts/MachineCharts";
import { Loader2, AlertCircle, Server } from "lucide-react";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

const MachinesTab = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      setError(null);
      let retries = 0;
      const maxRetries = 2;

      const attemptFetch = async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const res = await fetch(`${API_BASE}/ai_dashboard/machines/`, {
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setMachines(data);
          setError(null);
        } catch (err) {
          if (err.name === "AbortError") {
            console.warn("Machines fetch timeout");
            if (retries < maxRetries) {
              retries++;
              console.log(`Retrying machines fetch (${retries}/${maxRetries})...`);
              return attemptFetch();
            }
            setError(new Error("Request timeout - please try again"));
          } else {
            console.error("Failed to fetch machines:", err);
            setError(err);
          }
          setMachines([]);
        }
      };

      await attemptFetch();
      setLoading(false);
    };

    fetchMachines();
  }, []);

  return (
    <div className="w-full">
      {/* Loading/Error Indicators */}
      {loading && machines.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          <p className="text-sm text-green-700">Loading machine data...</p>
        </div>
      )}

      {error && machines.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">Failed to load machines</p>
            <p className="text-xs text-red-700">{error.message}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Server className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Machine Monitoring</h2>
        </div>
        <p className="text-gray-600 text-sm ml-11">Track and monitor all connected machines and their performance</p>
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
