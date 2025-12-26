interface SignMessageProps {
  message: string;
  onSign: () => void;
  isPending: boolean;
  error: Error | null;
  signature?: string;
}

export function SignMessage({ message, onSign, isPending, error, signature }: SignMessageProps) {
  const showStatus = isPending || !!error || !!signature;

  const statusConfig = isPending
    ? { bg: "bg-gray-100 border-gray-300", text: "text-gray-700", message: `Signing '${message}'...` }
    : error
    ? { bg: "bg-gray-200 border-gray-400", text: "text-gray-900", message: error.message || `Failed to sign '${message}'. Please try again.` }
    : { bg: "bg-gray-50 border-gray-200", text: "text-gray-800", message: `'${message}' signed successfully!` };

  return (
    <>
      {showStatus && (
        <div className={`mb-4 p-4 rounded-none border ${statusConfig.bg}`}>
          <p className={`text-sm ${statusConfig.text}`}>{statusConfig.message}</p>
        </div>
      )}

      <div className="bg-white rounded-none border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium mb-4">Sign Message</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-none">
            <p className="text-sm text-gray-600 mb-1">Message to sign:</p>
            <p className="text-lg font-mono font-semibold">{message}</p>
          </div>
          <button
            onClick={onSign}
            disabled={isPending}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
            {isPending ? "Signing..." : `Sign ${message}`}
          </button>
        </div>
      </div>

      {signature && (
        <div className="bg-white rounded-none border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-2">Signature</h3>
          <div className="bg-gray-50 p-4 rounded-none border border-gray-200 break-all" data-testid="sign-signature-display">
            <code className="text-sm text-gray-800 font-mono">{signature}</code>
          </div>
        </div>
      )}
    </>
  );
}
