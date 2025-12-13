// FlagsTab.jsx
import { Card } from "@/components/ui/card";
import { FlagFrequencyChart } from "../../charts/ChartsAnalytics.jsx";
import { AlertCircle } from "lucide-react";

const FlagsTab = ({ flagFrequency }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Flag Frequency Analysis</h2>
        </div>
        <p className="text-gray-600">Track which flags occur most frequently in your detections</p>
      </div>

      {/* Chart Card */}
      <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Flag Distribution</h3>
            <p className="text-sm text-gray-600">Overview of flagged items by category</p>
          </div>
          <div style={{ height: 400 }} className="w-full">
            <FlagFrequencyChart data={flagFrequency} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FlagsTab;
