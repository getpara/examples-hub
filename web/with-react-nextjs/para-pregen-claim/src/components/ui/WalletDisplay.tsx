interface WalletDisplayProps {
  walletAddress?: string;
}

export const WalletDisplay = ({ walletAddress }: WalletDisplayProps) => (
  <div className="flex flex-col gap-2">
    {walletAddress ? (
      <p className="text-gray-700">
        Wallet address: <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{walletAddress}</code>
      </p>
    ) : (
      <p className="text-gray-500">No wallet found.</p>
    )}
  </div>
);
