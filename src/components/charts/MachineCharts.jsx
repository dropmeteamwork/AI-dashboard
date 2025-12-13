import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// -----------------------------------------------------
// MACHINE PERFORMANCE CHART
// -----------------------------------------------------
export const MachinesPerformanceChart = ({ data = [] }) => {
  const chartData = data.map((m) => ({
    machine: m.name,
    total_collected: m.total_collected ?? 0,
  }));

  if (!chartData.length) return <div className="p-4 text-gray-500">No machine data</div>;

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="machine" interval={0} angle={-30} textAnchor="end" height={70} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total_collected" fill="#3B82F6" name="Total Collected" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// -----------------------------------------------------
// MACHINE STATUS LIST / TABLE
// -----------------------------------------------------
export const MachinesStatusList = ({ data = [] }) => {
  if (!data.length) return <div className="p-4 text-gray-500">No machines available</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Machine</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Cans Capacity</th>
            <th className="p-2 border">Bottles Capacity</th>
            <th className="p-2 border">Total Collected</th>
            <th className="p-2 border">Daily Average</th>
            <th className="p-2 border">Efficiency</th>
            <th className="p-2 border">Location</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m, i) => (
            <tr key={i} className="text-center hover:bg-gray-50">
              <td className="p-2 border">{m.name}</td>
              <td className={`p-2 border font-semibold ${m.status === "available" ? "text-green-600" : "text-red-600"}`}>{m.status}</td>
              <td className="p-2 border">{m.cans_capacity}</td>
              <td className="p-2 border">{m.bottles_capacity}</td>
              <td className="p-2 border">{m.total_collected}</td>
              <td className="p-2 border">{m.daily_average}</td>
              <td className="p-2 border">{m.efficiency}</td>
              <td className="p-2 border">
                <a href={m.location_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Map</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// -----------------------------------------------------
// KPIs
// -----------------------------------------------------
export const MachinesKPIs = ({ data = [] }) => {
  const totalMachines = data.length;
  const availableMachines = data.filter(m => m.status === "available").length;
  const totalCollected = data.reduce((sum, m) => sum + (m.total_collected ?? 0), 0);
  const avgEfficiency = data.length ? (data.reduce((sum, m) => sum + parseFloat(m.efficiency) || 0, 0) / data.length).toFixed(1) + "%" : "0%";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="p-4 bg-white rounded-lg border shadow-sm text-center">
        <div className="text-gray-500 text-sm">Total Machines</div>
        <div className="text-xl font-semibold">{totalMachines}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm text-center">
        <div className="text-gray-500 text-sm">Available</div>
        <div className="text-xl font-semibold text-green-600">{availableMachines}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm text-center">
        <div className="text-gray-500 text-sm">Total Collected</div>
        <div className="text-xl font-semibold text-blue-600">{totalCollected}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm text-center">
        <div className="text-gray-500 text-sm">Average Efficiency</div>
        <div className="text-xl font-semibold text-purple-600">{avgEfficiency}</div>
      </div>
    </div>
  );
};
