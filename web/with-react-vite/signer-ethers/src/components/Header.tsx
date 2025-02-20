import { usePara } from "./ParaProvider";

export default function Header() {
  const pathname = window.location.pathname;
  const { isConnected, openModal, address } = usePara();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <nav>
          {pathname !== "/" && (
            <a
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 px-4 py-2 rounded-none transition-colors">
              ← Back to Selector
            </a>
          )}
        </nav>
        <div>
          {isConnected ? (
            <button
              onClick={openModal}
              className="px-4 py-2 bg-green-700 text-white rounded-none hover:bg-green-800 transition-colors">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={openModal}
              className="px-4 py-2 bg-blue-900 text-white rounded-none hover:bg-blue-950 transition-colors">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
