import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectCard() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-none border border-gray-200 p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Connect Wallet</h2>
      <p className="text-gray-600 text-center mb-6">Connect your wallet to sign messages with Para.</p>
      <div className="flex justify-center" data-testid="auth-connect-button">
        <ConnectButton />
      </div>
    </div>
  );
}
