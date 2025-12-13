// HeaderResponsive.jsx - Mobile-First Responsive Header
import { RefreshCcw, LogOut, Menu, Bell, Calendar, Search, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COLORS } from "@/constants/colors";
import { useState, useEffect } from "react";

const HeaderResponsive = ({ refreshAll, sidebarOpen, setSidebarOpen, timePeriod = "all", onTimePeriodChange }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
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
        padding: isMobile ? "12px 12px" : "16px 24px",
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
          marginBottom: isMobile ? "10px" : "12px",
        }}
      >
        {/* LEFT - Logo and Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flex: 1, minWidth: 0 }}>
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

          {/* Logo and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "14px", minWidth: 0 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: isMobile ? 36 : 48,
                height: isMobile ? 36 : 48,
                borderRadius: "10px",
                objectFit: "contain",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(108, 192, 74, 0.15)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
              <h1
                style={{
                  fontSize: isMobile ? "14px" : "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 2px 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isMobile ? "AI Dashboard" : "AI Engineer Dashboard"}
              </h1>
              <span
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#9ca3af",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isMobile ? "Analytics" : "Real-time Analytics"}
              </span>
            </div>
          </div>

          {/* Status Badge - Hidden on Mobile */}
          {!isMobile && (
            <Badge
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #f6fff2 100%)",
                border: `2px solid ${COLORS.PRIMARY}`,
                color: COLORS.PRIMARY,
                display: "flex",
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
          )}
        </div>

        {/* RIGHT - Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "4px" : "12px",
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
              padding: "8px 10px",
              border: "1px solid #e5e7eb",
              transition: "all 0.2s ease",
              width: searchOpen ? (isMobile ? "100px" : "180px") : "0",
              overflow: "hidden",
            }}
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
                fontSize: "12px",
                color: "#111827",
                width: "100%",
              }}
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
              flexShrink: 0,
            }}
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search"
            onMouseEnter={(e) => !searchOpen && (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => !searchOpen && (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Search style={{ width: 18, height: 18, color: searchOpen ? COLORS.PRIMARY : "#6b7280" }} />
          </button>

          {/* Notification Bell */}
          {!isMobile && (
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
                flexShrink: 0,
              }}
              title="Notifications"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Bell style={{ width: 18, height: 18, color: "#6b7280" }} />
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
          )}

          {/* Refresh Button - Hidden on Mobile */}
          {!isMobile && (
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
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
              title="Refresh data"
            >
              <RefreshCcw style={{ width: 16, height: 16 }} />
              {!isTablet && "Refresh"}
            </button>
          )}

          {/* Mobile/Tablet Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: mobileMenuOpen ? "#f0fdf4" : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              title="More options"
              onMouseEnter={(e) => !mobileMenuOpen && (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => !mobileMenuOpen && (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {mobileMenuOpen ? (
                <X style={{ width: 20, height: 20, color: COLORS.PRIMARY }} />
              ) : (
                <Menu style={{ width: 20, height: 20, color: "#6b7280" }} />
              )}
            </button>
          )}

          {/* Logout Button - Hidden on Mobile */}
          {!isMobile && (
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
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
                e.currentTarget.style.borderColor = "#fecaca";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
              }}
              title="Logout"
            >
              <LogOut style={{ width: 16, height: 16 }} />
              {!isTablet && "Logout"}
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
            paddingTop: "8px",
            borderTop: "1px solid #e5e7eb",
            marginTop: "8px",
          }}
        >
          <button
            onClick={() => {
              refreshAll();
              setMobileMenuOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
          >
            <RefreshCcw style={{ width: 16, height: 16 }} />
            Refresh Data
          </button>

          <button
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Logout
          </button>
        </div>
      )}

      {/* Secondary Row - Time Period Dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingLeft: isMobile ? "0px" : "62px",
          position: "relative",
          flexWrap: "wrap",
        }}
      >
        {!isMobile && <Clock style={{ width: 18, height: 18, color: "#9ca3af" }} />}
        <span style={{ fontSize: isMobile ? "12px" : "13px", color: "#6b7280", fontWeight: 600 }}>
          {isMobile ? "Period:" : "Period:"}
        </span>

        {/* Dropdown Button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: `1.5px solid ${COLORS.PRIMARY}`,
              backgroundColor: "#f0fdf4",
              color: COLORS.PRIMARY,
              fontSize: isMobile ? "12px" : "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = "#e8f9e1";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 192, 74, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile && !dropdownOpen) {
                e.currentTarget.style.backgroundColor = "#f0fdf4";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {!isMobile && <Calendar style={{ width: 16, height: 16 }} />}
            <span>{isMobile ? currentPeriod.split(" ")[0] : currentPeriod}</span>
            <svg
              style={{
                width: 14,
                height: 14,
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
                minWidth: "150px",
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
                    padding: "10px 14px",
                    border: "none",
                    backgroundColor: timePeriod === period.value ? "#f0fdf4" : "white",
                    color: timePeriod === period.value ? COLORS.PRIMARY : "#374151",
                    fontSize: "12px",
                    fontWeight: timePeriod === period.value ? 600 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderBottom: index < timePeriods.length - 1 ? "1px solid #f3f4f6" : "none",
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
                  <Calendar style={{ width: 14, height: 14 }} />
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

export default HeaderResponsive;
