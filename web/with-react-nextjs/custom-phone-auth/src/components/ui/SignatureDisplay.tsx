"use client";

interface SignatureDisplayProps {
  signature: string;
}

export function SignatureDisplay({ signature }: SignatureDisplayProps) {
  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-none border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Signature</h4>
      <p className="text-xs font-mono text-gray-600 break-all">{signature}</p>
    </div>
  );
}