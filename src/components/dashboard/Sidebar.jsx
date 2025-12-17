// Sidebar.jsx
import { Activity, Cpu, Flag, Box, BarChart3, Eye, Layers, FileText, AlertTriangle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { THEME } from "./theme";

const tabs = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "machines", label: "Machines", icon: Cpu },
  { key: "predictions", label: "Predictions", icon: Flag },
  { key: "flags", label: "Flags", icon: Flag },
  { key: "models", label: "Models", icon: Box },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "brands", label: "Brands Predictions", icon: Eye },
  { key: "report", label: "Report", icon: FileText },
  { key: "flagged_items", label: "Flagged Items", icon: AlertTriangle },
  { key: "admins", label: "Admins", icon: Users },

];

const Sidebar = ({ activeTab, setActiveTab, overview, sidebarOpen, setSidebarOpen, machines = [] }) => {
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
          width: 280,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "24px 16px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key);
                    setSidebarOpen(false); // Close sidebar on mobile
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm"
                  style={{
                    background: isActive ? "#f0fdf4" : "transparent",
                    color: isActive ? "#16a34a" : "#4b5563",
                    borderLeft: isActive ? "3px solid #6CC04A" : "none",
                    paddingLeft: isActive ? "13px" : "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    color={isActive ? "#6CC04A" : "#9ca3af"}
                  />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: "20px 16px", borderTop: "1px solid #e5e7eb", margin: "0 16px" }}>
          <h3 className="text-xs font-bold mb-3 text-gray-900" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Quick Stats
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Total Items", value: overview.total, color: "#6CC04A" },
              { label: "Confidence", value: `${overview.avg_confidence}%`, color: "#3b82f6" },
              { label: "Flagged", value: overview.flagged, color: "#ef4444" },
              { label: "Machines", value: overview.active_machines, color: "#8b5cf6" },
            ].map((stat, idx) => (
              <div key={idx} style={{ padding: "10px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: stat.color, marginTop: "4px" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine List */}
        <div style={{ padding: 16 }}>
          <h3 className="text-sm font-semibold mb-2">Machines</h3>
          {machines && machines.length > 0 ? (
            <div className="space-y-2">
              {machines.map((m, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${m.online ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-sm font-medium text-gray-800">
                      {(m.machine_name || m.name || "Unknown").replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {m.online ? "Online" : "Offline"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No machines available</p>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
