// FlagsTab.jsx - Card view with filter chips per supervisor feedback
import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Filter, Eye, Calendar, Cpu } from "lucide-react";

const API_BASE = "https://web-ai-dashboard.up.railway.app";

// Flagged Item Card Component
const FlaggedItemCard = ({ item }) => {
  const imageUrl = item.image_url || item.image_path || 
    (item.image_s3_key ? `https://ai-data-001.s3.eu-central-1.amazonaws.com/${item.image_s3_key}` : null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return "—";
    }
  };

  // Use 'item' field from API (not item_type)
  const itemType = item.item || item.item_type || "Unknown";

  return (
    <div className="card-responsive" style={{
      background: "white",
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif",
      transition: "all 0.2s ease",
      padding: 0,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ height: "140px", background: "#f3f4f6", position: "relative" }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={itemType} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ 
            width: "100%", height: "100%", 
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#9ca3af"
          }}>
            <Eye style={{ width: 28, height: 28 }} />
          </div>
        )}
        {/* Flag badge */}
        {item.flag && (
          <span style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            padding: "2px 6px",
            background: item.flag === "LOW_CONF" ? "#FEF3C7" : "#FEE2E2",
            color: item.flag === "LOW_CONF" ? "#D97706" : "#EF4444",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "600",
          }}>
            {item.flag}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: "12px 14px" }}>
        {/* Prediction */}
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "6px", textTransform: "capitalize" }}>
          {itemType}
        </div>
        
        {/* Confidence */}
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
          Confidence: <span style={{ fontWeight: "600", color: "#4CAF50" }}>
            {((item.confidence || 0) * 100).toFixed(1)}%
          </span>
        </div>
        
        {/* Status */}
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
          Status: <span style={{ 
            fontWeight: "500", 
            color: item.status === "ACCEPTED" ? "#4CAF50" : item.status === "REJECTED" ? "#EF4444" : "#6b7280" 
          }}>
            {item.status || "N/A"}
          </span>
        </div>
        
        {/* Machine */}
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Cpu style={{ width: 11, height: 11 }} />
          {item.machine_name?.replace(/_/g, " ") || "N/A"}
        </div>
        
        {/* Timestamp */}
        <div style={{ fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
          <Calendar style={{ width: 11, height: 11 }} />
          {formatDate(item.created_at || item.timestamp)}
        </div>
      </div>
    </div>
  );
};

const FlagsTab = ({ flagFrequency }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all predictions (we show all items here for flagging)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch predictions - same endpoint as PredictionsTab
        const res = await fetch(`${API_BASE}/ai_dashboard/predictions/`);
        console.log("FlagsTab - Response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        
        const data = await res.json();
        console.log("FlagsTab - Raw response type:", typeof data, Array.isArray(data));
        
        // Handle different response formats
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data.results && Array.isArray(data.results)) {
          items = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          items = data.data;
        }
        
        console.log("FlagsTab - Items count:", items.length);
        if (items.length > 0) {
          console.log("FlagsTab - Sample item keys:", Object.keys(items[0]));
        }
        
        setPredictions(items);
      } catch (err) {
        console.error("FlagsTab - Error fetching predictions:", err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get unique item types for filter chips
  const itemTypes = useMemo(() => {
    const types = {};
    predictions.forEach(p => {
      const type = p.item || p.item_type || "unknown";
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  }, [predictions]);

  // Filter predictions
  const filteredPredictions = useMemo(() => {
    let filtered = predictions;
    if (selectedFilter !== "all") {
      filtered = predictions.filter(p => (p.item || p.item_type || "unknown") === selectedFilter);
    }
    return filtered;
  }, [predictions, selectedFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
  const paginatedItems = filteredPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#4CAF50", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          Loading flagged items...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <AlertTriangle style={{ width: 22, height: 22, color: "#EF4444" }} />
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Flagged Items</h2>
        </div>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          Overview of flagged items that need review
        </p>
      </div>

      {/* Filter Chips - Responsive */}
      <div className="card-responsive scroll-x-mobile" style={{
        background: "white",
        border: "1px solid #E5E7EB",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Filter style={{ width: 14, height: 14, color: "#6b7280" }} />
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Filter by Brand</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            onClick={() => setSelectedFilter("all")}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              border: "none",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: selectedFilter === "all" ? "#4CAF50" : "#f3f4f6",
              color: selectedFilter === "all" ? "white" : "#374151",
            }}
          >
            All ({predictions.length})
          </button>
          {itemTypes.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                border: "none",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: selectedFilter === type ? "#4CAF50" : "#f3f4f6",
                color: selectedFilter === type ? "white" : "#374151",
              }}
            >
              {type} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid - Responsive */}
      {paginatedItems.length > 0 ? (
        <>
          <div className="cards-grid">
            {paginatedItems.map((item, idx) => (
              <FlaggedItemCard key={item.id || idx} item={item} />
            ))}
          </div>
          
          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap",
              justifyContent: "center", 
              alignItems: "center", 
              gap: "8px",
              marginTop: "12px",
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  background: currentPage === 1 ? "#f3f4f6" : "white",
                  color: currentPage === 1 ? "#9ca3af" : "#374151",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  background: currentPage === totalPages ? "#f3f4f6" : "white",
                  color: currentPage === totalPages ? "#9ca3af" : "#374151",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Next
              </button>
            </div>
          )}
          
          <div style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>
            Showing {paginatedItems.length} of {filteredPredictions.length} items
          </div>
        </>
      ) : (
        <div className="card-responsive" style={{ 
          textAlign: "center", 
          color: "#9ca3af",
          background: "white",
          border: "1px solid #E5E7EB",
          padding: "40px 16px",
        }}>
          <AlertTriangle style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.5 }} />
          <div style={{ fontSize: "15px", fontWeight: "500" }}>No items found</div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your filter</div>
        </div>
      )}
    </div>
  );
};

export default FlagsTab;
