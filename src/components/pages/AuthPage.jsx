import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

const PRIMARY_GREEN = "#6CC04A";
const LIGHT_GREEN = "#EAF7DA";

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

  const [isLogin, setIsLogin] = useState(!forceRegister);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await postJson("/ai_dashboard/dashboard-admin/register/", {
        username,
        email,
        password,
      });

      setSuccess("Registration successful! You can now log in.");
      setIsLogin(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div
        className="shadow-2xl w-full max-w-xl rounded-2xl p-10 border"
        style={{ background: "white", borderColor: "#E5E7EB" }}
      >
        {/* Toggle Buttons */}
        <div className="flex mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-3 font-semibold rounded-l-xl transition-all"
            style={{
              backgroundColor: isLogin ? PRIMARY_GREEN : "#E5E7EB",
              color: isLogin ? "white" : "#374151",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-3 font-semibold rounded-r-xl transition-all"
            style={{
              backgroundColor: !isLogin ? PRIMARY_GREEN : "#E5E7EB",
              color: !isLogin ? "white" : "#374151",
            }}
          >
            Register
          </button>
        </div>

        {/* Page Title */}
        <h2
          className="text-3xl font-extrabold text-center mb-6"
          style={{ color: PRIMARY_GREEN }}
        >
          {isLogin ? "Welcome Back!" : "Create Admin Account"}
        </h2>

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="flex flex-col"
        >
          {/* Username */}
          <div className="mb-5">
            <label className="font-semibold mb-1 block text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter username"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: "#D1D5DB" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email - only register */}
          {!isLogin && (
            <div className="mb-5">
              <label className="font-semibold mb-1 block text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: "#D1D5DB" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Password */}
          <div className="mb-5">
            <label className="font-semibold mb-1 block text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: "#D1D5DB" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium"
              style={{ background: LIGHT_GREEN, color: PRIMARY_GREEN }}
            >
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-all"
            style={{
              backgroundColor: PRIMARY_GREEN,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
