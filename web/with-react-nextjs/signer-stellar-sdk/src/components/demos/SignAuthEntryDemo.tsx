"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { useSignAuthEntry } from "@/hooks/useSignAuthEntry";
import { useStellarWalletConnection } from "@/hooks/useStellarWalletConnection";

export default function SignAuthEntryDemo() {
  const [authEntryData, setAuthEntryData] = useState("");

  const wallet = useStellarWalletConnection();
  const { signAuthEntry, signedEntry, signerAddress, isLoading, error, isReady } = useSignAuthEntry();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authEntryData.trim()) return;
    await signAuthEntry(authEntryData.trim());
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Sign Auth Entry Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Sign a base64-encoded Soroban authorization entry with Para's Stellar signer.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {error && <StatusAlert type="error" message={error.message} />}
        {signedEntry && !error && <StatusAlert type="success" message="Auth entry signed successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="authEntry" className="block text-sm font-medium text-foreground">
              Auth Entry (Base64)
            </label>
            <textarea
              id="authEntry"
              value={authEntryData}
              onChange={(event) => setAuthEntryData(event.target.value)}
              placeholder="Paste base64-encoded authorization entry data"
              required
              disabled={isLoading}
              rows={4}
              className="field-control"
            />
          </div>

          <ActionButton
            type="submit"
            isLoading={isLoading}
            disabled={!authEntryData.trim() || !isReady || !wallet.isConnected}
            loadingText="Signing Auth Entry...">
            {!wallet.isConnected ? "Connect Wallet" : "Sign Auth Entry"}
          </ActionButton>

          {signedEntry && <TxResult signature={signedEntry} label="Signed Auth Entry" showExplorerLink={false} />}

          {signerAddress && (
            <div className="mt-4">
              <DataField label="Signer Address" value={signerAddress} mono />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
