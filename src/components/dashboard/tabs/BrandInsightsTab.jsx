import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

export default function BrandInsightsTab({ brandsSummary = [] }) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [period, setPeriod] = useState("year"); // "day", "month", "year"

  const brandList = [...new Set(brandsSummary.map(b => b.brand))];

  // Filter data based on brand and period
  const filtered = useMemo(() => {
    const now = new Date();
    return brandsSummary.filter(b => {
      const itemDate = new Date(b.last_seen);

      // Brand filter
      if (selectedBrand && b.brand !== selectedBrand) return false;

      // Period filter
      if (period === "day") {
        return (
          itemDate.getDate() === now.getDate() &&
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "month") {
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "year") {
        return itemDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [brandsSummary, selectedBrand, period]);

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Brand Selector */}
        <div>
          <label className="text-sm text-gray-600">Select Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="">All Brands</option>
            {brandList.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Period Selector */}
        <div>
          <label className="text-sm text-gray-600">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="text-gray-500 text-sm">Total Detections</div>
          <div className="text-2xl font-bold">{filtered.reduce((sum, b) => sum + b.total, 0)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="text-gray-500 text-sm">Last Detection</div>
          <div className="text-xl font-semibold">
            {filtered[0] ? new Date(filtered[0].last_seen).toLocaleString() : "—"}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="text-gray-500 text-sm">Unique Models</div>
          <div className="text-xl font-semibold">
            {new Set(filtered.map(b => b.model_name)).size || "—"}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Trend */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold mb-3">Detections Over Time</h3>
          <LineChart width={500} height={280} data={filtered}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="last_seen" tickFormatter={v => new Date(v).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#4ade80" strokeWidth={2} />
          </LineChart>
        </div>

        {/* Confidence distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold mb-3">Confidence Distribution</h3>
          <BarChart width={500} height={280} data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brand" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avg_confidence" fill="#60a5fa" />
          </BarChart>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-md mb-3">Detection History</h3>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 border">Brand</th>
                <th className="p-2 border">Time</th>
                {/* <th className="p-2 border">Model</th>
                <th className="p-2 border">Confidence</th> */}
                <th className="p-2 border">Count</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2 border">{b.brand}</td>
                  <td className="p-2 border">{new Date(b.last_seen).toLocaleString()}</td>
                  {/* <td className="p-2 border">{b.model_name}</td>
                  <td className="p-2 border">{b.avg_confidence?.toFixed(2)}</td> */}
                  <td className="p-2 border">{b.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
