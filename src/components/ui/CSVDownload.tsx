"use client";
import { DownloadCloud } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface CSVDownloadProps {
  data: any[];
  filename: string;
  fields: string[]; // Add fields prop to specify the properties to include
  btnVariant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "admin"
  | "seller";
}

export const CSVDownload: React.FC<CSVDownloadProps> = ({
  data,
  filename,
  fields,
  btnVariant,
}) => {
  const downloadCSV = () => {
    // Convert data to CSV format, including only specified fields
    const csvContent = [
      fields.join(","), // header row with specified fields
      ...data.map((row) => fields.map((field) => row[field] || "").join(",")), // data rows with specified fields
    ].join("\n");

    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);

    // Append link to the body, trigger click, and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="csv-download-button">
      <Button variant={btnVariant} onClick={downloadCSV}>
        <DownloadCloud className="mr-2 h-4 w-4" /> Export
      </Button>
    </div>
  );
};

export default CSVDownload;
