interface VerifyIframeProps {
  url: string;
  onCancel: () => void;
  statusMessage?: string;
}

export function VerifyIframe({ url, onCancel, statusMessage }: VerifyIframeProps) {
  return (
    <div className="space-y-4">
      <div className="border border-gray-200 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-[400px] border-0"
          allow="publickey-credentials-get *; publickey-credentials-create *"
          title="Para Verification"
        />
      </div>

      {statusMessage && (
        <div className="text-center text-sm text-gray-500">{statusMessage}</div>
      )}

      <button
        onClick={onCancel}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
        Cancel
      </button>
    </div>
  );
}
