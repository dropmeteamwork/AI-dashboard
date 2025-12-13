// Header.jsx
import { Monitor, RefreshCcw, LogOut, Menu, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { THEME } from "./theme";

const Header = ({ refreshAll, sidebarOpen, setSidebarOpen }) => {
  return (
    <header
      className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between"
      style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* LEFT */}
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        {/* Hamburger menu for mobile */}
        <button
          className="sm:hidden p-2 rounded-md hover:bg-gray-200 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3">
          {/* Logo Image */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6CC04A 0%, #5BA63E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(108, 192, 74, 0.3)",
            }}
          >
            <Monitor className="w-6 h-6 text-white" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">AI Dashboard</h1>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Real-time Analytics</span>
          </div>
        </div>

        {/* Badge */}
        <Badge
          className="hidden sm:flex items-center space-x-2 ml-4"
          style={{
            background: "#F6FFF2",
            border: `1px solid ${THEME.border}`,
            color: THEME.primary,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: THEME.primary,
              borderRadius: "50%",
            }}
          />
          <span>All Systems Online</span>
        </Badge>
      </div>

      {/* RIGHT */}
      <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
        {/* Notification Bell */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          className="flex items-center justify-center text-sm font-medium"
          style={{
            borderColor: "#e5e7eb",
            color: "#374151",
            backgroundColor: "#f9fafb",
          }}
        >
          <RefreshCcw className="w-4 h-4 mr-1" />
          Refresh
        </Button>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center"
          style={{ borderColor: THEME.subtleBorder }}
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
