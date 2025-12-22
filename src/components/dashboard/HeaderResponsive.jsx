// HeaderResponsive.jsx - Clean Header matching RVM Dashboard style
import { RefreshCcw, LogOut, Menu, Bell, X } from "lucide-react";
import { COLORS } from "@/constants/colors";
import { useState, useEffect } from "react";

const HeaderResponsive = ({ refreshAll, sidebarOpen, setSidebarOpen, timePeriod = "all", onTimePeriodChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format date like "Sun, Dec 21, 2025, 09:28 PM"
  const formatDateTime = (date) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${weekday}, ${month} ${day}, ${year}, ${time}`;
  };

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: isMobile ? "12px 16px" : "14px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Main Header Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? "8px" : "24px",
        }}
      >
        {/* LEFT - Logo, Brand Name and Date */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "14px", flex: 1, minWidth: 0 }}>
          {/* Hamburger menu for mobile */}
          {isMobile && (
            <button
              style={{
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <Menu style={{ width: 20, height: 20, color: "#6b7280" }} />
            </button>
          )}

          {/* Logo - bigger size */}
          <img
            src="/logo.png"
            alt="Drop Me Logo"
            style={{
              width: isMobile ? 44 : 64,
              height: isMobile ? 44 : 64,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          {/* Date/Time */}
          <span
            style={{
              fontSize: isMobile ? "12px" : "14px",
              color: "#6b7280",
              fontWeight: 400,
              whiteSpace: "nowrap",
              marginLeft: isMobile ? "4px" : "12px",
            }}
          >
            {formatDateTime(currentDateTime)}
          </span>
        </div>

        {/* RIGHT - Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "12px",
            flexShrink: 0,
          }}
        >
          {/* Notification Bell */}
          {!isMobile && (
            <button
              style={{
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#f3f4f6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                position: "relative",
                flexShrink: 0,
              }}
              title="Notifications"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            >
              <Bell style={{ width: 18, height: 18, color: "#6b7280" }} />
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </button>
          )}

          {/* Refresh Button */}
          {!isMobile && (
            <button
              onClick={refreshAll}
              style={{
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#f3f4f6",
                border: "none",
                color: "#374151",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              title="Refresh data"
            >
              <RefreshCcw style={{ width: 18, height: 18 }} />
            </button>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: mobileMenuOpen ? "#E8F5E9" : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              title="More options"
            >
              {mobileMenuOpen ? (
                <X style={{ width: 20, height: 20, color: "#4CAF50" }} />
              ) : (
                <Menu style={{ width: 20, height: 20, color: "#6b7280" }} />
              )}
            </button>
          )}

          {/* Logout Button */}
          {!isMobile && (
            <button
              style={{
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "#FEF2F2",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FEF2F2";
              }}
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
              }}
              title="Logout"
            >
              <LogOut style={{ width: 18, height: 18 }} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Dropdown for Refresh and Logout */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingTop: "12px",
            marginTop: "12px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={() => {
              refreshAll();
              setMobileMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "#f3f4f6",
              border: "none",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
          >
            <RefreshCcw style={{ width: 18, height: 18 }} />
            Refresh Data
          </button>

          <button
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              backgroundColor: "#FEF2F2",
              border: "none",
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default HeaderResponsive;
