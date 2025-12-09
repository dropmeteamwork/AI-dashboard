// Sidebar.jsx
import { Activity, Cpu, Flag, Box, BarChart3, Eye, Layers, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { THEME } from "./theme";
import { MachinesStatusList } from "@/components/charts/MachineCharts";

const tabs = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "machines", label: "Machines", icon: Cpu },
  { key: "flags", label: "Flags", icon: Flag },
  { key: "models", label: "Models", icon: Box },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "brands", label: "Brands", icon: Eye },
  { key: "brand_predictions", label: "Brand Predictions", icon: Layers },
  { key: "report", label: "Report", icon: FileText },
  { key: "flagged_items", label: "Flagged Items", icon: AlertTriangle },

];

const Sidebar = ({ activeTab, setActiveTab, overview, sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          sm:translate-x-0 sm:static sm:flex-shrink-0`}
        style={{
          width: 260,
          background: THEME.cardBg,
          borderRight: `1px solid ${THEME.border}`,
        }}
      >
        <div style={{ padding: 16 }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="w-full text-left px-4 py-2 rounded-lg"
                  style={{
                    background: activeTab === t.key ? THEME.primary : "transparent",
                    color: activeTab === t.key ? "#fff" : THEME.text,
                    border: activeTab === t.key ? `1px solid ${THEME.primary}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    color={activeTab === t.key ? "#fff" : THEME.primary}
                  />
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: 16, borderTop: `1px solid ${THEME.subtleBorder}` }}>
          <h3 className="text-sm font-semibold mb-2">Quick Stats</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="flex justify-between">
              <span>Total Items</span>
              <Badge>{overview.total}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Avg Confidence</span>
              <Badge>{overview.avg_confidence}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Flagged</span>
              <Badge>{overview.flagged}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Active Machines</span>
              <span>{overview.active_machines}</span>
            </div>
          </div>
        </div>

        {/* Machine List */}
        <div style={{ padding: 16 }}>
          <h3 className="text-sm font-semibold mb-2">Machines</h3>
          <MachinesStatusList />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
