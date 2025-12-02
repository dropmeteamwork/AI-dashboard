// MachinesTab.jsx
import { THEME } from "../theme";
import { MachinesPerformanceChart } from "@/components/charts/MachineCharts";

const MachinesTab = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 className="text-xl font-semibold">Machine Monitoring</h2>

      <div
        className="rounded-2xl"
        style={{
          border: `1px solid ${THEME.border}`,
          background: THEME.cardBg,
          padding: 16,
        }}
      >
        <h3 className="font-semibold mb-2">Machine Performance</h3>
        <MachinesPerformanceChart />
      </div>
    </div>
  );
};

export default MachinesTab;
