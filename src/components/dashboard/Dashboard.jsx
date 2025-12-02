// Dashboard.jsx
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import OverviewTab from "./tabs/OverviewTab";
import MachinesTab from "./tabs/MachinesTab";
import ModelsTab from "./tabs/ModelsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import FlagsTab from "./tabs/FlagsTab";
import BrandInsightsTab from "./tabs/BrandInsightsTab"; 
import BrandsTab from "./tabs/BrandsTab";
import BrandsPrediction from "./tabs/BrandsPrediction";

import { fetchJson } from "./utils";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [machines, setMachines] = useState([]);
  const [overview, setOverview] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const refreshAll = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const load = async () => {
      try {
        const analyticsData = await fetchJson("/api/analytics/");
        const machinesData = await fetchJson("/api/machines/");

        setAnalytics(analyticsData);
        setMachines(machinesData);

        // Overview calculations
        const accuracy = analyticsData?.accuracy_by_class || [];
        const total = accuracy.reduce((s, c) => s + (c.total || 0), 0);
        const accepted = accuracy.reduce((s, c) => s + (c.accepted || 0), 0);
        const rejected = accuracy.reduce((s, c) => s + (c.rejected || 0), 0);

        const avgArr = analyticsData?.avg_confidence_by_item || [];
        const avg =
          avgArr.length > 0
            ? avgArr.reduce((s, c) => s + (c.avg_conf || c.avg_confidence || 0), 0) /
              avgArr.length
            : 0;

        const flagCount =
          accuracy.reduce((s, c) => s + (c.flag_count || 0), 0) ||
          analyticsData?.flagged_count ||
          0;

        setOverview({
          total,
          accepted,
          rejected,
          avg_confidence: Math.round(avg * 1000) / 10,
          flagged: flagCount,
          active_machines: `${machinesData.filter((m) => m.online).length}/${machinesData.length}`,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    load();
  }, [refreshKey]);

  const accuracyByClass = analytics?.accuracy_by_class || [];
  const avgConfByItem = analytics?.avg_confidence_by_item || [];
  const flagFrequency = analytics?.flag_frequency || [];
  const modelCompare = analytics?.model_compare || analytics?.predictions_by_model || [];
  const brandsSummary = analytics?.brands_summary || [];

  const topModel = [...(analytics?.predictions_by_model || [])].sort(
    (a, b) => b.count - a.count
  )[0];

  return (
    <div className="min-h-screen">
      <Header refreshAll={refreshAll} />

      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          overview={overview}
        />

        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <OverviewTab overview={overview} topModel={topModel} />
          )}

          {activeTab === "machines" && <MachinesTab />}

          {activeTab === "flags" && <FlagsTab flagFrequency={flagFrequency} />}

          {activeTab === "models" && <ModelsTab />}

          {activeTab === "analytics" && (
            <AnalyticsTab
              accuracyByClass={accuracyByClass}
              avgConfByItem={avgConfByItem}
              brandsSummary={brandsSummary}
              modelCompare={modelCompare}
              flagFrequency={flagFrequency}
              decisionDuration={analytics?.decision_duration_by_item || []}
              histogram={analytics?.avg_confidence_by_item || []}
            />
          )}

          {activeTab === "brand_insights" && (
            <BrandInsightsTab brandsSummary={brandsSummary} />
          )}

          {activeTab === "brands" && (
            <BrandsTab
              brandsSummary={brandsSummary}
              accuracyByClass={accuracyByClass}
              avgConfByItem={avgConfByItem}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
            />
          )}

          {activeTab === "brand_predictions" && (
            <BrandsPrediction
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
