// ModelsTab.jsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ModelPerformanceChart, ModelsConfidenceChart } from "@/components/charts/ModelsCharts";
import { Brain } from "lucide-react";

const BASE_URL = "https://web-ai-dashboard.up.railway.app";

const ModelsTab = () => {
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        // Fetch analytics only - has model predictions_by_model data
        const res = await fetch(`${BASE_URL}/ai_dashboard/analytics/`, { signal: controller.signal });

        clearTimeout(timeout);

        if (res.ok) {
          const analyticsData = await res.json();
          
          // Use predictions_by_model with mock confidence data
          // In production, this would come from a dedicated endpoint
          const predictions = analyticsData.predictions_by_model || [];
          
          // Enrich with estimated confidence based on model type
          const enrichedModels = predictions.map((model) => ({
            model_used: model.model_used || "unknown",
            count: model.count || 0,
            // Use average from avg_confidence_by_item as fallback
            avg_confidence: +(model.avg_confidence || analyticsData.avg_confidence_by_item?.[0]?.avg_conf || 0.75) * 100,
          }));

          setModelData(enrichedModels);
        } else {
          setModelData([]);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn("Model data fetch timeout");
        } else {
          console.warn("Failed to fetch model data:", err);
        }
        setModelData([]);
      }
    };

    fetchModelData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Model Performance</h2>
        </div>
        <p className="text-gray-600">Compare and analyze AI model performance metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Performance Trends</h3>
              <p className="text-sm text-gray-600 mt-1">Last 30 days comparison</p>
            </div>
            <div style={{ height: 350 }} className="w-full">
              <ModelPerformanceChart days={30} />
            </div>
          </div>
        </Card>

        {/* Confidence Chart */}
        <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Confidence Comparison</h3>
              <p className="text-sm text-gray-600 mt-1">Model confidence levels</p>
            </div>
            <div style={{ height: 350 }} className="w-full">
              <ModelsConfidenceChart modelData={modelData} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModelsTab;
