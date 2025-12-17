import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Activity,
  ArrowRight
} from "lucide-react";

const OverviewTab = ({ overview, topModel }) => {
  const [loading, setLoading] = useState(false);

  // Use the overview data passed from Dashboard (already has correct analytics data)
  const stats = useMemo(() => {
    if (!overview || !overview.total) return null;
    
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
    };
  }, [overview]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{title}</div>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('700', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </Card>
  );

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: "#6CC04A" }} />
          <p className="text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl p-8 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #6CC04A 0%, #8ED47D 100%)" }}>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">AI Dashboard</h1>
          <p className="mb-6 text-lg" style={{ color: "rgba(255,255,255,0.9)" }}>Real-time brand and product detection powered by machine learning</p>
          <div className="flex gap-3 flex-wrap">
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BarChart3}
            title="Total Items Processed"
            value={stats.totalItems.toLocaleString()}
            subtitle="All items"
            color="text-blue-700"
          />
          <StatCard
            icon={Zap}
            title="Average Confidence"
            value={`${stats.avgConfidence}%`}
            subtitle="Detection accuracy"
            color="text-amber-700"
          />
          <StatCard
            icon={TrendingUp}
            title="Acceptance Rate"
            value={`${stats.acceptanceRate}%`}
            subtitle="Approved predictions"
            color="text-emerald-700"
          />
          <StatCard
            icon={CheckCircle}
            title="Active Machines"
            value={overview?.active_machines || "—"}
            subtitle="System status"
            color="text-green-700"
          />
        </div>
      </div>

      {/* Status Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Prediction Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6" style={{ border: "1px solid rgba(108, 192, 74, 0.2)", backgroundColor: "rgba(108, 192, 74, 0.05)" }}>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6" style={{ color: "#6CC04A" }} />
              <span className="font-semibold text-gray-900">Accepted</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: "#6CC04A" }}>{stats.accepted.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Verified predictions</div>
          </Card>

          <Card className="p-6 border border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="font-semibold text-gray-900">Flagged</span>
            </div>
            <div className="text-3xl font-bold text-red-700">{stats.flagged.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">{`${stats.flagRate}% of total`}</div>
          </Card>

          <Card className="p-6 border border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="font-semibold text-gray-900">Rejected</span>
            </div>
            <div className="text-3xl font-bold text-orange-700">{stats.rejected.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">{`${stats.rejectionRate}% of total`}</div>
          </Card>
        </div>
      </div>



      {/* System Stats Footer */}
      <div className="border-t pt-6">
        <h3 className="font-bold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: "#6CC04A" }}>{stats.totalItems}</div>
            <p className="text-xs text-gray-600 mt-1">Total Processed</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.acceptanceRate}%</div>
            <p className="text-xs text-gray-600 mt-1">Acceptance Rate</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{topModel?.model_used || "—"}</div>
            <p className="text-xs text-gray-600 mt-1">Top Model</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: "#6CC04A" }}>✓ Active</div>
            <p className="text-xs text-gray-600 mt-1">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
