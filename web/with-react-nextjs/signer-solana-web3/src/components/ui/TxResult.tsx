interface TxResultProps {
  signature: string;
  label?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TxResult({ signature, label = "Transaction Signature:", actionLabel, onAction }: TxResultProps) {
  const explorerUrl = `https://solscan.io/tx/${signature}?cluster=devnet`;

  return (
    <div className="mt-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
            {actionLabel}
          </button>
        ) : (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
            View on Solscan
          </a>
        )}
      </div>
      <div className="p-6">
        <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">{signature}</p>
      </div>
    </div>
  );
}
