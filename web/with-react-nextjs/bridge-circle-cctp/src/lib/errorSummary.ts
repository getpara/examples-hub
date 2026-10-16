import { shortenAddress } from "@/lib/format";

const DETAIL_MARKERS = ["URL:", "Request body:", "Request Arguments:", "Contract Call:", "Details:", "Docs:", "Version:"];

const LONG_HEX_PATTERN = /0x[0-9a-fA-F]{12,}/g;

function removeDetails(message: string) {
  return DETAIL_MARKERS.reduce((text, marker) => {
    const markerIndex = text.indexOf(marker);
    return markerIndex > 0 ? text.slice(0, markerIndex) : text;
  }, message);
}

export function summarizeErrorMessage(message: string | null | undefined) {
  if (!message) {
    return null;
  }

  const summary = removeDetails(message).replace(/\s+/g, " ").trim().replace(LONG_HEX_PATTERN, shortenAddress);

  return summary || null;
}
