import React, { useState } from "react";
import { useNavigate } from "react-router";

const DROP_ME_GREEN = "#6CC04A";
const LIGHT_GREEN = "#EAF7DA";

// Correct API Base (from .env)
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// Unified helper for POST
async function postJson(endpoint, payload) {
  // Ensure final URL = BASE + endpoint
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
    throw new Error(
      data?.error ||
      data?.message ||
      `Request failed — Status ${res.status}`
    );
  }

  return data;
}

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = isLogin
      ? { username, password }
      : { username, email, password };

    try {
      const data = await postJson(
        isLogin
          ? "/ai_dashboard/dashboard-admin/login/"
          : "/ai_dashboard/dashboard-admin/register/",
        payload
      );

      if (isLogin) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        setSuccess("Login successful! Redirecting...");

        setTimeout(() => navigate("/app/overview"), 700);
      } else {
        setSuccess("Registration successful! You can now log in.");
        setIsLogin(true);
        setEmail("");
        setPassword("");
      }
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
        style={{
          background: "white",
          borderColor: "#E5E7EB",
        }}
      >
        {/* Toggle Buttons */}
        <div className="flex mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-3 font-semibold rounded-l-xl transition-all"
            style={{
              backgroundColor: isLogin ? DROP_ME_GREEN : "#E5E7EB",
              color: isLogin ? "white" : "#374151",
            }}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-3 font-semibold rounded-r-xl transition-all"
            style={{
              backgroundColor: !isLogin ? DROP_ME_GREEN : "#E5E7EB",
              color: !isLogin ? "white" : "#374151",
            }}
          >
            Register
          </button>
        </div>

        {/* Page Title */}
        <h2
          className="text-3xl font-extrabold text-center mb-6"
          style={{ color: DROP_ME_GREEN }}
        >
          {isLogin ? "Welcome Back!" : "Create Admin Account"}
        </h2>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col">
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

          {/* Email (Register only) */}
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

          {/* Error */}
          {error && (
            <div
              className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium"
              style={{ background: LIGHT_GREEN, color: DROP_ME_GREEN }}
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
              backgroundColor: DROP_ME_GREEN,
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
