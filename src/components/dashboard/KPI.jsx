// KPI.jsx
import { THEME } from "./theme";

const KPI = ({ title, value, note, icon: Icon, color = "#6CC04A" }) => (
  <div
    className="rounded-xl professional-card"
    style={{
      background: "white",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      cursor: "pointer",
    }}
  >
    {/* Header with background */}
    <div
      style={{
        padding: "12px 16px",
        background: `${color}15`,
        borderBottom: `1px solid ${color}20`,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {Icon && (
        <div
          style={{
            padding: "6px",
            background: `${color}25`,
            borderRadius: "6px",
          }}
        >
          <Icon className="w-4 h-4" color={color} />
        </div>
      )}
      <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </div>
    </div>

    {/* Content */}
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: "28px", fontWeight: "700", color: color, lineHeight: "1.2" }}>
        {value}
      </div>
      {note && (
        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px", lineHeight: "1.4" }}>
          {note}
        </div>
      )}
    </div>
  </div>
);

export default KPI;
