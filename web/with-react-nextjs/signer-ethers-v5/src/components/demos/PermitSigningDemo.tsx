"use client";

import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { usePermitSigning } from "@/hooks/usePermitSigning";

export default function PermitSigningDemo() {
  const wallet = useEvmWalletConnection();
  const {
    signPermit,
    fetchTokenData,
    tokenBalance,
    currentAllowance,
    signedPermit,
    isLoading,
    isDataLoading,
    isReady,
    error,
    reset,
  } = usePermitSigning();

  const handleSign = async () => {
    reset();
    await signPermit();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Permit Signing Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Sign an ERC20 permit to allow the contract owner to transfer your CTT tokens. This demonstrates the{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">ERC20Permit</code>{" "}
          functionality.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Token Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Your CTT Balance:</p>
                <p className="text-lg font-medium text-card-foreground">
                  {!wallet.isConnected
                    ? "Please connect your wallet"
                    : isDataLoading
                      ? "Loading..."
                      : tokenBalance
                        ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                        : "Unable to fetch balance"}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTokenData}
                disabled={isDataLoading || !wallet.isConnected}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                title="Refresh data">
                {isDataLoading ? "Loading" : "Refresh"}
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Owner Allowance:</p>
              <p className="text-lg font-medium text-card-foreground">
                {!wallet.isConnected
                  ? "Please connect your wallet"
                  : isDataLoading
                    ? "Loading..."
                    : currentAllowance
                      ? `${parseFloat(currentAllowance).toFixed(4)} CTT`
                      : "Unable to fetch allowance"}
              </p>
            </div>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {signedPermit && (
          <StatusAlert
            type="success"
            message="Permit signed successfully! The contract owner can now use this signature to approve token transfers."
          />
        )}

        <ActionButton
          onClick={handleSign}
          isLoading={isLoading}
          disabled={!isReady || !wallet.isConnected}
          loadingText="Signing Permit...">
          Sign Permit
        </ActionButton>

        {signedPermit && (
          <div className="mt-8 space-y-4">
            <Card title="Signed Permit Data">
              <div className="space-y-4">
                <DataField label="Deadline" value={signedPermit.deadline} mono />
                <DataField label="v" value={String(signedPermit.v)} mono />
                <DataField label="r" value={signedPermit.r} mono />
                <DataField label="s" value={signedPermit.s} mono />
              </div>
            </Card>

            <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
              <p>
                The contract owner can now use these permit values to approve token transfers on your behalf. The permit
                is valid for 1 hour from the time of signing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
