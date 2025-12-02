// Header.jsx
import { Monitor, Bell, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { THEME } from "./theme";

const Header = ({ refreshAll }) => {
  return (
    <header
      className="px-6 py-4"
      style={{ background: THEME.pageBg, borderBottom: `1px solid ${THEME.border}` }}
    >
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center space-x-4">
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
            <div>
              <h1 className="text-xl font-semibold">AI Engineer Dashboard</h1>
              <div style={{ fontSize: 12, color: THEME.muted }}>Sustainability Insights</div>
            </div>
          </div>

          <Badge
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
                marginRight: 8,
              }}
            />
            All Systems Online
          </Badge>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            style={{ borderColor: THEME.subtleBorder }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            style={{ borderColor: THEME.subtleBorder }}
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
