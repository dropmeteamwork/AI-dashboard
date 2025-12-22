// ChartCard.jsx - Reusable chart container matching RVM Dashboard Style
import React from "react";

const ChartCard = ({ 
  title, 
  children, 
  legend,
  height = "320px",
  padding = "24px"
}) => (
  <div
    style={{
      background: "white",
      borderRadius: "16px",
      border: "1px solid #E5E7EB",
      padding: padding,
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    {/* Title */}
    {title && (
      <h3 
        style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          color: "#111827", 
          marginBottom: "20px",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {title}
      </h3>
    )}

    {/* Chart Content */}
    <div style={{ height: height }}>
      {children}
    </div>

    {/* Legend */}
    {legend && (
      <div 
        style={{ 
          display: "flex", 
          gap: "24px", 
          marginTop: "16px", 
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {legend.map((item, index) => (
          <div 
            key={index}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px" 
            }}
          >
            <div 
              style={{ 
                width: "12px", 
                height: "12px", 
                borderRadius: "4px", 
                backgroundColor: item.color 
              }}
            />
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ChartCard;
