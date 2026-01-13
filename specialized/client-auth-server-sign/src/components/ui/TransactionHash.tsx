interface TransactionHashProps {
  txHash: string;
}

export function TransactionHash({ txHash }: TransactionHashProps) {
  if (!txHash) return null;

  return (
    <div className="mt-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none cursor-pointer">
          View on Etherscan
        </a>
      </div>
      <div className="p-6">
        <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">{txHash}</p>
      </div>
    </div>
  );
}
