import type { HandleEntry, HandleType, WalletResult } from "@/lib/pregenWalletApi";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const CSV_TEMPLATE_FILE_NAME = "handles-template.csv";
export const CSV_TEMPLATE = "handle,type\n@username1,twitter\n@username2,telegram\n";

interface CsvParseResult {
  entries: HandleEntry[];
  errorMessage: string | null;
}

export function validateCsvFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return "Only CSV files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "The file is larger than the 5 MB limit.";
  }

  return null;
}

export function parseHandleCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { entries: [], errorMessage: "The CSV file is empty." };
  }

  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("handle") && (firstLine.includes("type") || firstLine.includes("platform"));
  const entries = lines.slice(hasHeader ? 1 : 0).flatMap(toHandleEntry);

  if (entries.length === 0) {
    return { entries: [], errorMessage: "No valid rows found in the CSV file." };
  }

  return { entries, errorMessage: null };
}

export function toResultsCsv(results: WalletResult[]) {
  const header = ["Handle", "Type", "Wallet Address", "Status", "Error"];
  const rows = results.map((result) => [
    result.handle,
    result.type,
    result.walletAddress,
    result.status,
    result.errorMessage ?? "",
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function getResultsFileName(date = new Date()) {
  return `wallet-generation-results-${date.toISOString()}.csv`;
}

function toHandleEntry(line: string): HandleEntry[] {
  const [handle, typeValue] = line.split(",").map((part) => part.trim());

  if (!handle || typeValue === undefined) {
    return [];
  }

  const type: HandleType = typeValue.toLowerCase() === "telegram" ? "TELEGRAM" : "TWITTER";

  return [{ handle, type }];
}

function escapeCsvValue(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
