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

  // Only one export at a time
  const [exportType, setExportType] = useState(null); // 'full' or 'multi'

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
    <div className="w-full">
      {/* Export Buttons - Hidden in PDF */}
      <div className="export-buttons flex justify-end gap-3 mb-4">
        <button
          onClick={exportPDF}
          className={`px-4 py-2 text-white rounded-lg ${
            exporting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={exporting}
        >
          {exporting && exportType === 'multi' ? `Exporting... ${exportProgress}%` : "Export Multi-Page PDF"}
        </button>
      </div>

      {/* Progress bar - Hidden in PDF */}
      {exporting && exportProgress > 0 && (
        <div className="export-progress mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            Generating PDF... {exportProgress}%
          </p>
        </div>
      )}

      {/* Report Content */}
      <div
        id="report-content"
        ref={reportRef}
        className="space-y-10 pb-20 bg-white relative"
      >
        <div data-section="Overview">
          <Section title="">
            <OverviewTab overview={overview} topModel={topModel} />
          </Section>
        </div>

        <div data-section="Analytics Overview">
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
        </div>

        <div data-section="Brand Insights">
          <Section title="Brand Insights">
            <BrandInsightsTab brandsSummary={brandsSummary} />
          </Section>
        </div>

        <div data-section="Flags Overview">
          <Section title="Flags Overview">
            <FlagsTab flagFrequency={flagFrequency} />
          </Section>
        </div>

        <div data-section="Machine Performance">
          <Section title="Machine Performance">
            <MachinesTab data={machines} />
          </Section>
        </div>

        <div data-section="Model Performance">
          <Section title="Model Performance & Confidence">
            <ModelsTab />
          </Section>
        </div>

        {/* Footer - Report Generated By */}
        <div className="border-t pt-8 mt-8">
          <p className="text-center text-gray-500 text-sm">
            Report generated by Dropme AI Dashboard
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            {new Date().toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
