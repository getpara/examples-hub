"use client";

import { useEffect, useState } from "react";
import {
  AuthLayout,
  ParaModal,
  OAuthMethod,
  ModalStep,
  ParaWeb,
  WalletType,
  CurrentWalletIds,
} from "@getpara/react-sdk";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import Spinner from "@/components/Spinner";

/**
 * Home component that manages the authentication state and wallet creation process.
 *
 * This component:
 * - Checks if the user is authenticated on mount.
 * - Manages the current modal step and displays a loading spinner during wallet creation steps.
 * - Handles wallet creation and stores the recovery secret.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <Home />
 */
export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [secret, setSecret] = useState<string>("");

  const [currentModalStep, setCurrentModalStep] = useState<ModalStep>();

  const handleCheckIfAuthenticated = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets?.length) {
          setWallet(wallets[0].address || "unknown");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleCheckIfAuthenticated();
  }, []);

  const handleStepChange = (step: { previousStep: ModalStep; currentStep: ModalStep; canGoBack: boolean }) => {
    if (
      step.currentStep === ModalStep.AWAITING_WALLET_CREATION ||
      step.currentStep === ModalStep.WALLET_CREATION_DONE ||
      step.currentStep === ModalStep.SECRET
    ) {
      // SET A PAGE STATE DURING THE STEP SO THAT YOU CAN SHOW A LOADING SPINNER OR SOMETHING
      setCurrentModalStep(step.currentStep);
      return;
    }
  };

  const handleWalletCreationOverride = async (
    para: ParaWeb
  ): Promise<{
    recoverySecret?: string;
    walletIds: CurrentWalletIds;
  }> => {
    const [wallet, recoverySecret] = await para.createWallet({ type: WalletType.SOLANA });
    // DO SOMETHING WITH THE WALLET SECRET. This is the recovery secret. If you set the recoverySecretStepEnabled to true, the user will see this secret as well so they can store it otherwise you should store it for them.
    setSecret(recoverySecret!);
    return {
      recoverySecret: recoverySecret as string | undefined,
      walletIds: {
        [WalletType.SOLANA]: [wallet.id],
      },
    };
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Current Modal Step: {currentModalStep}</h1>
      {secret && <p className="text-xl font-semibold text-center max-w-md text-wrap">The User Secret: {secret}</p>}

      {(currentModalStep === ModalStep.AWAITING_WALLET_CREATION ||
        currentModalStep === ModalStep.WALLET_CREATION_DONE) && <Spinner />}

      <ParaModal
        para={para}
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
        recoverySecretStepEnabled={false}
        twoFactorAuthEnabled={false}
        bareModal={
          currentModalStep === ModalStep.AWAITING_WALLET_CREATION ||
          currentModalStep === ModalStep.WALLET_CREATION_DONE ||
          currentModalStep === ModalStep.SECRET
            ? false
            : true
        }
        isOpen={false}
        onModalStepChange={handleStepChange}
        createWalletOverride={handleWalletCreationOverride}
      />
    </main>
  );
}
