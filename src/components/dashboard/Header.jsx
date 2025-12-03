// Header.jsx
import { Monitor, Bell, Settings, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { THEME } from "./theme";

const Header = ({ refreshAll, sidebarOpen, setSidebarOpen }) => {
  return (
    <header
      className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border-b"
      style={{ background: THEME.pageBg, borderBottom: `1px solid ${THEME.border}` }}
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
          <div
            style={{
              width: 44,
              height: 44,
              background: THEME.primary,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: THEME.boxShadow,
            }}
          >
            <Monitor className="w-5 h-5" color="#fff" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-semibold">AI Analytics Dashboard</h1>
            <span style={{ fontSize: 12, color: THEME.muted }}>Sustainability Insights</span>
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
      <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          className="flex items-center justify-center"
          style={{ borderColor: THEME.subtleBorder }}
        >
          <Bell className="w-4 h-4 mr-1" />
          Refresh
        </Button>

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
          <Settings className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
