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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch comprehensive stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://web-ai-dashboard.up.railway.app/ai_dashboard/brand-predictions/?page_size=1000"
        );
        const data = await res.json();
        const items = data.results || data;

        if (items && items.length > 0) {
          const totalItems = items.length;
          const totalBrands = new Set(items.map(i => i.brand).filter(Boolean)).size;
          
          // Calculate confidence - handle different possible field names
          const confidenceValues = items.map(i => {
            const conf = i.confidence !== undefined ? i.confidence : 
                        i.avg_confidence !== undefined ? i.avg_confidence :
                        0;
            // Convert to percentage if it's between 0-1
            return conf > 1 ? conf : conf * 100;
          });
          const avgConfidence = (confidenceValues.reduce((a, b) => a + b, 0) / totalItems).toFixed(1);
          
          // Count different statuses - check various possible field names
          const flaggedCount = items.filter(i => 
            i.flagged === true || 
            i.flag || 
            i.is_flagged === true
          ).length;
          
          const acceptedCount = items.filter(i => 
            i.status === 'accepted' || 
            i.status === 'ACCEPTED' ||
            i.is_accepted === true
          ).length;
          
          const rejectedCount = items.filter(i => 
            i.status === 'rejected' || 
            i.status === 'REJECTED' ||
            i.is_rejected === true
          ).length;
          
          // If no status data, calculate based on flagged
          const processedCount = totalItems - flaggedCount;
          
          setStats({
            totalItems,
            totalBrands,
            avgConfidence: Math.min(100, avgConfidence),
            flaggedCount,
            acceptedCount: acceptedCount || processedCount,
            rejectedCount,
            acceptanceRate: acceptedCount > 0 ? ((acceptedCount / totalItems) * 100).toFixed(1) : ((processedCount / totalItems) * 100).toFixed(1)
          });
        }
      } catch (err) {
        console.error("Error fetching overview stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  if (loading) {
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
            <Badge className="px-4 py-2 text-sm" style={{ backgroundColor: "white", color: "#6CC04A" }}>Machine Learning</Badge>
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm border border-white/30">Real-time Processing</Badge>
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm border border-white/30">Multi-Model Detection</Badge>
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
            value={stats?.totalItems?.toLocaleString() || 0}
            subtitle="All detections"
            color="text-blue-700"
          />
          <StatCard
            icon={Target}
            title="Brands Detected"
            value={stats?.totalBrands || 0}
            subtitle="Unique brands"
            color="text-purple-700"
          />
          <StatCard
            icon={Zap}
            title="Average Confidence"
            value={`${stats?.avgConfidence || 0}%`}
            subtitle="Detection accuracy"
            color="text-amber-700"
          />
          <StatCard
            icon={TrendingUp}
            title="Acceptance Rate"
            value={`${stats?.acceptanceRate || 0}%`}
            subtitle="Approved predictions"
            color="text-white" style={{ color: "#6CC04A" }}
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
            <div className="text-3xl font-bold" style={{ color: "#6CC04A" }}>{stats?.acceptedCount || 0}</div>
            <div className="text-sm text-gray-600 mt-2">Verified predictions</div>
          </Card>

          <Card className="p-6 border border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="font-semibold text-gray-900">Flagged</span>
            </div>
            <div className="text-3xl font-bold text-red-700">{stats?.flaggedCount || 0}</div>
            <div className="text-sm text-gray-600 mt-2">Items for review</div>
          </Card>

          <Card className="p-6 border border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="font-semibold text-gray-900">Rejected</span>
            </div>
            <div className="text-3xl font-bold text-orange-700">{stats?.rejectedCount || 0}</div>
            <div className="text-sm text-gray-600 mt-2">Declined predictions</div>
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

      {/* Quick Start Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Quick Start Guide
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Badge className="bg-blue-600 text-white min-w-fit px-3">1</Badge>
            <div>
              <p className="font-semibold text-gray-900">Explore Brand Predictions</p>
              <p className="text-sm text-gray-600">View all detected brands and their confidence scores in real-time.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-600 text-white min-w-fit px-3">2</Badge>
            <div>
              <p className="font-semibold text-gray-900">Analyze Trends</p>
              <p className="text-sm text-gray-600">Check analytics tab to see processing trends and key insights about your data.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-600 text-white min-w-fit px-3">3</Badge>
            <div>
              <p className="font-semibold text-gray-900">Review Flagged Items</p>
              <p className="text-sm text-gray-600">Investigate items marked for review and adjust detection parameters as needed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats Footer */}
      <div className="border-t pt-6">
        <h3 className="font-bold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: "#6CC04A" }}>{stats?.totalBrands || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active Brands</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{((stats?.totalItems || 0) / (stats?.totalBrands || 1)).toFixed(0)}</div>
            <p className="text-xs text-gray-600 mt-1">Avg. Items/Brand</p>
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
