import { useState } from "react";
import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { WalletDisplay } from "@/components/WalletDisplay";

export default function App() {
  const [error, setError] = useState<string>("");
  const { openModal } = useModal();
  const { data: account, isLoading: accountLoading } = useAccount();
  const { data: wallet } = useWallet();

  const isConnected = account?.isConnected;
  const walletAddress = wallet?.address;

  if (accountLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <p className="text-center">Loading Para…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Chrome Extension</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para SDK in a Vite + React Chrome extension popup.
      </p>

      {isConnected && walletAddress ? (
        <WalletDisplay walletAddress={walletAddress} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}

      <button
        onClick={() => {
          try {
            openModal();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to open Para modal");
          }
        }}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Para Modal
      </button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </main>
  );
}
