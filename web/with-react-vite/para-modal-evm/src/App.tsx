import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "./components/WalletDisplay";

export default function Home() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { data: account, isLoading, error } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal + EVM Wallets Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with
        EVM Wallet Connectors in a Next.js (App Router) project.
      </p>
      {account?.isConnected ? (
        <WalletDisplay walletAddress={wallet?.address} />
      ) : (
        <p className="text-center">You are not logged in.</p>
      )}
      <button
        disabled={isLoading}
        onClick={openModal}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950"
      >
        Open Para Modal
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center">{error.message}</p>
      )}
      {/* <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={handleCloseModal}
        disableEmailLogin={true}
        disablePhoneLogin={true}
        authLayout={[AuthLayout.EXTERNAL_FULL]}
        externalWallets={[
          ExternalWallet.METAMASK,
          ExternalWallet.COINBASE,
          ExternalWallet.WALLETCONNECT,
          ExternalWallet.RAINBOW,
          ExternalWallet.ZERION,
          ExternalWallet.RABBY,
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
        appName="Para Modal + EVM Wallets Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      /> */}
    </main>
  );
}
