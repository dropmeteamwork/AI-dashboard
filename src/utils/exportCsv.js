// CSV Export Utility

/**
 * Convert array of objects to CSV and trigger download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file
 * @param {Array} columns - Optional array of column definitions { key: string, label: string }
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from columns or from first data object
  const headers = columns 
    ? columns.map(col => col.label || col.key)
    : Object.keys(data[0]);
  
  const keys = columns 
    ? columns.map(col => col.key)
    : Object.keys(data[0]);

  // Build CSV content
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(","));
  
  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      let value = row[key];
      
      // Handle nested objects
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        value = "";
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline, or quotes
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue}"`;
      }
      
      return stringValue;
    });
    
    csvRows.push(values.join(","));
  }

  // Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportToCSV;
