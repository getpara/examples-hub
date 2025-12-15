import { useCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";

export function WalletInfo() {
  const { aminoSigner } = useCosmjsAminoSigner();
  const address = aminoSigner?.address;

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Connected Cosmos Wallet</h3>
      </div>
      <div className="px-6 py-3">
        <p className="text-sm text-gray-500">Address</p>
        <p className="text-lg font-medium text-gray-900 font-mono">
          {address ? `${address.slice(0, 12)}...${address.slice(-6)}` : "Loading..."}
        </p>
      </div>
    </div>
  );
}
