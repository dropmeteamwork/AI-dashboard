// ModelsTab.jsx
import { THEME } from "../theme";
import { ModelPerformanceChart, ModelsConfidenceChart } from "@/components/charts/ModelsCharts";

const ModelsTab = () => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Performance */}
      <div
        className="rounded-2xl"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
          padding: 16,
        }}
      >
        <h3 className="font-semibold mb-2">Model Performance (30 days)</h3>
        <ModelPerformanceChart days={30} />
      </div>

      {/* Confidence Compare */}
      <div
        className="rounded-2xl"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
          padding: 16,
        }}
      >
        <h3 className="font-semibold mb-2">Model Confidence</h3>
        <ModelsConfidenceChart />
      </div>
    </div>
  );
};

export default ModelsTab;
