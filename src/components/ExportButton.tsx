import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers: string[];
  keys: string[];
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  headers,
  keys,
  label = "Export CSV"
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Prepare CSV rows
    const csvRows = [headers.join(",")];
    
    for (const item of data) {
      const values = keys.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return "";
        // Clean values to avoid breaking CSV format
        const stringified = String(value).replace(/"/g, '""');
        return stringified.includes(",") || stringified.includes("\n") || stringified.includes('"')
          ? `"${stringified}"`
          : stringified;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all-200 active:scale-95 shadow-sm"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
};
