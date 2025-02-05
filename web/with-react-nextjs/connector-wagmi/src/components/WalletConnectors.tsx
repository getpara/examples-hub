"use client";

import { useConnect } from "wagmi";

export function WalletConnectors() {
  const { connect, connectors } = useConnect();

  const paraConnector = connectors.find((connector) => connector.id === "para");
  const otherConnectors = connectors.filter((connector) => connector.id !== "para");

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Para Wagmi Example</h2>

        <div className="space-y-6">
          {/* Social Login Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Social Login</h3>
            {paraConnector && (
              <button
                onClick={() => connect({ connector: paraConnector })}
                className="w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors">
                Connect with {paraConnector.name}
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
