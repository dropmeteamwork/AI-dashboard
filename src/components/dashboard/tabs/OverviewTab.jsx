// OverviewTab.jsx
import KPI from "../KPI";
import { THEME } from "../theme";
import { RecentPredictionsTimeline } from "@/components/charts/PredictionsCharts";

const OverviewTab = ({ overview, topModel }) => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Data Flow Architecture</h2>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <KPI title="Total Items Processed" value={overview.total} />
        <KPI title="Average Confidence" value={`${overview.avg_confidence}%`} />
        <KPI title="Flagged Items" value={overview.flagged} />
        <KPI title="Top Model" value={topModel?.model_used || "—"} />
      </div>

      {/* Recent Predictions */}
      <div
        className="rounded-2xl p-4"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
        }}
      >
        <h3 className="text-lg font-semibold mb-2">Recent Predictions</h3>
        <RecentPredictionsTimeline />
      </div>
    </div>
  );
};

export default OverviewTab;
