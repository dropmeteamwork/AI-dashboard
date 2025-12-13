import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { COLORS } from "@/constants/colors";

const PRIMARY_GREEN = COLORS.PRIMARY;
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// Unified POST helper
async function postJson(endpoint, payload) {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed — Status ${res.status}`);
  }

  return data;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const forceRegister = searchParams.get("register") === "true";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await postJson("/ai_dashboard/dashboard-admin/login/", {
        username,
        password,
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/app/overview"), 800);
    } catch (err) {
      setError(err.message || "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      style={{
        backgroundColor: "#f8fafb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Card Container */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
          maxWidth: "420px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            backgroundColor: "#f8fafb",
            borderBottom: "1px solid #e5e7eb",
            padding: "40px 32px 32px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <img
            src="/logo.png"
            alt="AI Analytics Dashboard Logo"
            style={{
              width: 64,
              height: 64,
              marginBottom: 24,
              display: "block",
              margin: "0 auto 24px",
            }}
          />

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 8px 0",
              letterSpacing: "-0.5px",
            }}
          >
            AI Analytics
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            Dashboard Administrator Login
          </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: "32px" }}>
          {/* Error Alert */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #dcfce7",
                color: "#166534",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  color: "#111827",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY_GREEN;
                  e.target.style.boxShadow = `0 0 0 3px rgba(108, 192, 74, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  color: "#111827",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PRIMARY_GREEN;
                  e.target.style.boxShadow = `0 0 0 3px rgba(108, 192, 74, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px 16px",
                backgroundColor: loading ? PRIMARY_GREEN : PRIMARY_GREEN,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.85 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = COLORS.DARK;
                  e.target.style.boxShadow = "0 8px 16px rgba(108, 192, 74, 0.3)";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = PRIMARY_GREEN;
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
              textAlign: "center",
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            Secure Login • AI Analytics Dashboard
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
