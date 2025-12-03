import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthPage from "./components/pages/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

// Handles root redirect based on login
function RedirectHandler() {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/app/overview" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<AuthPage />} />

        {/* Register page (accessible only when logged in) */}
        <Route path="/register" element={<AuthPage forceRegister />} />

        {/* Dashboard main */}
        <Route
          path="/app/:tab?"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → redirect based on token */}
        <Route path="*" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}
