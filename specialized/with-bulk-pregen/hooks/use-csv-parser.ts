import { useState, useCallback } from "react";

export type HandleType = "TWITTER" | "TELEGRAM";

export type HandleEntry = {
  handle: string;
  type: HandleType;
};

export function useCSVParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((csvText: string): HandleEntry[] => {
    setError(null);
    
    // Split by lines and remove empty lines
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      setError("The CSV file is empty");
      return [];
    }

    // Check if there's a header row
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("handle") && (firstLine.includes("type") || firstLine.includes("platform"));

    // Start from index 1 if there's a header, otherwise from 0
    const startIndex = hasHeader ? 1 : 0;

    const entries: HandleEntry[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",").map((part) => part.trim());

      if (parts.length >= 2) {
        const handle = parts[0];
        const typeStr = parts[1].toLowerCase();

        const type: HandleType = typeStr === "telegram" ? "TELEGRAM" : "TWITTER";

        entries.push({ handle, type });
      }
    }

    if (entries.length === 0) {
      setError("No valid entries found in the CSV file");
      return [];
    }

    return entries;
  }, []);

  const parseCSVFile = useCallback((file: File): Promise<HandleEntry[]> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const csvText = event.target?.result as string;
        const entries = parseCSV(csvText);
        setIsLoading(false);
        resolve(entries);
      };
      
      reader.onerror = () => {
        setError("Failed to read the file");
        setIsLoading(false);
        reject(new Error("Failed to read the file"));
      };
      
      reader.readAsText(file);
    });
  }, [parseCSV]);

  const downloadTemplate = useCallback(() => {
    const templateContent = "handle,type\n@username1,twitter\n@username2,telegram";
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "handles-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    parseCSVFile,
    downloadTemplate,
    isLoading,
    error,
  };
}