import { useEffect, useState } from "react";
import { ParaModal, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { para, paraReady } from "./client/para";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "./components/WalletDisplay";

export default function App() {
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        await paraReady;
        await refreshSessionState();
      } catch (e: any) {
        setError(e?.message ?? "Failed to initialise Para");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const refreshSessionState = async () => {
    try {
      const authenticated = await para.isFullyLoggedIn();
      setIsConnected(authenticated);

      if (authenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets.length) setWallet(wallets[0]?.address ?? "unknown");
      } else {
        setWallet("");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to check auth status");
    }
  };

  if (!ready) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <p className="text-center">Loading&nbsp;Para…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal in a Vite + React Chrome extension popup.
      </p>

      {isConnected ? <WalletDisplay walletAddress={wallet} /> : <p className="text-center">You are not logged in.</p>}

      <button
        onClick={() => setIsOpen(true)}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Para Modal
      </button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={async () => {
          await refreshSessionState();
          setIsOpen(false);
        }}
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
