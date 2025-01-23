"use client";

import { WalletDisplay } from "@/components/WalletDisplay";
import { CustomCapsuleModalView } from "@leapwallet/cosmos-social-login-capsule-provider-ui";
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import { useAccount, useCapsule, useConnect, WalletType } from "graz";
import { OAuthMethod } from "@leapwallet/cosmos-social-login-capsule-provider";

export default function Home() {
  const { connect } = useConnect();
  const { isConnected, isConnecting, data: account } = useAccount();
  const { client, modalState, onAfterLoginSuccessful, setModalState, onLoginFailure } = useCapsule();

  const handleOpenModal = () => {
    connect({ walletType: WalletType.CAPSULE, chainId: "cosmoshub-4" });
  };

  const handleLoginSuccess = async () => {
    await onAfterLoginSuccessful?.();
  };

  const handleLoginFailure = () => {
    onLoginFailure();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule Modal + Graz Connector</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with the Graz Connector in a Next.js (App
        Router) project.
      </p>
      {isConnected ? (
        <WalletDisplay walletAddress={account?.bech32Address} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}
      <button
        disabled={isConnecting}
        onClick={handleOpenModal}
        className="rounded-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Open Modal
      </button>
      <div className="leap-ui">
        <CustomCapsuleModalView
          capsule={client?.getClient()}
          showCapsuleModal={modalState}
          setShowCapsuleModal={setModalState}
          theme="light"
          onAfterLoginSuccessful={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
          oAuthMethods={[
            OAuthMethod.APPLE,
            OAuthMethod.DISCORD,
            OAuthMethod.FACEBOOK,
            OAuthMethod.GOOGLE,
            OAuthMethod.TWITTER,
          ]}
          disableEmailLogin={false}
        />
      </div>
    </main>
  );
}
