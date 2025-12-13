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
      className="min-h-screen flex justify-center items-center px-4"
      style={{
        background: `linear-gradient(135deg, #C6EF9A 0%, #A8D77D 25%, #E8E4B8 50%, #F4D9A6 75%, #E6C8A0 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ backgroundColor: "white" }}
        >
          {/* Logo/Title */}
          <h1
            className="text-3xl font-bold text-center mb-8"
            style={{ color: PRIMARY_GREEN }}
          >
            Login
          </h1>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all duration-200"
              style={{
                backgroundColor: PRIMARY_GREEN,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
