interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-none border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to start signing messages with Para in this Electron app.
        </p>
        <button
          onClick={onConnect}
          className="rounded-none px-6 py-3 bg-blue-900 text-white hover:bg-blue-950 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}