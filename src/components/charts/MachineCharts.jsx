import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer as RespContainer
} from "recharts";

// Custom tooltip for better visualization
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// -----------------------------------------------------
// MACHINE PERFORMANCE CHART - Enhanced with multiple visualizations
// -----------------------------------------------------
export const MachinesPerformanceChart = ({ data = [] }) => {
  const chartData = data.map((m) => ({
    machine: m.machine_name.replace(/_/g, " "),
    total: m.total ?? 0,
    accepted: m.accepted ?? 0,
    rejected: m.rejected ?? 0,
    acceptanceRate: m.total > 0 ? Math.round((m.accepted / m.total) * 100) : 0,
  }));

  if (!chartData.length) return <div className="p-4 text-gray-500">No machine data</div>;

  return (
    <div className="space-y-6">
      {/* Stacked Bar Chart - Total breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Production Breakdown</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="machine" 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              style={{ fontSize: "12px" }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="accepted" fill="#10B981" name="Accepted" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Acceptance Rate Line Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Acceptance Rate (%)</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="machine" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              style={{ fontSize: "12px" }}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey="acceptanceRate" fill="#8B5CF6" name="Acceptance Rate" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.acceptanceRate >= 70 ? "#10B981" : entry.acceptanceRate >= 50 ? "#F59E0B" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// MACHINE STATUS LIST / TABLE - Enhanced styling
// -----------------------------------------------------
export const MachinesStatusList = ({ data = [] }) => {
  if (!data.length) return <div className="p-8 text-center text-gray-500 text-sm">No machines available</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Machine Name</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Total Items</th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Accepted</th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Rejected</th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Acceptance Rate</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Last Seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((m, i) => {
            const acceptanceRate = m.total > 0 ? Math.round((m.accepted / m.total) * 100) : 0;
            const isOnline = m.online;
            
            return (
              <tr 
                key={i} 
                className="hover:bg-blue-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="font-medium text-gray-900">{m.machine_name.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    isOnline 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-600" : "bg-red-600"}`}></span>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">{m.total.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 font-semibold">
                    ✓ {m.accepted.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 font-semibold">
                    ✗ {m.rejected.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          acceptanceRate >= 80 ? "bg-green-500" : 
                          acceptanceRate >= 60 ? "bg-amber-500" : 
                          "bg-red-500"
                        }`}
                        style={{ width: `${acceptanceRate}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 w-10 text-right">{acceptanceRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(m.last_seen).toLocaleDateString()} {new Date(m.last_seen).toLocaleTimeString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// -----------------------------------------------------
// KPIs - Enhanced with better styling
// -----------------------------------------------------
export const MachinesKPIs = ({ data = [] }) => {
  const totalMachines = data.length;
  const onlineMachines = data.filter(m => m.online).length;
  const totalCollected = data.reduce((sum, m) => sum + (m.total ?? 0), 0);
  const totalAccepted = data.reduce((sum, m) => sum + (m.accepted ?? 0), 0);
  const totalRejected = data.reduce((sum, m) => sum + (m.rejected ?? 0), 0);
  const acceptanceRate = totalCollected > 0 ? ((totalAccepted / totalCollected) * 100).toFixed(1) : "0";

  const kpis = [
    {
      label: "Total Machines",
      value: totalMachines,
      color: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      label: "Online Status",
      value: `${onlineMachines}/${totalMachines}`,
      color: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      label: "Total Collected",
      value: totalCollected.toLocaleString(),
      color: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      label: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      color: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <div 
          key={idx}
          className={`${kpi.color} ${kpi.borderColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="text-gray-600 text-sm font-medium mb-2">{kpi.label}</div>
          <div className={`${kpi.textColor} text-3xl font-bold`}>{kpi.value}</div>
          
          {/* Additional stats */}
          {idx === 2 && (
            <div className="text-xs text-gray-500 mt-2">
              ✓ {totalAccepted.toLocaleString()} | ✗ {totalRejected.toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
