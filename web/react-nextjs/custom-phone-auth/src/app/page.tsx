"use client";

import { useEffect, useState } from "react";
import { capsule } from "@/client/capsule";
import { WalletType } from "@usecapsule/web-sdk";
import { PhoneInput } from "@/components/PhoneInput";
import { OTPInput } from "@/components/OTPInput";
import { AuthButton } from "@/components/AuthButton";
import { WalletDisplay } from "@/components/WalletDisplay";
import { CountryCallingCode } from "libphonenumber-js";

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
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
      const isExistingUser = await capsule.checkIfUserExistsByPhone(phoneNumber, countryCode as CountryCallingCode);

      if (isExistingUser) {
        const webAuthUrlForLogin = await capsule.initiateUserLoginForPhone(
          phoneNumber,
          countryCode as CountryCallingCode
        );
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
        await capsule.createUserByPhone(phoneNumber, countryCode as CountryCallingCode);
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
      const isVerified = await capsule.verifyPhone(verificationCode);
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
      <h1 className="text-2xl font-bold">Custom Phone Auth + Capsule Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates a minimal custom phone authentication flow using Capsule's SDK in a Next.js (App
        Router) project.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 p-4 max-w-sm w-full">
        {step < 2 && (
          <h2 className="text-xl font-bold text-center">
            {step === 0 ? "Custom Phone Auth: Step 1" : "Custom Phone Auth: Step 2"}
          </h2>
        )}

        {step === 0 && (
          <>
            <PhoneInput
              disabled={isLoading}
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onChange={({ countryCode: newCode, phoneNumber: newPhone }) => {
                setCountryCode(newCode);
                setPhoneNumber(newPhone);
              }}
            />
            <AuthButton
              isLoading={isLoading}
              disabled={!phoneNumber || !countryCode}
              onClick={handleAuthenticateUser}>
              Check or Create Account
            </AuthButton>
          </>
        )}

        {step === 1 && (
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
              Verify Phone & Create Wallet
            </AuthButton>
          </>
        )}

        {step === 2 && <WalletDisplay walletAddress={wallet} />}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </main>
  );
}
