"use client";

import { WalletDisplay } from "@/components/WalletDisplay";
import { CustomCapsuleModalView } from "@leapwallet/cosmos-social-login-capsule-provider-ui";
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import { useAccount, usePara, useConnect, WalletType } from "graz";
import { OAuthMethod } from "@leapwallet/cosmos-social-login-capsule-provider";

export default function Home() {
  const { connect } = useConnect();
  const { isConnected, isConnecting, data: account } = useAccount();
  const { client, modalState, onAfterLoginSuccessful, setModalState, onLoginFailure } = usePara();

  const handleOpenModal = () => {
    connect({ walletType: WalletType.PARA, chainId: "cosmoshub-4" });
  };

  const handleLoginSuccess = async () => {
    await onAfterLoginSuccessful?.();
  };

  const handleLoginFailure = () => {
    onLoginFailure();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal + Graz Connector</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with the Graz Connector in a Next.js (App
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
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Modal
      </button>
      <div className="leap-ui">
        <CustomCapsuleModalView
          para={client?.getClient()}
          showParaModal={modalState}
          setShowParaModal={setModalState}
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
