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

// Custom tooltip matching RVM style
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        padding: "12px 16px",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "'Outfit', sans-serif",
      }}>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontWeight: "600", fontSize: "14px", margin: "4px 0" }}>
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

  if (!chartData.length) return <div style={{ padding: "16px", color: "#6b7280", fontFamily: "'Outfit', sans-serif" }}>No machine data</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stacked Bar Chart - Total breakdown */}
      <div>
        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", fontFamily: "'Outfit', sans-serif" }}>Production Breakdown</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="machine" 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }}
              stroke="#6b7280"
            />
            <YAxis tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }} stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: "'Outfit', sans-serif" }} />
            <Bar dataKey="accepted" fill="#4CAF50" name="Accepted" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Acceptance Rate Line Chart */}
      <div>
        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", fontFamily: "'Outfit', sans-serif" }}>Acceptance Rate (%)</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="machine" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }}
              stroke="#6b7280"
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }} stroke="#6b7280" />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey="acceptanceRate" fill="#0EA5E9" name="Acceptance Rate" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.acceptanceRate >= 70 ? "#4CAF50" : entry.acceptanceRate >= 50 ? "#F97316" : "#EF4444"}
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
// KPIs - RVM Dashboard Style with Gradients
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
      gradient: "linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)",
      borderColor: "#93C5FD",
      valueColor: "#3B82F6",
    },
    {
      label: "Online Status",
      value: `${onlineMachines}/${totalMachines}`,
      gradient: "linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)",
      borderColor: "#86EFAC",
      valueColor: "#4CAF50",
    },
    {
      label: "Total Collected",
      value: totalCollected.toLocaleString(),
      gradient: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      borderColor: "#7DD3FC",
      valueColor: "#0EA5E9",
      extra: `✓ ${totalAccepted.toLocaleString()} | ✗ ${totalRejected.toLocaleString()}`
    },
    {
      label: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      gradient: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
      borderColor: "#FDBA74",
      valueColor: "#F97316",
    }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
      {kpis.map((kpi, idx) => (
        <div 
          key={idx}
          style={{
            background: kpi.gradient,
            border: `1px solid ${kpi.borderColor}`,
            borderRadius: "16px",
            padding: "20px 24px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <div style={{ color: "#374151", fontSize: "14px", fontWeight: "500", marginBottom: "12px" }}>{kpi.label}</div>
          <div style={{ color: kpi.valueColor, fontSize: "32px", fontWeight: "700" }}>{kpi.value}</div>
          
          {/* Additional stats */}
          {kpi.extra && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              {kpi.extra}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
