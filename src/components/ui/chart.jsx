import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark",
};

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({ id, className, children, config, ...props }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[#737373] [&_.recharts-cartesian-grid_line]:stroke-[#E4E4E4] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[#E4E4E4] [&_.recharts-reference-line_[stroke='#ccc']]:stroke-[#E4E4E4]",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const tooltipLabel = !hideLabel && payload[0]?.name;

  return (
    <div
      className={cn(
        "bg-white border border-[#E4E4E4] shadow-custom rounded-[8px] p-2 text-xs grid gap-1.5",
        className
      )}
    >
      {tooltipLabel && <div className={cn("font-medium text-[#0A0A0A]", labelClassName)}>{tooltipLabel}</div>}
      {payload.map((item, idx) => {
        const indicatorColor = color || item.payload.fill || item.color;
        return (
          <div key={idx} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: indicatorColor }}
              />
            )}
            <span className="text-[#737373]">{item.name}</span>
            <span className="text-[#0A0A0A] font-mono font-medium ml-auto">{item.value?.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

function ChartLegendContent({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {!hideIcon && <div className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: item.color }} />}
          <span className="text-[#0A0A0A]">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

// Export all Recharts primitives
const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
