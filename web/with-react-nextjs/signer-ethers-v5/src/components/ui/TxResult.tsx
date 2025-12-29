interface TxResultProps {
  hash: string;
  explorerUrl?: string;
}

const DEFAULT_EXPLORER = "https://holesky.etherscan.io/tx";

export function TxResult({ hash, explorerUrl }: TxResultProps) {
  const baseUrl = explorerUrl || DEFAULT_EXPLORER;

  return (
    <div className="mt-8 rounded-none border border-gray-200">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Transaction Details:</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
            <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
              {hash}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Explorer Link:</p>
            <a
              href={`${baseUrl}/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-900 hover:text-gray-700 underline">
              View on Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
