// KPI.jsx
import { THEME } from "./theme";

const KPI = ({ title, value, note }) => (
  <div
    className="rounded-2xl"
    style={{
      background: THEME.cardBg,
      border: `1px solid ${THEME.border}`,
      boxShadow: THEME.boxShadow,
    }}
  >
    <div
      className="px-4 py-3 rounded-t-2xl"
      style={{
        background: THEME.subtleBorder,
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
    </div>

    <div className="px-4 py-4">
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: THEME.muted, marginTop: 6 }}>{note}</div>}
    </div>
  </div>
);

export default KPI;
