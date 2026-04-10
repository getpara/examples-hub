"use client";

import { useState } from "react";
import { useSignAuthEntry } from "@/hooks/useSignAuthEntry";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";

export default function SignAuthEntryPage() {
  const [authEntryData, setAuthEntryData] = useState("");
  const { signAuthEntry, signedEntry, signerAddress, isLoading, error, isReady } = useSignAuthEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !authEntryData.trim()) return;
    await signAuthEntry(authEntryData.trim());
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Sign Auth Entry Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a Soroban authorization entry with your connected wallet. This demonstrates the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">signAuthEntry</code>{" "}
          capability for Soroban smart contract interactions.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {error && <StatusAlert type="error" message={error.message} />}

        {signedEntry && !error && <StatusAlert type="success" message="Auth entry signed successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="authEntry" className="block text-sm font-medium text-gray-700">
              Auth Entry (Base64)
            </label>
            <textarea
              id="authEntry"
              value={authEntryData}
              onChange={(e) => setAuthEntryData(e.target.value)}
              placeholder="Paste base64-encoded authorization entry data..."
              required
              disabled={isLoading}
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500 resize-y"
            />
          </div>

          <ActionButton
            type="submit"
            disabled={!authEntryData.trim() || !isReady}
            isLoading={isLoading}
            loadingText="Signing...">
            Sign Auth Entry
          </ActionButton>

          {signedEntry && (
            <TxResult signature={signedEntry} label="Signed Auth Entry:" showExplorerLink={false} />
          )}

          {signerAddress && (
            <div className="mt-4 rounded-none border border-gray-200">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signer Address:</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {signerAddress}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
