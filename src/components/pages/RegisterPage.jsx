import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const PRIMARY_GREEN = "#6CC04A";
const LIGHT_GREEN = "#EAF7DA";
const REGISTER_BLUE = "#2563EB";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

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
    throw new Error(
      data?.error || data?.message || `Request failed — Status ${res.status}`
    );
  }

  return data;
}

export default function AuthPage({ forceRegister = false }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState(""); // New field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [canRegister, setCanRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setCanRegister(true);
  }, []);

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
      setTimeout(() => navigate("/app/overview"), 700);
    } catch (err) {
      setError(err.message || "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canRegister) {
      setError("You are not authorized to register a new admin.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await postJson("/ai_dashboard/dashboard-admin/register/", {
        username,
        password,
      });

      setSuccess("Admin account created successfully!");
      setUsername("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setError(err.message || "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="shadow-2xl w-full max-w-md rounded-2xl p-10 border" style={{ background: "white", borderColor: "#E5E7EB" }}>
        <h2 className="text-3xl font-extrabold text-center mb-6" style={{ color: PRIMARY_GREEN }}>
          {forceRegister ? "Create Admin Account" : "AI Analytics Dashboard"}
        </h2>

        <form
          onSubmit={forceRegister ? handleRegister : handleLogin}
          className="flex flex-col"
        >
          {/* Username */}
          <div className="mb-5">
            <label className="font-semibold mb-1 block text-gray-700">Username</label>
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

          {/* Password */}
          <div className="mb-5">
            <label className="font-semibold mb-1 block text-gray-700">Password</label>
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

          {/* Confirm Password (only on register) */}
          {forceRegister && (
            <div className="mb-5">
              <label className="font-semibold mb-1 block text-gray-700">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Enter password again"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ borderColor: "#D1D5DB" }}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          )}

          {error && <div className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium" style={{ background: "#FEE2E2", color: "#B91C1C" }}>{error}</div>}
          {success && <div className="w-full text-sm text-center py-2 mb-4 rounded-xl font-medium" style={{ background: LIGHT_GREEN, color: PRIMARY_GREEN }}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white shadow-md transition-all mb-3"
            style={{
              backgroundColor: forceRegister ? REGISTER_BLUE : PRIMARY_GREEN,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : forceRegister ? "Register" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
