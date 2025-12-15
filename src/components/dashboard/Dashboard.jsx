// Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import Header from "./HeaderResponsive";
import Sidebar from "./Sidebar";
import OverviewTab from "./tabs/OverviewTab";
import MachinesTab from "./tabs/MachinesTab";
import PredictionsTab from "./tabs/PredictionsTab";
import ModelsTab from "./tabs/ModelsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import FlagsTab from "./tabs/FlagsTab";
import BrandInsightsTab from "./tabs/BrandInsightsTab";
import BrandsTab from "./tabs/BrandsTab";
import BrandsPrediction from "./tabs/BrandsPrediction";
import ReportTab from "./tabs/ReportTab";
import FlaggedItemsTab from "./tabs/FlaggedItemsTab";
import AdminTab from "./tabs/AdminTab";
import { filterAnalyticsDataByPeriod, recalculateOverview } from "@/utils/dateFilter";


const BASE_URL = import.meta.env.VITE_API_URL || "https://web-ai-dashboard.up.railway.app";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [machines, setMachines] = useState([]);
  const [overview, setOverview] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [timePeriod, setTimePeriod] = useState("all"); // Add time period state

  const refreshAll = () => setRefreshKey((k) => k + 1);

  const fetchJson = async (endpoint, timeout = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, machinesData] = await Promise.allSettled([
          fetchJson("/ai_dashboard/analytics/"),
          fetchJson("/ai_dashboard/machines/"),
        ]).then((results) => [
          results[0].status === "fulfilled" ? results[0].value : {},
          results[1].status === "fulfilled" ? results[1].value : [],
        ]);

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

        // Calculate flagged count from flag_frequency data (more accurate)
        const flagFreq = analyticsData?.flag_frequency || [];
        const flagCount = flagFreq.length > 0 
          ? flagFreq.reduce((s, f) => s + (f.count || 0), 0)
          : (accuracy.reduce((s, c) => s + (c.flag_count || 0), 0) || analyticsData?.flagged_count || 0);

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

  // Filter analytics data based on selected time period
  const filteredAnalytics = useMemo(() => {
    if (timePeriod === "all") {
      return analytics;
    }
    
    // Apply date-based filtering for selected time period
    return filterAnalyticsDataByPeriod(analytics, timePeriod);
  }, [analytics, timePeriod]);

  // Recalculate overview based on filtered data
  const filteredOverview = useMemo(() => {
    const baseOverview = recalculateOverview(filteredAnalytics);
    return {
      ...baseOverview,
      active_machines: overview.active_machines, // Keep machines count from unfiltered data
    };
  }, [filteredAnalytics, overview.active_machines]);

  const accuracyByClass = filteredAnalytics?.accuracy_by_class || [];
  const avgConfByItem = filteredAnalytics?.avg_confidence_by_item || [];
  const flagFrequency = filteredAnalytics?.flag_frequency || [];
  const modelCompare = filteredAnalytics?.model_compare || filteredAnalytics?.predictions_by_model || [];
  const brandsSummary = filteredAnalytics?.brands_summary || [];

  const topModel = [...(filteredAnalytics?.predictions_by_model || [])].sort(
    (a, b) => b.count - a.count
  )[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8fafb" }}>
      {/* Header */}
      <Header
        refreshAll={refreshAll}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />

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
        <main className="flex-1 overflow-auto" style={{ padding: "24px", backgroundColor: "#f8fafb" }}>
          {activeTab === "overview" && (
            <OverviewTab overview={filteredOverview} topModel={topModel} />
          )}
          {activeTab === "machines" && <MachinesTab />}
          {activeTab === "predictions" && <PredictionsTab />}
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
            />
          )}
          {activeTab === "admins" && <AdminTab />}


        </main>
      </div>
    </div>
  );
};

export default Dashboard;
