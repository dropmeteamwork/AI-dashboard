import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Users, Check, X, Loader2 } from "lucide-react";
import { COLORS } from "@/constants/colors";

const AdminTab = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "https://web-ai-dashboard.up.railway.app";

  // Fetch admins
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/ai_dashboard/dashboard-admin/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create/Update admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const endpoint = editingId
        ? `${API_BASE}/ai_dashboard/dashboard-admin/${editingId}/`
        : `${API_BASE}/ai_dashboard/dashboard-admin/`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save admin");

      await fetchAdmins();
      setShowDialog(false);
      setEditingId(null);
      setFormData({ username: "", email: "", password: "", phone_number: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/ai_dashboard/dashboard-admin/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete admin");

      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ username: "", email: "", password: "", phone_number: "" });
    setShowDialog(true);
  };

  const openEditDialog = (admin) => {
    setEditingId(admin.id);
    setFormData({
      username: admin.username,
      email: admin.email || "",
      password: "",
      phone_number: admin.phone_number || "",
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6" style={{ color: COLORS.PRIMARY }} />
            <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
            <Badge style={{ backgroundColor: COLORS.PRIMARY, color: "white" }}>
              {admins.length}
            </Badge>
          </div>
          <p className="text-gray-600">Create and manage dashboard administrators</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="gap-2 text-white"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          <Plus className="h-4 w-4" />
          Create Admin
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Admins Table */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" style={{ color: COLORS.PRIMARY }} />
            <p className="text-gray-600">Loading admins...</p>
          </div>
        </div>
      ) : admins.length > 0 ? (
        <Card className="p-0 border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${COLORS.PRIMARY}10` }}>
                  <th className="text-left p-4 font-semibold text-gray-900">Username</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Phone</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{admin.username}</span>
                    </td>
                    <td className="p-4 text-gray-600">{admin.email || "—"}</td>
                    <td className="p-4 text-gray-600">{admin.phone_number || "—"}</td>
                    <td className="p-4">
                      <Badge
                        style={{
                          backgroundColor: `${COLORS.PRIMARY}20`,
                          color: COLORS.PRIMARY,
                          border: `1px solid ${COLORS.PRIMARY}30`,
                        }}
                      >
                        {admin.type || "Admin"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        style={{
                          backgroundColor: admin.is_active ? "#d1fae5" : "#fee2e2",
                          color: admin.is_active ? "#065f46" : "#991b1b",
                        }}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => openEditDialog(admin)}
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(admin.id)}
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No admins found</p>
          <p className="text-gray-500 text-sm mt-1">Create your first admin to get started</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" style={{ backgroundColor: "white" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit2 className="h-5 w-5" style={{ color: COLORS.PRIMARY }} />
                  Edit Admin
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" style={{ color: COLORS.PRIMARY }} />
                  Create Admin
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Username *
              </label>
              <Input
                type="text"
                required
                placeholder="admin@example.com"
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
                Password {editingId && "(leave empty to keep current)"}
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={submitting}
              />
              {!editingId && <p className="text-xs text-gray-500 mt-1">Required for new admins</p>}
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

            {/* Submit Button */}
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingId ? "Update" : "Create"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowDialog(false)}
                disabled={submitting}
                variant="outline"
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTab;
