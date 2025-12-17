import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Check, X, Loader2, ShieldCheck, Users } from "lucide-react";
import { COLORS } from "@/constants/colors";

const AdminTab = () => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    type: "Admin",
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "https://web-ai-dashboard.up.railway.app";

  const USER_TYPES = [
    { value: "Admin", label: "Administrator - Full access to all endpoints" },
    { value: "Machine owner", label: "Machine Owner - Access to machine and overview endpoints" },
  ];

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available. Please log in again.");
    }

    const res = await fetch(`${API_BASE}/ai_dashboard/dashboard-admin/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      // Refresh token also expired - need to re-login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw new Error("Session expired. Please log in again.");
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  };

  // Register new admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setSubmitting(false);
      return;
    }

    try {
      let token = localStorage.getItem("access_token");
      
      const payload = {
        username: formData.username,
        email: formData.email || null,
        password: formData.password,
        phone_number: formData.phone_number || null,
        type: formData.type,
      };

      // Helper function to make the API call
      const makeRequest = async (accessToken) => {
        return await fetch(`${API_BASE}/ai_dashboard/dashboard-admin/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify(payload),
        });
      };

      let res = await makeRequest(token);

      // If token expired (401), try to refresh and retry
      if (res.status === 401) {
        try {
          token = await refreshAccessToken();
          res = await makeRequest(token);
        } catch (refreshErr) {
          throw new Error(refreshErr.message);
        }
      }

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from Django
        if (data.username) throw new Error(`Username: ${Array.isArray(data.username) ? data.username.join(", ") : data.username}`);
        if (data.email) throw new Error(`Email: ${Array.isArray(data.email) ? data.email.join(", ") : data.email}`);
        if (data.password) throw new Error(`Password: ${Array.isArray(data.password) ? data.password.join(", ") : data.password}`);
        if (data.detail) throw new Error(data.detail);
        if (data.error) throw new Error(data.error);
        throw new Error("Failed to register admin");
      }

      setSuccessMessage(`Admin "${formData.username}" registered successfully!`);
      // Clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
        type: "Admin",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      type: "Admin",
    });
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6" style={{ color: COLORS.PRIMARY }} />
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
        </div>
        <p className="text-gray-600">Register new dashboard administrator accounts</p>
      </div>

      {/* Centered Form Container */}
      <div className="flex justify-center">
        {/* Registration Form Card */}
        <Card className="w-full max-w-md p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="h-5 w-5" style={{ color: COLORS.PRIMARY }} />
            <h3 className="text-lg font-semibold text-gray-900">Register New Admin</h3>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Username *
            </label>
            <Input
              type="text"
              required
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={submitting}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Password *
            </label>
            <Input
              type="password"
              required
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={submitting}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm Password *
            </label>
            <Input
              type="password"
              required
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              disabled={submitting}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              disabled={submitting}
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              User Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {USER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Determines which dashboard endpoints this user can access
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 gap-2 text-white"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Register Admin
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              variant="outline"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </form>
      </Card>
      </div>

      {/* Info Card - Centered */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md p-4 border border-blue-200 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">User Type Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Administrator:</strong> Full access to all dashboard endpoints and features</li>
            <li><strong>Machine Owner:</strong> Limited access to machine monitoring and overview data</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AdminTab;
