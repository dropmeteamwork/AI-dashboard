import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MachinesPerformanceChart, MachinesStatusList, MachinesKPIs } from "@/components/charts/MachineCharts";
import { Loader2, AlertCircle, Server } from "lucide-react";

const MachinesTab = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/v2/metrics/machines/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMachines(data);
      } catch (err) {
        console.error("Failed to fetch machines:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Server className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Machine Monitoring</h2>
        </div>
        <p className="text-gray-600">Track and monitor all connected machines and their performance</p>
      </div>

      {/* KPIs */}
      {machines.length > 0 && (
        <div>
          <MachinesKPIs data={machines} />
        </div>
      )}

      {/* Performance Chart */}
      <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Performance Overview</h3>
            <p className="text-sm text-gray-600 mt-1">Machine performance metrics and trends</p>
          </div>
          <div style={{ height: 400 }} className="w-full">
            <MachinesPerformanceChart data={machines} />
          </div>
        </div>
      </Card>

      {/* Status List */}
      <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Machine Status</h3>
            <p className="text-sm text-gray-600 mt-1">Current status of all connected machines</p>
          </div>
          <div className="overflow-x-auto">
            <MachinesStatusList data={machines} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MachinesTab;
