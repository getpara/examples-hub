"use client";

import { useConnect } from "wagmi";

export function WalletConnectors() {
  const { connect, connectors } = useConnect();

  const capsuleConnector = connectors.find((connector) => connector.id === "capsule");
  const otherConnectors = connectors.filter((connector) => connector.id !== "capsule");

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Capsule Wagmi Example</h2>

        <div className="space-y-6">
          {/* Social Login Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Social Login</h3>
            {capsuleConnector && (
              <button
                onClick={() => connect({ connector: capsuleConnector })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Connect with {capsuleConnector.name}
              </button>
            )}
          </div>

          {/* Other Wallets Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Other Wallets</h3>
            <div className="space-y-2">
              {otherConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                  Connect with {connector.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
