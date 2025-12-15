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
  Brain,
  Target,
  Activity,
  ArrowRight
} from "lucide-react";

const OverviewTab = ({ overview, topModel }) => {
  const [loading, setLoading] = useState(false);
  const [machineFilter, setMachineFilter] = useState("all");

  // Use the overview data passed from Dashboard (already has correct analytics data)
  const stats = useMemo(() => {
    if (!overview || !overview.total) return null;
    
    return {
      totalItems: overview.total || 0,
      accepted: overview.accepted || 0,
      rejected: overview.rejected || 0,
      flagged: overview.flagged || 0,
      avgConfidence: overview.avg_confidence || 0,
      avgDecisionDuration: overview.avg_decision_duration || 0,
      edgeCases: overview.edge_cases || 0,
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

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="p-6 rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="flex gap-4">
        <div className="p-3 rounded-lg h-fit" style={{ backgroundColor: "rgba(108, 192, 74, 0.1)" }}>
          <Icon className="h-6 w-6" style={{ color: "#6CC04A" }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
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
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            icon={Clock}
            title="Avg Decision Duration"
            value={`${stats.avgDecisionDuration}ms`}
            subtitle="Processing time"
            color="text-purple-700"
          />
          <StatCard
            icon={AlertCircle}
            title="Edge Cases"
            value={stats.edgeCases.toLocaleString()}
            subtitle="Total number"
            color="text-red-700"
          />
        </div>
      </div>

      {/* Machine Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-gray-900">Filter by Machine:</span>
          <select 
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-4 py-2 border border-blue-300 rounded-lg bg-white font-medium text-gray-900 hover:border-blue-500 transition"
          >
            <option value="all">All Machines</option>
            <option value="maadi_club">Maadi Club</option>
            {/* Add more machines as available */}
          </select>
          <span className="text-sm text-gray-600">Showing data across all machines</span>
        </div>
      </div>

      {/* Status Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Prediction Status</h2>
        
        {/* Status Cards */}
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

      {/* Dashboard Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Dashboard Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={Brain}
            title="Brand Predictions"
            description="View all detected brands with confidence scores and detailed image galleries for each brand."
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Real-time insights with trends, key metrics, and comprehensive performance analysis."
          />
          <FeatureCard
            icon={Target}
            title="Brand Insights"
            description="Deep dive into brand performance, market share, and detection statistics with visual charts."
          />
          <FeatureCard
            icon={Zap}
            title="Model Comparison"
            description="Compare multiple AI models side-by-side to understand prediction patterns and accuracy."
          />
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
