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

function RedirectHandler() {
  const token = localStorage.getItem("access_token");
  return token ? (
    <Navigate to="/app/overview" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/app/overview"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}
