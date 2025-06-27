import { Card } from "./Card";

interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="max-w-xl mx-auto">
      <Card
        title="ETH Transfer"
        description="Send ETH from your wallet to any address using Wagmi">
        <button
          onClick={onConnect}
          className="w-full rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors cursor-pointer">
          Connect Wallet
        </button>
      </Card>
    </div>
  );
}