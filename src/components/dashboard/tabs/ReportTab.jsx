// ReportTab.jsx
import React, { useRef, useState } from "react";

// Import all tabs
import OverviewTab from "./OverviewTab";
import AnalyticsTab from "./AnalyticsTab";
import BrandInsightsTab from "./BrandInsightsTab";
import FlagsTab from "./FlagsTab";
import MachinesTab from "./MachinesTab";
import ModelsTab from "./ModelsTab";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Section wrapper
const Section = ({ title, children }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      {children}
    </div>
  </div>
);

export default function ReportTab({
  overview,
  topModel,
  accuracyByClass,
  avgConfByItem,
  brandsSummary,
  modelCompare,
  flagFrequency,
  decisionDuration,
  histogram,
}) {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // -------- FIX: REMOVE OKLCH COLORS BEFORE html2canvas -------- //
  const sanitizeColors = (element) => {
    if (!element) return;

    const computed = window.getComputedStyle(element);

    // Replace OKLCH color with safe RGB fallback
    if (computed.color.includes("oklch")) {
      element.style.color = "#000000";
    }

    if (computed.backgroundColor.includes("oklch")) {
      element.style.backgroundColor = "#ffffff";
    }

    if (computed.borderColor.includes("oklch")) {
      element.style.borderColor = "#cccccc";
    }

    // Recursion for children
    for (const child of element.children) {
      sanitizeColors(child);
    }
  };
  // -------------------------------------------------------------- //

  const exportPDF = async () => {
    if (!reportRef.current) return;

    setExporting(true);

    try {
      const originalBg = reportRef.current.style.backgroundColor;
      reportRef.current.style.backgroundColor = "#ffffff";

      // Apply color sanitization before capturing
      sanitizeColors(reportRef.current);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollY: -window.scrollY,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("report.pdf");

      reportRef.current.style.backgroundColor = originalBg;
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Check console.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportPDF}
          className={`px-4 py-2 text-white rounded-lg ${
            exporting ? "bg-gray-400" : "bg-green-600"
          }`}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export as PDF"}
        </button>
      </div>

      {/* Report Content */}
      <div
        id="report-content"
        ref={reportRef}
        className="space-y-10 pb-20 bg-white"
      >
        {/* <Section title="Overview"> */}
        <Section title="">
          <OverviewTab overview={overview} topModel={topModel} />
        </Section>

        <Section title="Analytics Overview">
          <AnalyticsTab
            accuracyByClass={accuracyByClass}
            avgConfByItem={avgConfByItem}
            brandsSummary={brandsSummary}
            modelCompare={modelCompare}
            flagFrequency={flagFrequency}
            decisionDuration={decisionDuration}
            histogram={histogram}
          />
        </Section>

        <Section title="Brand Insights">
          <BrandInsightsTab brandsSummary={brandsSummary} />
        </Section>

        <Section title="Flags Overview">
          <FlagsTab flagFrequency={flagFrequency} />
        </Section>

        <Section title="Machine Performance">
          <MachinesTab />
        </Section>

        <Section title="Model Performance & Confidence">
          <ModelsTab />
        </Section>
      </div>
    </div>
  );
}
