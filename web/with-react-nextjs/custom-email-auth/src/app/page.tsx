"use client";

import { useEffect, useRef, useState } from "react";
import { para } from "@/client/para";
import { AuthStateSignup, WalletType } from "@getpara/web-sdk";
import { EmailInput } from "@/components/EmailInput";
import { OTPInput } from "@/components/OTPInput";
import { AuthButton } from "@/components/AuthButton";
import { WalletDisplay } from "@/components/WalletDisplay";

enum Steps {
  AUTH_INPUT = 0,
  VERIFY = 1,
  COMPLETE = 2,
}

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");
  const popupWindow = useRef<Window | null>(null);

  const openPopup = (...args: Parameters<typeof window.open>) => {
    if (popupWindow.current) {
      popupWindow.current.close();
    }

    popupWindow.current = window?.open(...args);

    return popupWindow.current;
  }

  const handleCheckIfAuthenticated = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
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
      const authState = await para.signUpOrLogInV2({ auth: { email }});

      switch (authState.stage) {
        case 'verify':
          setStep(Steps.VERIFY);
          break;
  
        case 'login': {
          const { passkeyUrl } = authState;

          openPopup(passkeyUrl, "loginPopup", "popup=true");

          const { needsWallet } = await para.waitForLogin({
            isCanceled: () => popupWindow.current.closed,
          });

          if (needsWallet) {
            await para.createWallet({ type: WalletType.EVM, skipDistribute: false });
          }

          const wallets = Object.values(await para.getWallets());
          if (wallets?.length) {
            setWallet(wallets[0].address || "unknown");
          }

          setStep(Steps.COMPLETE);
        }
        break;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  const handleVerifyAndCreateWallet = async () => {
    setIsLoading(true);
    setError("");

    let authState: AuthStateSignup;

    try {
      authState = await para.verifyNewAccount({ verificationCode });
    } catch (e) {
      setError("Verification code incorrect or expired");
      setIsLoading(false);
      return;
    }

    openPopup(authState.passkeyUrl, "signUpPopup", "popup=true");

    try {
    await para.waitForWalletCreation({
        isCanceled: () => popupWindow.current?.closed,
      })

      const wallets = Object.values(await para.getWallets());

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
      <h1 className="text-2xl font-bold">Custom Email Auth + Para Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates a minimal custom email authentication flow using Para's SDK in a Next.js (App Router)
        project.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 p-4 max-w-sm w-full">
        {step < 2 && (
          <h2 className="text-xl font-bold text-center">
            {step === 0 ? "Custom Email Auth: Step 1" : "Custom Email Auth: Step 2"}
          </h2>
        )}

        {step === Steps.AUTH_INPUT && (
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

        {step === Steps.VERIFY && (
          <>
            <OTPInput
              disabled={isLoading}
              value={verificationCode}
              onChange={setVerificationCode}
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

        {step === Steps.COMPLETE && <WalletDisplay walletAddress={wallet} />}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </main>
  );
}
