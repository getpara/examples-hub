"use client";

import { useEffect, useState } from "react";
import { para } from "@/client/para";
import { WalletDisplay } from "@/components/WalletDisplay";
import { CustomCapsuleModalView } from "@leapwallet/cosmos-social-login-capsule-provider-ui";
import { OAuthMethod } from "@getpara/web-sdk";
import { useChain } from "@cosmos-kit/react";
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";
import "@interchain-ui/react/styles";

export default function Home() {
  const { openView, closeView, connect, isWalletConnected, isWalletConnecting, address } = useChain("cosmoshub");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.openParaModal = () => {
      setIsOpen(true);
    };
  }, []);

  const handleLoginSuccess = async () => {
    window.successFromParaModal();
  };

  const handleLoginFailure = () => {
    window.failureFromParaModal();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal + Cosmos Kit Connector</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Leap Social Login Para Modal with the Cosmos Kit
        Connector in a Next.js (App Router) project.
      </p>
      {isWalletConnected ? (
        <WalletDisplay walletAddress={address} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}
      <button
        disabled={isWalletConnecting}
        onClick={isWalletConnected ? closeView : openView}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Modal
      </button>
      <div className="leap-ui z-[2147483647]">
        <CustomCapsuleModalView
          para={para as any}
          showParaModal={isOpen}
          setShowParaModal={setIsOpen}
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
