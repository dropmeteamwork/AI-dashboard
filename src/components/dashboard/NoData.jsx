// NoData.jsx
import { THEME } from "./theme";

const NoData = ({ text = "No data" }) => (
  <div style={{ padding: 24, color: THEME.muted, textAlign: "center" }}>
    {text}
  </div>
);

export default NoData;
