// FlagsTab.jsx
import { THEME } from "../theme";
import { FlagFrequencyChart } from "../../charts/ChartsAnalytics.jsx";

const FlagsTab = ({ flagFrequency }) => {
  return (
    <div
      className="rounded-2xl"
      style={{
        border: `1px solid ${THEME.border}`,
        background: THEME.cardBg,
        padding: 16,
      }}
    >
      <h2 className="text-xl font-semibold mb-2">Flag Frequency</h2>
      <p className="text-sm mb-4" style={{ color: THEME.muted }}>
        Which flags happen most frequently
      </p>

      <FlagFrequencyChart data={flagFrequency} />
    </div>
  );
};

export default FlagsTab;
