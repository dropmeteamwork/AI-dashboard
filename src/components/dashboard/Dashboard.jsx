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
import ReportTab from "./tabs/ReportTab";
import FlaggedItemsTab from "./tabs/FlaggedItemsTab";


const BASE_URL = import.meta.env.VITE_API_URL || "https://web-ai-dashboard.up.railway.app";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [machines, setMachines] = useState([]);
  const [overview, setOverview] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

  const refreshAll = () => setRefreshKey((k) => k + 1);

  const fetchJson = async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const analyticsData = await fetchJson("/ai_dashboard/analytics/");
        const machinesData = await fetchJson("/ai_dashboard/machines/");

        setAnalytics(analyticsData);
        setMachines(machinesData);

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header refreshAll={refreshAll} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - responsive */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          overview={overview}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {activeTab === "overview" && (
            <OverviewTab overview={overview} topModel={topModel} />
          )}
          {activeTab === "machines" && <MachinesTab />}
          {activeTab === "flags" && <FlagsTab flagFrequency={flagFrequency} />}
          {activeTab === "flagged_items" && <FlaggedItemsTab />}

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

          {activeTab === "report" && (
 
        <ReportTab
          overview={overview}
          topModel={topModel}
          accuracyByClass={accuracyByClass}
          avgConfByItem={avgConfByItem}
          brandsSummary={brandsSummary}
          modelCompare={modelCompare}
          flagFrequency={flagFrequency}
          // decisionDuration={decisionDuration}
          // histogram={histogram}
        />
      )}


        </main>
      </div>
    </div>
  );
};

export default Dashboard;
