// Header.jsx
import { RefreshCcw, LogOut, Menu, Bell, Calendar, Search, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { THEME } from "./theme";
import { COLORS } from "@/constants/colors";
import { useState, useEffect } from "react";

const Header = ({ refreshAll, sidebarOpen, setSidebarOpen, timePeriod = "all", onTimePeriodChange }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const timePeriods = [
    { value: "day", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  const currentPeriod = timePeriods.find(p => p.value === timePeriod)?.label || "All Time";

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        padding: isMobile ? "12px 16px" : "16px 24px",
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
          marginBottom: isMobile ? "8px" : "12px",
        }}
      >
        {/* LEFT - Logo and Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flex: 1, minWidth: 0 }}>
          {/* Hamburger menu for mobile */}
          <button
            style={{
              display: isMobile ? "flex" : "none",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu style={{ width: 20, height: 20, color: "#6b7280" }} />
          </button>

          {/* Logo and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="AI Engineer Dashboard Logo"
              style={{
                width: 100,
                height: 100,
                borderRadius: "10px",
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(108, 192, 74, 0.15)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 2px 0",
                  whiteSpace: "nowrap",
                }}
              >
                AI Engineer Dashboard
              </h1>
              <span
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                Real-time Analytics & Monitoring
              </span>
            </div>
          </div>

          {/* Status Badge - Enhanced */}
          <Badge
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #f6fff2 100%)",
              border: `2px solid ${COLORS.PRIMARY}`,
              color: COLORS.PRIMARY,
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              marginLeft: "16px",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(108, 192, 74, 0.1)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                background: COLORS.PRIMARY,
                borderRadius: "50%",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <span>LIVE</span>
          </Badge>
        </div>

        {/* RIGHT - Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "6px" : "12px",
            flexShrink: 0,
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              transition: "all 0.2s ease",
              width: searchOpen ? (isMobile ? "120px" : "200px") : "0",
              overflow: "hidden",
            }}
            onFocus={() => setSearchOpen(true)}
          >
            <Search style={{ width: 16, height: 16, color: "#9ca3af", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                color: "#111827",
                width: "100%",
              }}
              onBlur={() => searchOpen || setSearchOpen(false)}
            />
          </div>

          {/* Search Icon Button */}
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: searchOpen ? "#f0fdf4" : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => !searchOpen && (e.target.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => !searchOpen && (e.target.style.backgroundColor = "transparent")}
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search"
          >
            <Search style={{ width: 20, height: 20, color: searchOpen ? COLORS.PRIMARY : "#6b7280" }} />
          </button>

          {/* Notification Bell */}
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            title="Notifications"
          >
            <Bell style={{ width: 20, height: 20, color: "#6b7280" }} />
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
              }}
            />
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshAll}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
              e.target.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.borderColor = "#e5e7eb";
            }}
            title="Refresh data"
          >
            <RefreshCcw style={{ width: 16, height: 16 }} />
            Refresh
          </button>

          {/* Logout Button */}
          <button
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fef2f2";
              e.target.style.borderColor = "#fecaca";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "#e5e7eb";
            }}
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
            title="Logout"
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Logout
          </button>
        </div>
      </div>

      {/* Secondary Row - Time Period Dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingLeft: "62px", // Align with logo
          position: "relative",
        }}
      >
        <Clock style={{ width: 18, height: 18, color: "#9ca3af" }} />
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>Period:</span>

        {/* Dropdown Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1.5px solid ${COLORS.PRIMARY}`,
              backgroundColor: "#f0fdf4",
              color: COLORS.PRIMARY,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8f9e1";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 192, 74, 0.2)";
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.backgroundColor = "#f0fdf4";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <Calendar style={{ width: 16, height: 16 }} />
            {currentPeriod}
            <svg
              style={{
                width: 16,
                height: 16,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "8px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                minWidth: "180px",
                overflow: "hidden",
              }}
            >
              {timePeriods.map((period, index) => (
                <button
                  key={period.value}
                  onClick={() => {
                    onTimePeriodChange?.(period.value);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    backgroundColor:
                      timePeriod === period.value ? "#f0fdf4" : "white",
                    color:
                      timePeriod === period.value ? COLORS.PRIMARY : "#374151",
                    fontSize: "13px",
                    fontWeight: timePeriod === period.value ? 600 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom:
                      index < timePeriods.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      timePeriod === period.value ? "#f0fdf4" : "white";
                  }}
                >
                  <Calendar style={{ width: 16, height: 16 }} />
                  <span>{period.label}</span>
                  {timePeriod === period.value && (
                    <span
                      style={{
                        marginLeft: "auto",
                        width: "6px",
                        height: "6px",
                        backgroundColor: COLORS.PRIMARY,
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
