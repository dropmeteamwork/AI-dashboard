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
      padding: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{
          background: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
          padding: "8px 10px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon style={{ width: 18, height: 18, color: "#0EA5E9" }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "3px", margin: 0, wordBreak: "break-word" }}>
            {title}
          </h4>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: isGenerating ? "#E5E7EB" : "#4CAF50",
          color: isGenerating ? "#6b7280" : "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "600",
          cursor: isGenerating ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: isGenerating ? "none" : "0 2px 8px rgba(76, 175, 80, 0.3)",
          opacity: isGenerating ? 0.6 : 1,
        }}
      >
        {isGenerating ? (
          <>
            <Loader style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
            Generating...
          </>
        ) : (
          <>
            <Download style={{ width: 12, height: 12 }} />
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

      // Make the element visible temporarily
      const originalDisplay = element.style.display;
      const originalPosition = element.style.position;
      const originalVisibility = element.style.visibility;
      const originalLeft = element.style.left;
      const originalTop = element.style.top;
      const originalWidth = element.style.width;
      
      element.style.display = "block";
      element.style.position = "static";
      element.style.visibility = "visible";
      element.style.left = "auto";
      element.style.top = "auto";
      element.style.width = "100%";

      await new Promise(r => setTimeout(r, 150));

      // Create canvas from the element with better settings
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 1000,
        windowHeight: element.scrollHeight,
      });

      // Restore original styles
      element.style.display = originalDisplay;
      element.style.position = originalPosition;
      element.style.visibility = originalVisibility;
      element.style.left = originalLeft;
      element.style.top = originalTop;
      element.style.width = originalWidth;

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const topMargin = 25; // Space for small logo
      const bottomMargin = 15; // Space for footer
      
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate how many pages we need
      const maxHeightPerPage = pageHeight - topMargin - bottomMargin;
      const totalPages = Math.ceil(imgHeight / maxHeightPerPage);

      let currentY = 0;

      // Add content pages
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        // Add new page (except for first page)
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Calculate slice dimensions
        const canvasSliceHeight = (maxHeightPerPage / imgWidth) * canvas.width;
        const sourceY = pageIndex * canvasSliceHeight;
        const sliceHeight = Math.min(canvasSliceHeight, canvas.height - sourceY);

        // Create canvas slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext("2d");

        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sliceHeight,
          0, 0,
          canvas.width, sliceHeight
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        const renderedHeight = (sliceHeight * imgWidth) / canvas.width;

        // Add image
        pdf.addImage(sliceImgData, "PNG", margin, topMargin, imgWidth, renderedHeight);
      }

      // Add logo and footer to all pages
      const finalPageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= finalPageCount; i++) {
        pdf.setPage(i);

        // Add small logo to top-left
        try {
          const logoImg = new Image();
          logoImg.src = '/logo.png';
          await new Promise((resolve) => {
            logoImg.onload = () => {
              pdf.addImage(logoImg, 'PNG', margin, margin, 12, 12);
              resolve();
            };
            logoImg.onerror = () => resolve();
            setTimeout(() => resolve(), 80);
          });
        } catch (e) {
          console.warn('Logo could not be loaded');
        }

        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 160);
        const footerText = `Page ${i} of ${finalPageCount} | Generated on ${new Date().toLocaleDateString()}`;
        pdf.text(footerText, margin, pageHeight - 8);
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
      const logoSpaceHeight = 20; // Space reserved for logo at top of each page (15mm logo + 5mm space)
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
        
        // Add logo to top-left (15mm x 15mm, smaller to prevent stretching)
        try {
          const logoImg = new Image();
          logoImg.src = '/logo.png';
          await new Promise((resolve, reject) => {
            logoImg.onload = () => {
              // Consistent small logo: 15mm x 15mm
              const logoWidth = 15;
              const logoHeight = 15;
              pdf.addImage(logoImg, 'PNG', margin, margin, logoWidth, logoHeight);
              resolve();
            };
            logoImg.onerror = reject;
            setTimeout(() => resolve(), 100);
          });
        } catch (e) {
          console.warn('Logo could not be loaded:', e);
        }
        
        // Add footer with date and page number
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
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
      </div>

      {/* Hidden Report Content for Canvas Capture - use opacity instead of position off-screen */}
      <div style={{ opacity: 0, pointerEvents: "none", position: "fixed", width: "900px", zIndex: -1 }}>
        {/* Overview Section */}
        <div ref={reportSectionRefs.overview} style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
            Dashboard Overview Report
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Generated on {new Date().toLocaleString()}
          </p>
          <OverviewTab overview={overview} topModel={topModel} machines={machines} />
        </div>

        {/* Analytics Section */}
        <div ref={reportSectionRefs.analytics} style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
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

        {/* Brands Analytics Section */}
        <div ref={reportSectionRefs.brands} style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
            Brands Analytics Report
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Generated on {new Date().toLocaleString()}
          </p>
          <BrandsAnalyticsTab />
        </div>

        {/* Flags Section */}
        <div ref={reportSectionRefs.flags} style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" }}>
            Flagged Items Report
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Generated on {new Date().toLocaleString()}
          </p>
          <FlagsTab flagFrequency={flagFrequency} />
        </div>
      </div>

      {/* Full Report Section - for multi-page PDF export */}
      <div ref={reportRef} style={{ opacity: 0, pointerEvents: "none", position: "fixed", width: "900px", zIndex: -1 }}>
        {/* Overview Section */}
        <div data-section="Dashboard Overview" style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "#111827" }}>
            Dashboard Overview
          </h1>
          <OverviewTab overview={overview} topModel={topModel} machines={machines} />
        </div>

        {/* Analytics Section */}
        <div data-section="Analytics & Predictions" style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "#111827" }}>
            Analytics & Predictions
          </h1>
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

        {/* Brands Analytics Section */}
        <div data-section="Brands Analytics" style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "#111827" }}>
            Brands Analytics
          </h1>
          <BrandsAnalyticsTab />
        </div>

        {/* Flags Section */}
        <div data-section="Flagged Items" style={{ background: "white", padding: "24px", marginBottom: "0", width: "100%" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "20px", color: "#111827" }}>
            Flagged Items
          </h1>
          <FlagsTab flagFrequency={flagFrequency} />
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
