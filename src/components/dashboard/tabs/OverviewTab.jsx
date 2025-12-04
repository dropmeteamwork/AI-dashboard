// OverviewTab.jsx
import KPI from "../KPI";
import { THEME } from "../theme";
import { RecentPredictionsTimeline } from "@/components/charts/PredictionsCharts";

const OverviewTab = ({ overview, topModel }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="text-2xl font-bold">Data Flow Architecture</h2>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        <KPI title="Total Items Processed" value={overview.total} />
        <KPI title="Average Confidence" value={`${overview.avg_confidence}%`} />
        <KPI title="Flagged Items" value={overview.flagged} />
        <KPI title="Top Model" value={topModel?.model_used || "—"} />
      </div>

      {/* Recent Predictions */}
      {/* <div
        className="rounded-2xl"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
          padding: 16,
        }}
      >
        <h3 className="text-lg font-semibold mb-2">Recent Predictions</h3>
        <RecentPredictionsTimeline />
      </div> */}
    </div>
  );
};

export default OverviewTab;
