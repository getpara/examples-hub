import { useWallet } from "@getpara/react-sdk";

interface WalletInfoProps {
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function WalletInfo({ smartAccountAddress, isLoading, error }: WalletInfoProps) {
  const { data: wallet } = useWallet();
  const eoaAddress = wallet?.address;

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Connected Wallets</h3>
      </div>

      <div className="px-6 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-500">EOA (Para Wallet)</p>
        <p className="text-lg font-medium text-gray-900 font-mono">
          {eoaAddress?.slice(0, 6)}...{eoaAddress?.slice(-4)}
        </p>
      </div>

      <div className="px-6 py-3">
        <p className="text-sm text-gray-500">Smart Account (Gelato EIP-7702)</p>
        {isLoading ? (
          <p className="text-lg font-medium text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-sm font-medium text-red-600 break-words">{error.message}</p>
        ) : smartAccountAddress ? (
          <p className="text-lg font-medium text-gray-900 font-mono">
            {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
          </p>
        ) : (
          <p className="text-lg font-medium text-gray-400">Not available</p>
        )}
      </div>
    </div>
  );
}
