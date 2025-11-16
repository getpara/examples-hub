interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-none border border-gray-200 p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Connect Wallet</h2>
      <p className="text-gray-600 text-center mb-6">
        Connect your wallet to sign messages with Para.
      </p>
      <button
        onClick={onConnect}
        data-testid="auth-connect-button"
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors font-medium">
        Connect with Para
      </button>
    </div>
  );
}