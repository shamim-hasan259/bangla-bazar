import React from "react";

interface CsvDownloadProps {
  data: any[]; // Replace with your data type
  filename: string;
}

const CsvDownload: React.FC<CsvDownloadProps> = ({ data, filename }) => {
  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8," + dataToCSV(data);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataToCSV = (data: any[]) => {
    const csvRows = [];
    // Assuming data is an array of objects where each object represents a row
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    data.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  return (
    <></>
    // <button onClick={handleDownload}>Download CSV</button>
  );
};

export default CsvDownload;