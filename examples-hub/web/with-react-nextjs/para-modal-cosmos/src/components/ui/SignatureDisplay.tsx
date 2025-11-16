interface SignatureDisplayProps {
  signature: string;
}

export function SignatureDisplay({ signature }: SignatureDisplayProps) {
  if (!signature) return null;

  return (
    <div className="bg-white rounded-none border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-2">Signature</h3>
      <div className="bg-gray-50 p-4 rounded-none border border-gray-200 break-all" data-testid="sign-signature-display">
        <code className="text-sm text-gray-800 font-mono">{signature}</code>
      </div>
    </div>
  );
}