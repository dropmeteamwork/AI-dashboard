// KPI.jsx - Mixed colors like RVM Dashboard
import React from "react";

// Gradient presets - Mixed colors like the reference image
const gradients = {
  blue: "linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)",
  green: "linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)",
  purple: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)",
  pink: "linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)",
  orange: "linear-gradient(135deg, #FFEDD5 0%, #FEF3C7 100%)",
  cyan: "linear-gradient(135deg, #CFFAFE 0%, #E0F7FA 100%)",
};

// Border colors to match gradients
const borderColors = {
  blue: "#93C5FD",
  green: "#86EFAC",
  purple: "#C4B5FD",
  pink: "#F9A8D4",
  orange: "#FDBA74",
  cyan: "#67E8F9",
};

const KPI = ({ 
  title, 
  value, 
  note, 
  color = "blue",
  valueColor,
  children // For custom content like the Gender Diversity card
}) => (
  <div
    style={{
      background: gradients[color] || gradients.blue,
      borderRadius: "16px",
      border: `1px solid ${borderColors[color] || borderColors.blue}`,
      padding: "20px 24px",
      fontFamily: "'Outfit', sans-serif",
      minHeight: "120px",
    }}
  >
    {/* Title */}
    <div 
      style={{ 
        fontSize: "14px", 
        fontWeight: "500", 
        color: "#374151", 
        marginBottom: "12px",
      }}
    >
      {title}
    </div>

    {/* Custom children or default value display */}
    {children ? (
      children
    ) : (
      <>
        {/* Value */}
        <div 
          style={{ 
            fontSize: "36px", 
            fontWeight: "700", 
            color: valueColor || "#4CAF50",
            lineHeight: "1.1",
            marginBottom: "8px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {value}
        </div>

        {/* Note/Subtitle */}
        {note && (
          <div 
            style={{ 
              fontSize: "13px", 
              color: "#6b7280",
              fontWeight: "400",
            }}
          >
            {note}
          </div>
        )}
      </>
    )}
  </div>
);

export default KPI;
