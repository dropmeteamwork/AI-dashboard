// Sidebar.jsx - Matching RVM Dashboard Style
import { 
  LayoutGrid, 
  MapPin,
  Users, 
  BarChart2, 
  Cpu, 
  TrendingUp, 
  ArrowLeftRight, 
  ShieldCheck, 
  Settings, 
  Database, 
  FileText,
  MessageSquare,
  AlertTriangle,
  Box,
  Eye,
  UserCog,
  PieChart
} from "lucide-react";
import { THEME } from "./theme";

// Dashboard section tabs - Updated per supervisor feedback
const dashboardTabs = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "predictions", label: "Predictions", icon: TrendingUp },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "brands", label: "Brands Predictions", icon: Eye },
  { key: "brands_analytics", label: "Brands Analytics", icon: PieChart },
  { key: "flags", label: "Flags", icon: AlertTriangle },
];

// Management section tabs - Only Report remains
const managementTabs = [
  { key: "report", label: "Reports", icon: FileText },
];

const Sidebar = ({ activeTab, setActiveTab, overview, sidebarOpen, setSidebarOpen, machines = [] }) => {
  
  const renderNavButton = (t) => {
    const Icon = t.icon;
    const isActive = activeTab === t.key;
    return (
      <button
        key={t.key}
        onClick={() => {
          setActiveTab(t.key);
          setSidebarOpen(false);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 18px",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          fontWeight: isActive ? "500" : "400",
          fontSize: "15px",
          background: isActive ? "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)" : "transparent",
          color: isActive ? "white" : "#4b5563",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: isActive ? "0 2px 8px rgba(76, 175, 80, 0.3)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <Icon
          style={{ 
            width: "20px", 
            height: "20px", 
            flexShrink: 0,
            color: isActive ? "white" : "#6b7280",
            strokeWidth: 1.75,
          }}
        />
        <span>{t.label}</span>
      </button>
    );
  };

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
          width: 240,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "20px 16px" }}>
          {/* DASHBOARD Section */}
          <div style={{ marginBottom: "24px" }}>
            <h3 
              style={{ 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#9ca3af", 
                textTransform: "uppercase", 
                letterSpacing: "0.8px",
                marginBottom: "12px",
                paddingLeft: "16px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Dashboard
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {dashboardTabs.map((t) => renderNavButton(t))}
            </nav>
          </div>

          {/* MANAGEMENT Section */}
          <div>
            <h3 
              style={{ 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#9ca3af", 
                textTransform: "uppercase", 
                letterSpacing: "0.8px",
                marginBottom: "12px",
                paddingLeft: "16px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Management
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {managementTabs.map((t) => renderNavButton(t))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
