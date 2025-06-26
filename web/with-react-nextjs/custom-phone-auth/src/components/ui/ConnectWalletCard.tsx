"use client";

interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="p-8 bg-white rounded-none border border-gray-200 text-center">
        <h3 className="text-lg font-semibold mb-3">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your Para wallet using phone authentication to sign messages and interact with the demo.
        </p>
        <button
          onClick={onConnect}
          className="px-6 py-3 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
          Connect with Phone
        </button>
      </div>
    </div>
  );
}