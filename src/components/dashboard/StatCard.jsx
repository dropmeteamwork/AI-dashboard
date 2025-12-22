// StatCard.jsx - Small stat card matching App Logo Green Theme
import React from "react";

const StatCard = ({ 
  label, 
  value, 
  subtext,
  valueColor = "#4CAF50" // Green by default to match app logo
}) => (
  <div
    style={{
      background: "white",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      padding: "16px 20px",
      fontFamily: "'Outfit', sans-serif",
      textAlign: "center",
      minWidth: "80px",
    }}
  >
    {/* Label */}
    <div 
      style={{ 
        fontSize: "13px", 
        fontWeight: "500", 
        color: "#374151", 
        marginBottom: "8px",
      }}
    >
      {label}
    </div>

    {/* Value */}
    <div 
      style={{ 
        fontSize: "24px", 
        fontWeight: "700", 
        color: valueColor,
        lineHeight: "1.2",
        marginBottom: subtext ? "4px" : "0",
      }}
    >
      {value}
    </div>

    {/* Subtext */}
    {subtext && (
      <div 
        style={{ 
          fontSize: "12px", 
          color: "#9ca3af",
        }}
      >
        {subtext}
      </div>
    )}
  </div>
);

export default StatCard;
