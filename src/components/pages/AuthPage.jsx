import React, { useState } from "react";
import { useNavigate } from "react-router";

const DROP_ME_GREEN = "#6CC04A";
const LIGHT_GREEN = "#EAF7DA";
const API_BASE = import.meta.env.VITE_API_URL;

async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Something went wrong.");
  return data;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError(err.message || "Network error — please check your connection.");
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
        className="shadow-2xl w-full max-w-md rounded-2xl p-10 border"
        style={{ background: "white", borderColor: "#E5E7EB" }}
      >
        <h2
          className="text-3xl font-extrabold text-center mb-6"
          style={{ color: DROP_ME_GREEN }}
        >
          Welcome Back!
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col">
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
            style={{ backgroundColor: DROP_ME_GREEN, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
