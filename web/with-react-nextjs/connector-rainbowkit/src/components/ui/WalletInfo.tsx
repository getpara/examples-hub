import { useAccount } from "wagmi";

export function WalletInfo() {
  const { address } = useAccount();

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Connected Wallet</h3>
      </div>
      <div className="px-6 py-3">
        <p className="text-sm text-gray-500">Address</p>
        <p className="text-lg font-medium text-gray-900 font-mono" data-testid="account-address-display">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
    </div>
  );
}
