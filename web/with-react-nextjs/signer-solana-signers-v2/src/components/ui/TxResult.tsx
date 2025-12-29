interface TxResultProps {
  signature: string;
  label?: string;
}

export function TxResult({ signature, label = "Transaction Signature" }: TxResultProps) {
  const explorerUrl = `https://solscan.io/tx/${signature}?cluster=devnet`;
  const shortSig = `${signature.slice(0, 8)}...${signature.slice(-8)}`;

  return (
    <div className="p-4 bg-gray-50 border border-gray-200">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <code className="text-sm font-mono text-gray-800 break-all">{shortSig}</code>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap">
          View on Solscan
        </a>
      </div>
    </div>
  );
}
