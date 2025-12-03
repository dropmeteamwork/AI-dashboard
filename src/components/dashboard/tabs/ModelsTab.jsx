// ModelsTab.jsx
import { THEME } from "../theme";
import { ModelPerformanceChart, ModelsConfidenceChart } from "@/components/charts/ModelsCharts";

const ModelsTab = () => {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
      {/* Performance */}
      <div
        className="rounded-2xl p-4"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
        }}
      >
        <h3 className="font-semibold mb-2">Model Performance (30 days)</h3>
        <ModelPerformanceChart days={30} />
      </div>

      {/* Confidence Compare */}
      <div
        className="rounded-2xl p-4"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
        }}
      >
        <h3 className="font-semibold mb-2">Model Confidence</h3>
        <ModelsConfidenceChart />
      </div>
    </div>
  );
};

export default ModelsTab;
