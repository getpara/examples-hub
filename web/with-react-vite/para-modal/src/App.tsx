import { useEffect, useState } from "react";
import { AuthLayout, OAuthMethod, ParaModal } from "@getpara/react-sdk";
import { para } from "./client/para";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "./components/WalletDisplay";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = async () => {
    handleCheckIfAuthenticated();
    console.log(para.exportSession());
    setIsOpen(false);
  };

  async function testWorkerEndpoint() {
    try {
      // Export the current Para session.
      const session = para.exportSession();

      // Build the request body for your Worker.
      const requestBody = {
        to: "0x1234567890123456789012345678901234567890",
        value: "1",
        contractAddress: "0x1234567890123456789012345678901234567890",
        serializedSession: session,
        decimals: 18,
      };

      // Send a POST request to your Worker.
      const response = await fetch("http://localhost:17004", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response);

      if (!response.ok) {
        throw new Error(`Worker returned error ${response.status} - ${response.statusText}`);
      }

      // Parse and log the response.
      const data = await response.json();
      console.log("Response from the Worker:", data);
    } catch (error) {
      console.error("Error testing Worker endpoint:", error);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal in a Next.js (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={wallet} /> : <p className="text-center">You are not logged in.</p>}
      <button
        disabled={isLoading}
        onClick={handleOpenModal}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Para Modal
      </button>
      <button
        onClick={testWorkerEndpoint}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Test Backend
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <ParaModal
        bareModal
        para={para}
        isOpen={true}
        onClose={handleCloseModal}
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
