"use client";

import { WalletDisplay } from "@/components/WalletDisplay";
import { AuthLayout, OAuthMethod, ParaModal, useAccount, useModal, useWallet } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

export default function Home() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { data: account, isLoading, error } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal in a Next.js (App Router) project.
      </p>
      {account?.isConnected ? (
        <WalletDisplay walletAddress={wallet?.address} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}
      <button
        disabled={isLoading}
        onClick={openModal}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Para Modal
      </button>

      {error && <p className="text-red-500 text-sm text-center">{error.message}</p>}
      <ParaModal
        disableEmailLogin={false}
        disablePhoneLogin={false}
        authLayout={[AuthLayout.AUTH_FULL]}
        oAuthMethods={[
          OAuthMethod.APPLE,
          OAuthMethod.DISCORD,
          OAuthMethod.FACEBOOK,
          OAuthMethod.FARCASTER,
          OAuthMethod.GOOGLE,
          OAuthMethod.TWITTER,
        ]}
        onRampTestMode={true}
        theme={{
          foregroundColor: "#2D3648",
          backgroundColor: "#FFFFFF",
          accentColor: "#0066CC",
          darkForegroundColor: "#E8EBF2",
          darkBackgroundColor: "#1A1F2B",
          darkAccentColor: "#4D9FFF",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        }}
        appName="Para Modal Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </main>
  );
}
