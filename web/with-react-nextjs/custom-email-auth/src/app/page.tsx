"use client";

import { useEffect, useRef, useState } from "react";
import { para } from "@/client/para";
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
    popupWindow.current?.close();
    return (popupWindow.current = window?.open(...args));
  };

  const getFirstWalletAddress = async (): Promise<string> => {
    const wallets = Object.values(await para.getWallets());
    return wallets?.[0]?.address || "unknown";
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      setError("");
      try {
        if (await para.isFullyLoggedIn()) {
          setWallet(await getFirstWalletAddress());
          setStep(Steps.COMPLETE);
        }
      } catch (err: any) {
        setError(err.message || "Authentication check failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleAuthenticateUser = async () => {
    setIsLoading(true);
    setError("");

    try {
      const authState = await para.signUpOrLogIn({ auth: { email } });

      if (authState.stage === "verify") {
        setStep(Steps.VERIFY);
        return;
      }

      if (authState.stage === "login") {
        openPopup(authState.passkeyUrl, "loginPopup", "popup=true");

        const { needsWallet } = await para.waitForLogin({
          isCanceled: () => popupWindow.current?.closed ?? true,
        });

        if (needsWallet) {
          await para.createWallet({ type: "EVM", skipDistribute: false });
        }

        setWallet(await getFirstWalletAddress());
        setStep(Steps.COMPLETE);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreateWallet = async () => {
    setIsLoading(true);
    setError("");

    try {
      const authState = await para.verifyNewAccount({ verificationCode });
      openPopup(authState.passkeyUrl, "signUpPopup", "popup=true");

      await para.waitForWalletCreation({
        isCanceled: () => Boolean(popupWindow.current?.closed),
      });

      setWallet(await getFirstWalletAddress());
      setStep(Steps.COMPLETE);
    } catch (err: any) {
      setError(
        err.message === "Invalid verification code"
          ? "Verification code incorrect or expired"
          : err.message || "Verification failed"
      );
    } finally {
      setIsLoading(false);
    }
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
