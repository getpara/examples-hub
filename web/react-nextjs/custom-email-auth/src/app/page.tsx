"use client";

import { useEffect, useState } from "react";
import { capsule } from "@/client/capsule";
import { WalletType } from "@usecapsule/web-sdk";
import { EmailInput } from "@/components/EmailInput";
import { VerificationInput } from "@/components/VerificationInput";
import { AuthButton } from "@/components/AuthButton";
import { WalletDisplay } from "@/components/WalletDisplay";

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCheckIfAuthenticated = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isAuthenticated = await capsule.isFullyLoggedIn();
      if (isAuthenticated) {
        const wallets = Object.values(await capsule.getWallets());
        if (wallets?.length) {
          setWallet(wallets[0].address || "unknown");
        }
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleCheckIfAuthenticated();
  }, []);

  const handleAuthenticateUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isExistingUser = await capsule.checkIfUserExists(email);

      if (isExistingUser) {
        const webAuthUrlForLogin = await capsule.initiateUserLogin(email, false, "email");
        const popupWindow = window.open(webAuthUrlForLogin, "loginPopup", "popup=true");
        if (!popupWindow) throw new Error("Popup was blocked");

        const { isComplete, needsWallet } = await capsule.waitForLoginAndSetup(popupWindow);

        if (needsWallet) {
          await capsule.createWallet(WalletType.EVM, false);
        }

        const wallets = Object.values(await capsule.getWallets());
        if (wallets?.length) {
          setWallet(wallets[0].address || "unknown");
        }
        setStep(2);
      } else {
        await capsule.createUser(email);
        setStep(1);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  const handleVerifyAndCreateWallet = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isVerified = await capsule.verifyEmail(verificationCode);
      if (!isVerified) {
        setError("Verification code incorrect or expired");
        setIsLoading(false);
        return;
      }

      const setupUrl = await capsule.getSetUpBiometricsURL(false);
      const popupWindow = window.open(setupUrl, "signUpPopup", "popup=true");

      if (!popupWindow) {
        throw new Error("Popup was blocked");
      }

      await capsule.waitForPasskeyAndCreateWallet();
      const wallets = Object.values(await capsule.getWallets());

      if (wallets?.length) {
        setWallet(wallets[0].address || "unknown");
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred during verification");
    }
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Custom Email Auth + Capsule Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates a minimal custom email authentication flow using Capsule's SDK in a Next.js (App
        Router) project.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 p-4 max-w-sm w-full">
        {step < 2 && (
          <h2 className="text-xl font-bold text-center">
            {step === 0 ? "Custom Email Auth: Step 1" : "Custom Email Auth: Step 2"}
          </h2>
        )}

        {step === 0 && (
          <>
            <EmailInput
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthButton
              isLoading={isLoading}
              disabled={!email}
              onClick={handleAuthenticateUser}>
              Check or Create Account
            </AuthButton>
          </>
        )}

        {step === 1 && (
          <>
            <VerificationInput
              disabled={isLoading}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <AuthButton
              isLoading={isLoading}
              disabled={!verificationCode}
              onClick={handleVerifyAndCreateWallet}
              loadingText="Verifying...">
              Verify Email & Create Wallet
            </AuthButton>
          </>
        )}

        {step === 2 && <WalletDisplay walletAddress={wallet} />}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </main>
  );
}
