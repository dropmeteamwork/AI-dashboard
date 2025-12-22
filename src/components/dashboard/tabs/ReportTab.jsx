// ReportTab.jsx
import React, { useRef, useState } from "react";
import { FileText, Download, DownloadCloud, FileDown, Loader } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Import all tabs
import OverviewTab from "./OverviewTab";
import AnalyticsTab from "./AnalyticsTab";
import BrandsAnalyticsTab from "./BrandsAnalyticsTab";
import FlagsTab from "./FlagsTab";

// Report Section Card Component
const ReportSectionCard = ({ icon: Icon, title, description, onGenerate, isGenerating }) => {
  return (
    <div className="card-responsive" style={{
      background: "white",
      border: "1px solid #E5E7EB",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{
          background: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
          padding: "10px 12px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon style={{ width: 20, height: 20, color: "#0EA5E9" }} />
        </div>
        <div>
          <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
            {title}
          </h4>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          width: "100%",
          padding: "10px 16px",
          background: isGenerating ? "#E5E7EB" : "#4CAF50",
          color: isGenerating ? "#6b7280" : "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: isGenerating ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: isGenerating ? "none" : "0 2px 8px rgba(76, 175, 80, 0.3)",
          opacity: isGenerating ? 0.6 : 1,
        }}
      >
        {isGenerating ? (
          <>
            <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            Generating...
          </>
        ) : (
          <>
            <Download style={{ width: 14, height: 14 }} />
            Generate Report
          </>
        )}
      </button>
    </div>
  );
};

// Section wrapper
function Section({ title, children, className = "" }) {
  return (
    <div className={`mb-12 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        {children}
      </div>
    </div>
  );
}

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
  machines = [],
}) {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [generatingSection, setGeneratingSection] = useState(null);

  // Only one export at a time
  const [exportType, setExportType] = useState(null); // 'full' or 'multi'

  // Report section refs for html2canvas
  const reportSectionRefs = {
    overview: useRef(null),
    analytics: useRef(null),
    brands: useRef(null),
    flags: useRef(null),
  };

  // -------- FIX: REMOVE OKLCH COLORS BEFORE html2canvas -------- //
  const sanitizeColors = (element) => {
    if (!element) return;
    // List of color-related properties to force
    const colorProps = [
      "color",
      "backgroundColor",
      "borderColor",
      "outlineColor",
      "boxShadow",
      "textDecorationColor",
      "columnRuleColor"
    ];

    colorProps.forEach((prop) => {
      // Always set a safe fallback for each property
      if (prop === "color" || prop === "textDecorationColor" || prop === "columnRuleColor" || prop === "outlineColor") {
        element.style[prop] = "#000";
      } else if (prop === "backgroundColor") {
        element.style[prop] = "#fff";
      } else if (prop === "borderColor") {
        element.style[prop] = "#ccc";
      } else if (prop === "boxShadow") {
        element.style[prop] = "none";
      }
    });

    // Recursively sanitize children
    for (const child of element.children) {
      sanitizeColors(child);
    }
  };
  // -------------------------------------------------------------- //

  // Inject temporary stylesheet that forces safe colors for the report
  const applyTemporaryStyle = (root) => {
    if (!root) return;
    // add marker class to root
    root.classList.add("pdf-export-sanitize");

    // if style already injected, reuse
    if (document.getElementById("pdf-sanitize-style")) return;

    const style = document.createElement("style");
    style.id = "pdf-sanitize-style";
    style.innerHTML = `
      .pdf-export-sanitize, .pdf-export-sanitize *, .pdf-export-sanitize *::before, .pdf-export-sanitize *::after {
        color: #000 !important;
        background-color: #fff !important;
        background-image: none !important;
        background: #fff !important;
        border-color: #ccc !important;
        box-shadow: none !important;
        outline-color: #000 !important;
        text-decoration-color: #000 !important;
        column-rule-color: #000 !important;
        text-shadow: none !important;
        filter: none !important;
      }
      
      /* Hide export buttons and progress in PDF */
      .pdf-export-sanitize .export-buttons { display: none !important; }
      .pdf-export-sanitize .export-progress { display: none !important; }
      
      /* Fix all overflow issues */
      .pdf-export-sanitize,
      .pdf-export-sanitize * {
        max-width: 100% !important;
        overflow: hidden !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        word-break: break-word !important;
        hyphens: auto !important;
      }
      
      /* Fix header overflow issues */
      .pdf-export-sanitize h1,
      .pdf-export-sanitize h2,
      .pdf-export-sanitize h3,
      .pdf-export-sanitize h4,
      .pdf-export-sanitize h5,
      .pdf-export-sanitize h6,
      .pdf-export-sanitize p,
      .pdf-export-sanitize span,
      .pdf-export-sanitize label {
        overflow: hidden !important;
        white-space: normal !important;
        word-wrap: break-word !important;
        word-break: break-word !important;
        max-width: 100% !important;
        text-overflow: ellipsis !important;
      }
      
      /* Fix specific section headers */
      .pdf-export-sanitize .machines-header { 
        overflow: hidden !important; 
        white-space: normal !important;
      }
      
      .pdf-export-sanitize [data-section] {
        overflow: hidden !important;
        page-break-inside: auto !important;
        max-width: 100% !important;
      }
      
      /* Ensure flex containers wrap properly */
      .pdf-export-sanitize .flex {
        flex-wrap: wrap !important;
        overflow: hidden !important;
      }
      
      .pdf-export-sanitize .flex.items-center {
        align-items: flex-start !important;
      }
      
      /* Ensure divs don't overflow */
      .pdf-export-sanitize div {
        max-width: 100% !important;
        overflow: hidden !important;
        word-break: break-word !important;
      }
      
      /* Fix tables */
      .pdf-export-sanitize table {
        table-layout: fixed !important;
        width: 100% !important;
        overflow: hidden !important;
      }
      
      .pdf-export-sanitize td,
      .pdf-export-sanitize th {
        overflow: hidden !important;
        word-break: break-word !important;
        text-overflow: ellipsis !important;
        max-width: 150px !important;
      }
      
      /* Fix grid layouts */
      .pdf-export-sanitize .grid {
        overflow: hidden !important;
        max-width: 100% !important;
      }
      
      /* Fix charts and SVGs */
      .pdf-export-sanitize svg {
        max-width: 100% !important;
        overflow: hidden !important;
      }
      
      .pdf-export-sanitize .recharts-wrapper,
      .pdf-export-sanitize .recharts-surface {
        max-width: 100% !important;
        overflow: hidden !important;
      }
      
      /* Fix card components */
      .pdf-export-sanitize .rounded-xl,
      .pdf-export-sanitize .rounded-lg,
      .pdf-export-sanitize .rounded-2xl {
        overflow: hidden !important;
        max-width: 100% !important;
      }
      
      /* Fix long text in badges and labels */
      .pdf-export-sanitize .badge,
      .pdf-export-sanitize [class*="badge"],
      .pdf-export-sanitize [class*="Badge"] {
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      
      /* Fix KPI cards */
      .pdf-export-sanitize .text-2xl,
      .pdf-export-sanitize .text-3xl,
      .pdf-export-sanitize .text-4xl {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      
      /* Ensure images don't overflow */
      .pdf-export-sanitize img {
        max-width: 100% !important;
        height: auto !important;
      }
      
      /* Fix scrollable containers */
      .pdf-export-sanitize .overflow-x-auto,
      .pdf-export-sanitize .overflow-y-auto,
      .pdf-export-sanitize .overflow-auto {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  };

  const removeTemporaryStyle = (root) => {
    if (!root) return;
    root.classList.remove("pdf-export-sanitize");
    const style = document.getElementById("pdf-sanitize-style");
    if (style) style.remove();
  };

  // Generate PDF for a single section using html2canvas
  const generateSectionReport = async (sectionKey, sectionName) => {
    setGeneratingSection(sectionKey);
    try {
      const element = reportSectionRefs[sectionKey]?.current;
      if (!element) {
        console.error(`Reference for section ${sectionKey} not found`);
        setGeneratingSection(null);
        return;
      }

      // Hide elements that shouldn't be in the report
      const elementsToHide = element.querySelectorAll(".hide-in-report");
      elementsToHide.forEach(el => el.style.display = "none");

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Restore hidden elements
      elementsToHide.forEach(el => el.style.display = "");

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Top margin

      // First page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // Add metadata
      pdf.setProperties({
        title: `${sectionName} Report`,
        subject: `AI Dashboard - ${sectionName} Report`,
        author: "Dropme AI Dashboard",
        keywords: "report, analytics, dashboard",
        creator: "AI Dashboard",
      });

      // Download
      pdf.save(`${sectionName.replace(/\s+/g, "-").toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error(`Error generating report for ${sectionKey}:`, error);
      alert(`Failed to generate ${sectionName} report. Please try again.`);
    } finally {
      setGeneratingSection(null);
    }
  };

  // Export all sections as multi-page PDF
  const exportPDF = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    setExportType('multi');
    setExportProgress(0);

    try {
      // apply global temporary style to cover CSS variables/pseudo elements
      applyTemporaryStyle(reportRef.current);
      // small delay to let styles take effect
      await new Promise((r) => setTimeout(r, 120));
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const logoSpaceHeight = 20; // Space reserved for logo at top of each page
      const contentWidth = pdfWidth - (margin * 2);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Get all sections
      const sections = Array.from(reportRef.current.querySelectorAll("[data-section]"));
      const totalSections = sections.length;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionName = section.getAttribute("data-section");
        
        setExportProgress(Math.round(((i + 1) / totalSections) * 100));

        // Temporarily set white background
        const originalBg = section.style.backgroundColor;
        section.style.backgroundColor = "#ffffff";

        // Sanitize colors
        sanitizeColors(section);

        // Force section to have a fixed width to prevent overflow
        const originalWidth = section.style.width;
        const originalMaxWidth = section.style.maxWidth;
        const originalOverflow = section.style.overflow;
        section.style.width = '800px';
        section.style.maxWidth = '800px';
        section.style.overflow = 'hidden';

        // Capture section
        // Ensure section is visible and not clipped
        section.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 200));
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: 800,
          windowWidth: 800,
          windowHeight: section.scrollHeight,
          onclone: (clonedDoc) => {
            // Apply overflow hidden to all elements in cloned document
            const clonedSection = clonedDoc.querySelector(`[data-section="${sectionName}"]`);
            if (clonedSection) {
              clonedSection.style.width = '800px';
              clonedSection.style.maxWidth = '800px';
              clonedSection.style.overflow = 'hidden';
              // Force all children to respect bounds
              const allElements = clonedSection.querySelectorAll('*');
              allElements.forEach(el => {
                el.style.maxWidth = '100%';
                el.style.overflow = 'hidden';
                el.style.wordBreak = 'break-word';
              });
            }
          }
        });

        // Restore original styles
        section.style.width = originalWidth;
        section.style.maxWidth = originalMaxWidth;
        section.style.overflow = originalOverflow;

        const imgData = canvas.toDataURL("image/png");
        
        // Calculate dimensions to fit page
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = contentWidth / imgWidth;
        const scaledHeight = imgHeight * ratio;

        // Add new page for each section (except first)
        if (i > 0) {
          pdf.addPage();
        }

        // Don't add duplicate section title - content already has it
        // Just reserve space at top for logo
        let yPosition = margin + logoSpaceHeight;
        const pageContentHeight = pdfHeight - margin - yPosition;
        
        if (scaledHeight <= pageContentHeight) {
          // Fits on one page
          pdf.addImage(imgData, "PNG", margin, yPosition, contentWidth, scaledHeight);
        } else {
          // Split across multiple pages
          let remainingHeight = scaledHeight;
          let sourceY = 0;
          
          while (remainingHeight > 0) {
            const sliceHeight = Math.min(pageContentHeight, remainingHeight);
            const sourceSliceHeight = sliceHeight / ratio;
            
            // Create a temporary canvas for this slice
            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = imgWidth;
            sliceCanvas.height = sourceSliceHeight;
            const ctx = sliceCanvas.getContext("2d");
            
            ctx.drawImage(
              canvas,
              0, sourceY, imgWidth, sourceSliceHeight,
              0, 0, imgWidth, sourceSliceHeight
            );
            
            const sliceImgData = sliceCanvas.toDataURL("image/png");
            pdf.addImage(sliceImgData, "PNG", margin, yPosition, contentWidth, sliceHeight);
            
            remainingHeight -= sliceHeight;
            sourceY += sourceSliceHeight;
            
            if (remainingHeight > 0) {
              pdf.addPage();
              yPosition = margin + logoSpaceHeight;
            }
          }
        }

        // Restore original background
        section.style.backgroundColor = originalBg;
      }

      // Add logo and footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Add logo to top-left (40x40mm)
        try {
          const logoImg = new Image();
          logoImg.src = '/logo.png';
          logoImg.onload = () => {
            pdf.addImage(logoImg, 'PNG', margin, margin, 15, 15);
          };
          // Wait for image to load
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.warn('Logo could not be loaded:', e);
        }
        
        // Add footer with date
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `AI Dashboard Report - Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          margin,
          pdfHeight - 5
        );
      }

      pdf.save(`ai-dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Check console.");
    } finally {
      // cleanup temporary style
      removeTemporaryStyle(reportRef.current);
      setExporting(false);
      setExportProgress(0);
      setExportType(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header with Generate Report Button */}
      <div className="card-responsive" style={{
        background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
        border: "1px solid #ddd6fe",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0, marginBottom: "4px" }}>
            Generate New Report
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Create a comprehensive report with multiple sections or export individual section data
          </p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting}
          style={{
            padding: "10px 24px",
            background: exporting ? "#E5E7EB" : "#4CAF50",
            color: exporting ? "#6b7280" : "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: exporting ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: exporting ? "none" : "0 2px 8px rgba(76, 175, 80, 0.3)",
            opacity: exporting ? 0.6 : 1,
          }}
        >
          {exporting ? (
            <>
              <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              {exportProgress}%
            </>
          ) : (
            <>
              <FileDown style={{ width: 16, height: 16 }} />
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* Section Report Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {/* Dashboard Overview */}
        <ReportSectionCard
          icon={FileDown}
          title="Dashboard Overview"
          description="Generate a detailed report for this section"
          onGenerate={() => generateSectionReport("overview", "Dashboard Overview")}
          isGenerating={generatingSection === "overview"}
        />

        {/* Analytics Report */}
        <ReportSectionCard
          icon={FileDown}
          title="Analytics & Predictions"
          description="Generate a detailed report for this section"
          onGenerate={() => generateSectionReport("analytics", "Analytics")}
          isGenerating={generatingSection === "analytics"}
        />

        {/* Brands Analytics Report */}
        <ReportSectionCard
          icon={FileDown}
          title="Brands Analytics"
          description="Generate a detailed report for this section"
          onGenerate={() => generateSectionReport("brands", "Brands Analytics")}
          isGenerating={generatingSection === "brands"}
        />

        {/* Flags Report */}
        <ReportSectionCard
          icon={FileDown}
          title="Flagged Items"
          description="Generate a detailed report for this section"
          onGenerate={() => generateSectionReport("flags", "Flagged Items")}
          isGenerating={generatingSection === "flags"}
        />
      </div>

      {/* Hidden Report Content for Canvas Capture */}
      <div style={{ display: "none" }}>
        {/* Overview Section */}
        <div ref={reportSectionRefs.overview}>
          <div style={{ padding: "24px", background: "white" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
              Dashboard Overview Report
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Generated on {new Date().toLocaleString()}
            </p>
            <OverviewTab overview={overview} topModel={topModel} machines={machines} />
          </div>
        </div>

        {/* Analytics Section */}
        <div ref={reportSectionRefs.analytics}>
          <div style={{ padding: "24px", background: "white" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
              Analytics & Predictions Report
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Generated on {new Date().toLocaleString()}
            </p>
            <AnalyticsTab
              accuracyByClass={accuracyByClass}
              avgConfByItem={avgConfByItem}
              brandsSummary={brandsSummary}
              modelCompare={modelCompare}
              flagFrequency={flagFrequency}
              decisionDuration={decisionDuration}
              histogram={histogram}
            />
          </div>
        </div>

        {/* Brands Analytics Section */}
        <div ref={reportSectionRefs.brands}>
          <div style={{ padding: "24px", background: "white" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
              Brands Analytics Report
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Generated on {new Date().toLocaleString()}
            </p>
            <BrandsAnalyticsTab />
          </div>
        </div>

        {/* Flags Section */}
        <div ref={reportSectionRefs.flags}>
          <div style={{ padding: "24px", background: "white" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
              Flagged Items Report
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Generated on {new Date().toLocaleString()}
            </p>
            <FlagsTab flagFrequency={flagFrequency} />
          </div>
        </div>

        {/* Full Report Section */}
        <div ref={reportRef} data-section="Full Report">
          <div style={{ padding: "24px", background: "white" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
              Complete AI Dashboard Report
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "40px" }}>
              Generated on {new Date().toLocaleString()}
            </p>

            {/* Overview Section in Full Report */}
            <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                Dashboard Overview
              </h2>
              <OverviewTab overview={overview} topModel={topModel} machines={machines} />
            </div>

            {/* Analytics Section in Full Report */}
            <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                Analytics & Predictions
              </h2>
              <AnalyticsTab
                accuracyByClass={accuracyByClass}
                avgConfByItem={avgConfByItem}
                brandsSummary={brandsSummary}
                modelCompare={modelCompare}
                flagFrequency={flagFrequency}
                decisionDuration={decisionDuration}
                histogram={histogram}
              />
            </div>

            {/* Brands Analytics Section in Full Report */}
            <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                Brands Analytics
              </h2>
              <BrandsAnalyticsTab />
            </div>

            {/* Flags Section in Full Report */}
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                Flagged Items
              </h2>
              <FlagsTab flagFrequency={flagFrequency} />
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "24px", marginTop: "40px", textAlign: "center" }}>
              <p style={{ color: "#6b7280", marginBottom: "8px" }}>
                Report generated by Dropme AI Dashboard
              </p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                {new Date().toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
