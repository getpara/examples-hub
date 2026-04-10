import { TESTNET_EXPLORER_URL } from "@/config/constants";

interface TxResultProps {
  signature: string;
  label?: string;
  showExplorerLink?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  "data-testid"?: string;
}

export function TxResult({
  signature,
  label = "Transaction Hash:",
  showExplorerLink = true,
  actionLabel,
  onAction,
  "data-testid": testId,
}: TxResultProps) {
  const explorerUrl = `${TESTNET_EXPLORER_URL}/${signature}`;

  return (
    <div className="mt-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <div className="flex gap-2">
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
              {actionLabel}
            </button>
          )}
          {showExplorerLink && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
              View on Stellar Expert
            </a>
          )}
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200" data-testid={testId}>
          {signature}
        </p>
      </div>
    </div>
  );
}
