export const ACCOUNT_STANDARD = "ERC-4337";

export const ORCHESTRATOR_PROXY_PATH = "/api/orchestrator";

export function getOrchestratorProxyUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${ORCHESTRATOR_PROXY_PATH}`;
  }

  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${ORCHESTRATOR_PROXY_PATH}`;
}
