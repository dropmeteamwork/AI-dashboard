import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";
import { TrendingUp, Calendar, Filter } from "lucide-react";
import { COLORS } from "@/constants/colors";

export default function BrandInsightsTab({ brandsSummary = [] }) {
  const brandList = useMemo(() => [...new Set(brandsSummary.map(b => b.brand))], [brandsSummary]);

  const filtered = useMemo(() => {
    return brandsSummary;
  }, [brandsSummary]);

  const totalDetections = filtered.reduce((sum, b) => sum + b.total, 0);
  const uniqueModels = new Set(filtered.map(b => b.model_name)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(108, 192, 74, 0.1)",
            }}
          >
            <TrendingUp style={{ width: 24, height: 24, color: COLORS.PRIMARY }} />
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Brand Insights
          </h2>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Detections</p>
              <p className="text-3xl font-bold text-blue-700">{totalDetections.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-purple-200 bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Detection</p>
              <p className="text-lg font-semibold text-purple-700">
                {filtered[0] ? new Date(filtered[0].last_seen).toLocaleDateString() : "—"}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unique Models</p>
              <p className="text-3xl font-bold text-emerald-700">{uniqueModels}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Filter className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <Card className="p-6 border border-gray-200">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Detection Trends</h3>
            <p className="text-sm text-gray-600 mt-1">Detections over time</p>
          </div>
          <div style={{ height: 300 }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="brand" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Detection History Table */}
      <Card className="p-6 border border-gray-200">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Detection History</h3>
            <p className="text-sm text-gray-600 mt-1">Recent detections and counts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Last Detected</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{b.brand}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(b.last_seen).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{b.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No data available for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
