import { useAccount, useModal, useWallet } from "@getpara/react-sdk";

export function Header() {
  const { isConnected } = useAccount();
  const { openModal } = useModal();
  const { data: wallet } = useWallet();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img src="/para.svg" alt="Para Logo" className="w-8 h-8" />
            <span className="font-semibold text-lg">Para SDK</span>
          </div>

          <nav>
            {isConnected ? (
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-gray-700 text-white rounded-none hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer"
                data-testid="account-address-display"
              >
                Connected: {wallet?.address?.slice(0, 6)}...
                {wallet?.address?.slice(-4)}
              </button>
            ) : (
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium"
                data-testid="header-connect-button"
              >
                Connect Wallet
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
