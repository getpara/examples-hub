"use client";

import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { usePermitSigning } from "@/hooks/usePermitSigning";

export default function PermitSigningPage() {
  const account = useAccount();
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Permit Signing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an ERC20 permit to allow the contract owner to transfer your CTT tokens. This demonstrates the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">ERC20Permit</code>{" "}
          functionality.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Your CTT Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!account?.isConnected
                    ? "Please connect your wallet"
                    : isDataLoading
                      ? "Loading..."
                      : tokenBalance
                        ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                        : "Unable to fetch balance"}
                </p>
              </div>
              <button
                onClick={fetchTokenData}
                disabled={isDataLoading || !account?.isConnected}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh data">
                <span className={`inline-block ${isDataLoading ? "animate-spin" : ""}`}>&#8635;</span>
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Owner Allowance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!account?.isConnected
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
          disabled={!isReady || !account?.isConnected}
          loadingText="Signing Permit...">
          Sign Permit
        </ActionButton>

        {signedPermit && (
          <div className="mt-8 space-y-4">
            <Card title="Signed Permit Data">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Deadline:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.deadline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">v:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.v}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">r:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.r}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">s:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.s}</p>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
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
