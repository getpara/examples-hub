import { useModal, useWallet, useAccount } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "./components/WalletDisplay";

export default function Home() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { data: account, isLoading, error } = useAccount();

  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     const isAuthenticated = await para.isFullyLoggedIn();
  //     setIsConnected(isAuthenticated);
  //     if (isAuthenticated) {
  //       const wallets = Object.values(await para.getWallets());
  //       if (wallets?.length) {
  //         setWallet(wallets[0].address || "unknown");
  //       }
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "An error occurred during authentication");
  //   }
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   handleCheckIfAuthenticated();
  // }, []);

  // const handleOpenModal = () => {
  //   setIsOpen(true);
  // };

  // const handleCloseModal = async () => {
  //   handleCheckIfAuthenticated();
  //   setIsOpen(false);
  // };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">
        Para Modal + Cosmos Wallets Example
      </h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with
        Cosmos Wallet Connectors in a Next.js (App Router) project.
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
    </main>
  );
}
