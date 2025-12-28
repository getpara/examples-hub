import { Card } from "./Card";

interface TxResultProps {
  signature: string;
  label?: string;
}

export function TxResult({ signature, label = "Transaction Signature" }: TxResultProps) {
  const explorerUrl = `https://solscan.io/tx/${signature}?cluster=devnet`;

  return (
    <Card title={label}>
      <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">{signature}</p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
        View on Solscan
      </a>
    </Card>
  );
}
