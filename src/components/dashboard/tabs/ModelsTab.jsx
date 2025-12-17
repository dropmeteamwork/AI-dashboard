// ModelsTab.jsx
import { Card } from "@/components/ui/card";
import { ModelPerformanceChart, ModelsConfidenceChart } from "@/components/charts/ModelsCharts";
import { Brain } from "lucide-react";

const ModelsTab = () => {
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
            <div style={{ minHeight: 450 }} className="w-full">
              <ModelsConfidenceChart />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModelsTab;
