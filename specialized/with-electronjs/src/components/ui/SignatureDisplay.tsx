interface SignatureDisplayProps {
  signature: string;
}

export function SignatureDisplay({ signature }: SignatureDisplayProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(signature);
  };

  return (
    <div className="rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900">Signature</h3>
        <button
          onClick={copyToClipboard}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Copy
        </button>
      </div>
      <div className="px-6 py-3">
        <p className="text-sm font-mono text-gray-600 break-all">{signature}</p>
      </div>
    </div>
  );
}