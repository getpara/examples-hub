"use client";

import { usePortoAccount } from "@/hooks/usePortoAccount";

function truncateHex(hex: string, chars = 8): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

function formatExpiry(expiry: number): string {
  if (expiry === 0) return "Never";
  return new Date(expiry * 1000).toLocaleDateString();
}

export function PortoDemo() {
  const {
    viemAccount,
    portoAccount,
    isViemLoading,
    isUpgrading,
    isCheckingStatus,
    error,
    upgradeToPorto,
    isConnected,
  } = usePortoAccount();

  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Connect your wallet to get started</p>
      </div>
    );
  }

  if (isViemLoading || isCheckingStatus) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Porto EIP-7702</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upgrade your EOA to a smart account using Porto&apos;s EIP-7702 infrastructure. This example
          demonstrates in-place account upgrades with programmable permissions and session keys.
        </p>
      </div>

      <div className="border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <h2 className="text-lg font-semibold">Para Account</h2>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
            EOA
          </span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Address</span>
            <span className="font-mono">{truncateHex(viemAccount?.address || "")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account Type</span>
            <span>Externally Owned Account</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Signing Keys</span>
            <span>1 (MPC-secured by Para)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Programmable Permissions</span>
            <span className="text-gray-400">Not supported</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Session Keys</span>
            <span className="text-gray-400">Not supported</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Batched Transactions</span>
            <span className="text-gray-400">Not supported</span>
          </div>
        </div>
      </div>

      {!portoAccount && (
        <div className="flex flex-col items-center py-4">
          <div className="w-px h-8 bg-gray-300" />
          <button
            onClick={upgradeToPorto}
            disabled={isUpgrading}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-950 disabled:opacity-50"
          >
            {isUpgrading ? "Upgrading..." : "Upgrade to Porto Smart Account"}
          </button>
          <div className="w-px h-8 bg-gray-300" />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {portoAccount && (
        <>
          <div className="flex justify-center">
            <div className="w-px h-8 bg-green-400" />
          </div>
          <div className="border-2 border-green-400 bg-green-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h2 className="text-lg font-semibold text-green-900">Porto Account</h2>
              <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">
                Smart Account
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                EIP-7702
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Address</span>
                <span className="font-mono text-green-900">{truncateHex(portoAccount.address)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Account Type</span>
                <span className="text-green-900">Delegated Smart Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Signing Keys</span>
                <span className="text-green-900">
                  {portoAccount.keys
                    ? [...new Set(portoAccount.keys.map((k: any) => k.publicKey))].length
                    : 0} authorized
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Programmable Permissions</span>
                <span className="text-green-600">Supported</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Session Keys</span>
                <span className="text-green-600">Supported</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Batched Transactions</span>
                <span className="text-green-600">Supported</span>
              </div>
            </div>

            {portoAccount.keys && portoAccount.keys.length > 0 && (
              <div className="mt-6 pt-4 border-t border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Authorized Keys</h3>
                <div className="space-y-3">
                  {portoAccount.keys
                    .filter((key: any, index: number, self: any[]) =>
                      index === self.findIndex((k) => k.publicKey === key.publicKey)
                    )
                    .map((key: any, index: number) => (
                    <div key={key.hash || index} className="bg-green-100/50 p-3 rounded text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">Role</span>
                        <span className={`px-2 py-0.5 rounded ${
                          key.role === "admin"
                            ? "bg-green-600 text-white"
                            : "bg-green-200 text-green-800"
                        }`}>
                          {key.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Type</span>
                        <span className="text-green-900">{key.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Public Key</span>
                        <span className="font-mono text-green-900">{truncateHex(key.publicKey, 6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Expiry</span>
                        <span className="text-green-900">{formatExpiry(key.expiry)}</span>
                      </div>
                      {key.permissions?.spend && key.permissions.spend.length > 0 && (
                        <div className="pt-2 border-t border-green-200">
                          <span className="text-green-700">Spend Limits</span>
                          <div className="mt-1 space-y-1">
                            {key.permissions.spend.map((p: any, i: number) => (
                              <div key={i} className="flex justify-between pl-2">
                                <span className="text-green-600">{p.period}</span>
                                <span className="text-green-900">{p.limit.toString()} {p.token ? truncateHex(p.token, 4) : "ETH"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
