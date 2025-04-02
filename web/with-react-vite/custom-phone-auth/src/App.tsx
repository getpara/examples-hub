import { useEffect, useRef, useState } from "react";
import { para } from "./client/para";
import { AuthStateSignup, formatPhoneNumber, WalletType } from "@getpara/web-sdk";
import { PhoneInput } from "./components/PhoneInput";
import { OTPInput } from "./components/OTPInput";
import { AuthButton } from "./components/AuthButton";
import { WalletDisplay } from "./components/WalletDisplay";

enum Steps {
  AUTH_INPUT = 0,
  VERIFY = 1,
  COMPLETE = 2,
}

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
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
      const authState = await para.signUpOrLogInV2({ auth: { phone: formatPhoneNumber(phoneNumber, countryCode) }});

      switch (authState.stage) {
        case 'verify':
          setStep(1);
          break;
  
        case 'login': {
          const { passkeyUrl } = authState;

          const popupWindow = window.open(passkeyUrl, "loginPopup", "popup=true");
          if (!popupWindow) throw new Error("Popup was blocked");  

          const { needsWallet } = await para.waitForLogin({
            isCanceled: () => popupWindow.closed,
          });

          if (needsWallet) {
            await para.createWallet({ type: WalletType.EVM, skipDistribute: false });
          }

          const wallets = Object.values(await para.getWallets());
          if (wallets?.length) {
            setWallet(wallets[0].address || "unknown");
          }

          setStep(2);
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
      <h1 className="text-2xl font-bold">Custom Phone Auth + Para Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates a minimal custom phone authentication flow using Para's SDK in a Next.js (App Router)
        project.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 p-4 max-w-sm w-full">
        {step < 2 && (
          <h2 className="text-xl font-bold text-center">
            {step === 0 ? "Custom Phone Auth: Step 1" : "Custom Phone Auth: Step 2"}
          </h2>
        )}

        {step === Steps.AUTH_INPUT && (
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
              Verify Phone & Create Wallet
            </AuthButton>
          </>
        )}

        {step === Steps.COMPLETE && <WalletDisplay walletAddress={wallet} />}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </main>
  );
}
