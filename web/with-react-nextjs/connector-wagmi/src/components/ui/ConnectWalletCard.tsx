import { Card } from "./Card";

interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <Card title="ETH Transfer" description="Connect your wallet before sending Sepolia ETH.">
      <button
        type="button"
        onClick={onConnect}
        data-testid="auth-connect-button"
        className="btn-primary w-full px-4 py-3">
        Connect Wallet
      </button>
    </Card>
  );
}
